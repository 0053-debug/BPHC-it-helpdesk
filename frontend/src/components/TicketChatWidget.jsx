import React, { useEffect, useState } from 'react';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import api from '../services/api';

const readable = (value = '') => value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatDate = (value) => value ? new Date(value).toLocaleString() : 'not set';

export default function TicketChatWidget({ incidents, selected }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hey! I'm Desk Buddy 🛠️ Ask me about your tickets, current status, SLA deadlines, technician assignment, or help with reporting an incident!" }
  ]);
  const [visibleTickets, setVisibleTickets] = useState(incidents || []);

  useEffect(() => setVisibleTickets(incidents || []), [incidents]);
  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    api.get('/incidents').then(({ data }) => { if (active) setVisibleTickets(data); }).catch(() => {});
    return () => { active = false; };
  }, [open]);

  const answer = (rawQuestion) => {
    const text = rawQuestion.trim();
    if (!text) return;
    const lower = text.toLowerCase();
    const reference = text.match(/INC-\d{8}-[A-Z0-9]+|\b\d+\b/i)?.[0];
    const latestSelected = selected && visibleTickets.find((item) => Number(item.id) === Number(selected.id));
    const ticket = (reference && visibleTickets.find((item) =>
      String(item.id) === reference || item.trackingNumber?.toLowerCase() === reference.toLowerCase())) || latestSelected || selected || visibleTickets[0];
    let reply;

    if (/(error|fail|issue|problem|broken|cant submit|can't submit|unexpected)/.test(lower)) {
      reply = 'If you run into an error submitting a ticket: make sure Title, Description, and Affected Service are selected. The system automatically classifies priority and assigns an available technician!';
    } else if (/(help|what can|commands|do you do|who are you)/.test(lower)) {
      reply = 'I can help you check ticket progress, assigned technicians, SLA deadlines, or incident summaries. Try asking: "My open tickets", "Latest ticket status", or "SLA deadline".';
    } else if (/(my tickets|how many|open tickets|ticket count|list)/.test(lower)) {
      const openTickets = visibleTickets.filter((item) => !['CLOSED', 'VERIFIED'].includes(item.status));
      reply = `You have ${visibleTickets.length} ticket${visibleTickets.length === 1 ? '' : 's'} in total (${openTickets.length} currently open).${visibleTickets.length > 0 ? ` Latest: ${visibleTickets[0].trackingNumber} ("${visibleTickets[0].title}") - ${readable(visibleTickets[0].status)}.` : ''}`;
    } else if (ticket && /(status|where|progress|update|next|happen|resolution|resolved|close|verify)/.test(lower)) {
      const nextStep = ({
        NEW: 'The ticket is waiting to be classified.',
        CLASSIFIED: 'It is classified and waiting for technician assignment.',
        ASSIGNED: 'The assigned technician needs to acknowledge it.',
        ACKNOWLEDGED: 'The technician has acknowledged it and is investigating.',
        IN_PROGRESS: 'The technician is actively investigating.',
        RESOLVED: 'Resolution submitted! Please review and verify it.',
        VERIFIED: 'The resolution is verified; it can now be closed.',
        CLOSED: 'This ticket has been resolved and closed.'
      })[ticket.status] || 'Check the ticket details for recent comments.';

      if (/(deadline|sla|due|late|breach)/.test(lower)) {
        reply = ticket.slaBreached
          ? `⚠️ SLA Breached: Resolution target was ${formatDate(ticket.resolutionDeadline)}.`
          : `Target resolution deadline: ${formatDate(ticket.resolutionDeadline)}.`;
      } else if (/(technician|assigned|who)/.test(lower)) {
        reply = ticket.technicianName ? `Assigned to: ${ticket.technicianName}.` : `No technician assigned yet. It is queued in ${readable(ticket.status)}.`;
      } else if (/(resolution|resolved)/.test(lower) && ticket.resolutionNotes) {
        reply = `Resolution notes: ${ticket.resolutionNotes}${ticket.rootCause ? ` (Root cause: ${ticket.rootCause})` : ''}`;
      } else {
        reply = `Ticket ${ticket.trackingNumber} is currently ${readable(ticket.status)}. ${nextStep}`;
      }
    } else if (ticket) {
      reply = `Ticket ${ticket.trackingNumber} ("${ticket.title}"): ${readable(ticket.status)}, Priority: ${readable(ticket.priority)}. ${ticket.technicianName ? `Assigned to ${ticket.technicianName}.` : 'Waiting for technician.'}`;
    } else {
      reply = 'No tickets found yet. You can submit one using the form on this page, and I will track its status for you!';
    }

    setMessages((items) => [...items, { from: 'you', text }, { from: 'bot', text: reply }]);
    setQuestion('');
  };

  return (
    <>
      {open && (
        <section aria-label="Ticket chat" className="fixed bottom-24 right-5 z-50 flex h-[min(34rem,calc(100vh-8rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <header className="flex items-center justify-between bg-blue-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-300" />
              <div>
                <p className="font-semibold text-sm">Desk Buddy</p>
                <p className="text-xs text-blue-100">ITSM Assistant</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded p-1 hover:bg-blue-600 transition">
              <X size={18} />
            </button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3" aria-live="polite">
            {messages.map((message, index) => (
              <p
                key={index}
                className={`max-w-[90%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm shadow-sm ${
                  message.from === 'you'
                    ? 'ml-auto bg-blue-700 text-white'
                    : 'mr-auto border border-slate-200 bg-white text-slate-700'
                }`}
              >
                {message.text}
              </p>
            ))}
            <div className="flex flex-wrap gap-2 pt-2">
              {['My open tickets', 'Latest ticket status', 'What can you do?'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => answer(suggestion)}
                  className="rounded-full border border-blue-200 bg-white px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-50 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
          <form onSubmit={(event) => { event.preventDefault(); answer(question); }} className="flex gap-2 border-t p-3 bg-white">
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={240}
              aria-label="Ask Desk Buddy"
              placeholder="Ask about a ticket or status…"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button aria-label="Send message" className="rounded-lg bg-blue-700 px-3 text-white hover:bg-blue-800 transition">
              <Send size={17} />
            </button>
          </form>
        </section>
      )}
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Close Desk Buddy' : 'Open Desk Buddy'}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg transition hover:scale-105 hover:bg-blue-800"
        title="Open Desk Buddy"
      >
        <MessageCircle size={24} />
      </button>
    </>
  );
}
