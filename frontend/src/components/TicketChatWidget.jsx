import React, { useEffect, useState } from 'react';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import api from '../services/api';

const readable = (value = '') => value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatDate = (value) => value ? new Date(value).toLocaleString() : 'not set';

export default function TicketChatWidget({ incidents, selected }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hey! I’m Desk Buddy 🛠️ Ask me about a ticket you can see, its status, SLA deadline, or what happens next.' }]);
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
    if (/(help|what can|commands|do you do)/.test(lower)) {
      reply = 'I can check a visible ticket’s status, technician, SLA deadline, resolution, or the next step. Try “status” or “what happens next?”';
    } else if (/(my tickets|how many|open tickets|ticket count)/.test(lower)) {
      const openTickets = visibleTickets.filter((item) => !['CLOSED', 'VERIFIED'].includes(item.status));
      reply = `I can see ${visibleTickets.length} ticket${visibleTickets.length === 1 ? '' : 's'} in this list with the current filters; ${openTickets.length} still need attention. Tiny queue, big clipboard energy. 📋`;
    } else if (ticket && /(status|where|progress|update|next|happen|resolution|resolved|close|verify)/.test(lower)) {
      const nextStep = ({
        NEW: 'The ticket is waiting to be classified.', CLASSIFIED: 'It is classified and waiting for an available technician.',
        ASSIGNED: 'The assigned technician needs to acknowledge it.', ACKNOWLEDGED: 'The technician has acknowledged it and can begin investigating.',
        IN_PROGRESS: 'The technician is investigating. You can add an update in the ticket thread.',
        RESOLVED: 'Please check the resolution and verify it if the issue is fixed.',
        VERIFIED: 'The resolution is verified; you can close the ticket.', CLOSED: 'This ticket is closed. It has earned a well-deserved rest.'
      })[ticket.status] || 'Open the ticket for the latest details.';
      if (/(deadline|sla|due|late|breach)/.test(lower)) {
        reply = ticket.slaBreached
          ? `The system has marked ${ticket.trackingNumber} as SLA-breached. Its resolution target was ${formatDate(ticket.resolutionDeadline)}.`
          : `${ticket.trackingNumber} is ${ticket.resolutionDeadline ? `currently due for resolution by ${formatDate(ticket.resolutionDeadline)}` : 'not showing a resolution deadline'}.`;
      } else if (/(technician|assigned|who)/.test(lower)) {
        reply = ticket.technicianName ? `${ticket.trackingNumber} is assigned to ${ticket.technicianName}.` : `${ticket.trackingNumber} has no technician assigned yet.`;
      } else if (/(resolution|resolved)/.test(lower) && ticket.resolutionNotes) {
        reply = `${ticket.trackingNumber}: ${ticket.resolutionNotes}${ticket.rootCause ? ` Root cause: ${ticket.rootCause}` : ''}`;
      } else {
        reply = `${ticket.trackingNumber} is ${readable(ticket.status)}. ${nextStep}`;
      }
    } else if (ticket) {
      reply = `I found ${ticket.trackingNumber} (“${ticket.title}”): ${readable(ticket.status)}, priority ${readable(ticket.priority)}. Ask me about its deadline or next step.`;
    } else {
      reply = 'I couldn’t find that ticket in the incidents available to you. Pick one from the list, or include its incident ID. I promise the wrench is only decorative. 🔧';
    }
    setMessages((items) => [...items, { from: 'you', text }, { from: 'bot', text: reply }]);
    setQuestion('');
  };

  return <>
    {open && <section aria-label="Ticket chat" className="fixed bottom-24 right-5 z-50 flex h-[min(34rem,calc(100vh-8rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <header className="flex items-center justify-between bg-blue-700 px-4 py-3 text-white"><div className="flex items-center gap-2"><Sparkles className="h-5 w-5" /><div><p className="font-semibold">Desk Buddy</p><p className="text-xs text-blue-100">Ticket status, minus the phone hold music</p></div></div><button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded p-1 hover:bg-blue-600"><X size={18} /></button></header>
      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3" aria-live="polite">{messages.map((message, index) => <p key={index} className={`max-w-[90%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${message.from === 'you' ? 'ml-auto bg-blue-700 text-white' : 'mr-auto border border-slate-200 bg-white text-slate-700'}`}>{message.text}</p>)}
        <div className="flex flex-wrap gap-2">{['Status?', 'What happens next?', 'My open tickets'].map((suggestion) => <button key={suggestion} onClick={() => answer(suggestion)} className="rounded-full border border-blue-200 bg-white px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-50">{suggestion}</button>)}</div>
      </div>
      <form onSubmit={(event) => { event.preventDefault(); answer(question); }} className="flex gap-2 border-t p-3"><input value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={240} aria-label="Ask Desk Buddy" placeholder="Ask about a ticket…" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" /><button aria-label="Send message" className="rounded-lg bg-blue-700 px-3 text-white hover:bg-blue-800"><Send size={17} /></button></form>
    </section>}
    <button onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close ticket chat' : 'Open ticket chat'} className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg transition hover:scale-105 hover:bg-blue-800"><MessageCircle size={24} /></button>
  </>;
}
