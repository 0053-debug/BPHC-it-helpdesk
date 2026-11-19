import React, { useEffect, useState, useRef } from 'react';
import { MessageCircle, Send, Sparkles, X, Bot, User as UserIcon, HelpCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

const readable = (value = '') => value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatDate = (value) => value ? new Date(value).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'not set';

export default function TicketChatWidget({ incidents, selected }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Hey, I'm Desk Buddy. Ticket queues can be a bit of a maze, so ask me about your ticket status, SLA deadlines, priority, campus services, or common fixes."
    }
  ]);
  const [visibleTickets, setVisibleTickets] = useState(incidents || []);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setVisibleTickets(incidents || []);
  }, [incidents]);

  const fetchTickets = () => {
    api.get('/incidents')
      .then(({ data }) => {
        if (Array.isArray(data)) setVisibleTickets(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (open) {
      fetchTickets();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const answer = (rawQuestion) => {
    const text = rawQuestion.trim();
    if (!text) return;
    const lower = text.toLowerCase();
    let reply = '';

    // Extract ticket reference (e.g., INC-20261119-FE8833A6 or numeric ID)
    const reference = text.match(/INC-\d{8}-[A-Z0-9]+|\b\d+\b/i)?.[0];
    const latestSelected = selected && visibleTickets.find((item) => Number(item.id) === Number(selected.id));
    const targetTicket = reference
      ? visibleTickets.find((item) => String(item.id) === reference || item.trackingNumber?.toLowerCase() === reference.toLowerCase())
      : latestSelected || selected || visibleTickets[0];

    // 1. Casual / Chit-chat / Identity
    if (/^(hi|hello|hey|yo|sup|greetings|hola|good (morning|afternoon|evening))\b/i.test(lower)) {
      reply = "Hello there! How's your day going? You can ask me to look up any ticket, explain campus IT policies, or diagnose an issue.";
    } else if (/(how are you|how're you|how do you do|hows it going|how's it going|whats up|what's up)/i.test(lower)) {
      reply = "All good here. My little status light is green, so let's sort through that ticket.";
    } else if (/(who are you|what is your name|who made you|are you (a bot|a chatbot|automated|human|sentient))/i.test(lower)) {
      reply = "I'm Desk Buddy, the BPHC HelpDesk guide. I can look up ticket details available in this workspace and explain the service desk's priorities and support timelines.";
    } else if (/(thank|thanks|thx|awesome|great|cool|good job|nice|appreciate)/i.test(lower)) {
      reply = "You're very welcome! If you need anything else, I'm right here.";
    } else if (/(joke|tell me a joke|make me laugh)/i.test(lower)) {
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs.",
        "There are 10 types of people: those who understand binary, and those who don't.",
        "A technician walks into a bar, orders a beer, then asks for 999,999 more. That's one way to test capacity."
      ];
      reply = jokes[Math.floor(Math.random() * jokes.length)];
    }

    // 2. Capabilities & Bot Features
    else if (/(what can you do|capabilities|capability|features|help|commands|what do you do|menu)/i.test(lower)) {
      reply = "I can help with:\n" +
              "- Ticket status: ask 'My open tickets' or enter a tracking number\n" +
              "- SLA targets: ask 'What is the SLA policy?'\n" +
              "- Priorities: ask 'How is priority calculated?'\n" +
              "- Campus services: ask 'What services are supported?'\n" +
              "- Wi-Fi or VPN: ask 'Wi-Fi issues'\n" +
              "- Account access: ask 'How do I reset my password?'\n" +
              "- Form trouble: ask 'Why did ticket submission fail?'";
    }

    // 3. SLA Knowledge Base
    else if (/(what is sla|sla policy|sla target|sla rules|sla time|sla levels|resolution time|response time)/i.test(lower)) {
      reply = "Campus IT Service Level Agreement (SLA) Targets:\n\n" +
              "P1 Critical: 5-min response / 30-min resolution (campus-wide outages)\n" +
              "P2 High: 15-min response / 2-hr resolution (department or critical services)\n" +
              "P3 Medium: 1-hr response / 8-hr resolution (single user work blocked)\n" +
              "P4 Low: 4-hr response / 24-hr resolution (general queries and requests)\n\n" +
              "If a ticket breaches its resolution deadline, the system automatically marks it breached and escalates it to the IT manager.";
    }

    // 4. Priority Scoring Algorithm
    else if (/(how is priority|priority formula|priority score|calculation|algorithm|priority matrix)/i.test(lower)) {
      reply = "Priority is calculated by the backend using impact, urgency, and service details:\n\n" +
              "Priority Score = Impact × Urgency × Service Criticality + Service Weight.\n\n" +
              "- Score ≥ 24: P1 Critical\n" +
              "- Score ≥ 14: P2 High\n" +
              "- Score ≥ 6: P3 Medium\n" +
              "- Score below 6: P4 Low\n\n" +
              "Impact uses 1 for an individual, 2 for a department, and 4 for a campus-wide issue. Urgency ranges from LOW (1) to CRITICAL (4).";
    }

    // 5. Campus Services & Common Issues (Wi-Fi, ERP, Password, VPN)
    else if (/(wifi|wi-fi|internet|eduroam|lan|network|vpn)/i.test(lower)) {
      reply = "Campus Connectivity Tips:\n" +
              "- Wi-Fi: Connect to 'BPHC-Student' or 'eduroam' using your BITS email and network password.\n" +
              "- VPN: Required when accessing ERP or campus library databases from outside the campus network.\n" +
              "- Still down? Submit a ticket under category 'NETWORK' and choose the relevant affected service.";
    } else if (/(password|reset password|forgot password|ldap|sso|login issue)/i.test(lower) && !/register/i.test(lower)) {
      reply = "Account & Password Help:\n" +
              "- Central Authentication uses Campus SSO / LDAP.\n" +
              "- To reset your credentials, visit the campus IT self-service portal or submit an authentication ticket.";
    } else if (/(erp|student portal|moodle|cms|grade)/i.test(lower)) {
      reply = "ERP & Student Portal Support:\n" +
              "- If ERP shows a blank page or an expired session, try clearing your browser cache or opening a private window.\n" +
              "- For registration holds or grade sync errors, report an issue for the ERP and student portal.";
    } else if (/(services|service catalog|what services|supported services|affected service)/i.test(lower)) {
      reply = "Supported Campus Services in the Catalog:\n" +
              "1. Central Authentication (SSO / LDAP)\n" +
              "2. Corporate Network & Campus VPN\n" +
              "3. Enterprise PostgreSQL Database Cluster\n" +
              "4. Enterprise ERP & Student Portal\n" +
              "5. Cloud Storage & File Share\n" +
              "6. Developer & CI/CD Platform";
    }

    // 6. Troubleshooting & Error Reporting
    else if (/(error|fail|cant submit|can't submit|broken|unexpected|problem submitting|register failed)/i.test(lower)) {
      reply = "Issue Submission Troubleshooting:\n" +
              "1. Title must be at least 3 characters and description must not be empty.\n" +
              "2. Ensure you have chosen an Affected Service from the dropdown.\n" +
              "3. If no technicians are on shift for your category, the ticket is safely saved in CLASSIFIED status and will be auto-assigned when a technician checks in.\n" +
              "4. If you see 'Registration failed', the email may already be registered. Try logging in or use another email.";
    }

    // 7. Ticket counts & listing
    else if (/(my tickets|how many|open tickets|ticket count|list tickets|all tickets|show tickets)/i.test(lower)) {
      const open = visibleTickets.filter((t) => !['CLOSED', 'VERIFIED'].includes(t.status));
      const breached = visibleTickets.filter((t) => t.slaBreached);
      if (visibleTickets.length === 0) {
        reply = "You currently have 0 tickets in your view. Use the 'Report an incident' form on this page to create one, and I'll track it in real time!";
      } else {
        const top3 = visibleTickets.slice(0, 3).map((t) => `- ${t.trackingNumber}: "${t.title}" (${readable(t.status)} - ${readable(t.priority)})`).join('\n');
        reply = `You have ${visibleTickets.length} total ticket${visibleTickets.length === 1 ? '' : 's'} (${open.length} active, ${breached.length} breached):\n\n${top3}` +
                (visibleTickets.length > 3 ? `\n...and ${visibleTickets.length - 3} more.` : '');
      }
    }

    // 8. Specific Ticket Inquiry (Status, Technician, Deadlines, Details)
    else if (targetTicket && /(status|where|progress|update|next|happen|resolution|resolved|close|verify|technician|assigned|who|deadline|sla|when|detail)/i.test(lower)) {
      if (/(deadline|sla|due|late|breach)/i.test(lower)) {
        reply = targetTicket.slaBreached
          ? `Ticket ${targetTicket.trackingNumber} has breached its SLA. The resolution target was ${formatDate(targetTicket.resolutionDeadline)}.`
          : `Ticket ${targetTicket.trackingNumber} SLA targets:\n- Response deadline: ${formatDate(targetTicket.responseDeadline)}\n- Resolution deadline: ${formatDate(targetTicket.resolutionDeadline)}`;
      } else if (/(technician|assigned|who)/i.test(lower)) {
        reply = targetTicket.technicianName
          ? `Ticket ${targetTicket.trackingNumber} is assigned to technician ${targetTicket.technicianName}.`
          : `Ticket ${targetTicket.trackingNumber} is in ${readable(targetTicket.status)} state and is queued for technician assignment.`;
      } else if (/(resolution|resolved|fix|root cause)/i.test(lower) && targetTicket.resolutionNotes) {
        reply = `Ticket ${targetTicket.trackingNumber} Resolution:\n"${targetTicket.resolutionNotes}"` +
                (targetTicket.rootCause ? `\nRoot Cause: ${targetTicket.rootCause}` : '');
      } else {
        const nextStepMap = {
          NEW: 'Ticket created, pending automated classification.',
          CLASSIFIED: 'Classified by system, queued for available technician matching.',
          ASSIGNED: 'Assigned to technician, waiting for acknowledgement.',
          ACKNOWLEDGED: 'Technician acknowledged the incident and is preparing investigation.',
          IN_PROGRESS: 'Technician is actively investigating the issue.',
          RESOLVED: 'Resolution submitted! Please review and verify it.',
          VERIFIED: 'Resolution verified! The ticket can now be closed.',
          CLOSED: 'This incident has been resolved and closed.'
        };
        const nextStep = nextStepMap[targetTicket.status] || 'Check the ticket details for recent comments.';
        reply = `Ticket ${targetTicket.trackingNumber} ("${targetTicket.title}"):\n` +
                `- Status: ${readable(targetTicket.status)}\n` +
                `- Priority: ${readable(targetTicket.priority)} (Score: ${targetTicket.priorityScore ?? 'N/A'})\n` +
                `- Assigned technician: ${targetTicket.technicianName || 'Queued'}\n` +
                `- Next step: ${nextStep}`;
      }
    }

    // 9. If a specific ticket ID was mentioned
    else if (reference && targetTicket) {
      reply = `Ticket ${targetTicket.trackingNumber} ("${targetTicket.title}"):\n` +
              `- Status: ${readable(targetTicket.status)}\n` +
              `- Priority: ${readable(targetTicket.priority)} (Score: ${targetTicket.priorityScore ?? 'N/A'})\n` +
              `- Category: ${targetTicket.category || 'N/A'}\n` +
              `- Assigned to: ${targetTicket.technicianName || 'Queued for technician'}\n` +
              `- Resolution deadline: ${formatDate(targetTicket.resolutionDeadline)}`;
    }

    // 10. Default / Fallback - Conversational, helpful, and non-repetitive
    else {
      reply = "I didn't quite catch that, but here are some things I can help with:\n" +
              "- 'My open tickets' - list your current incidents\n" +
              "- 'SLA Policy' - view resolution and response deadlines\n" +
              "- 'How is priority calculated?' - understand P1 to P4 scoring\n" +
              "- 'Wi-Fi issues' or 'Reset password' - common campus guides\n" +
              "Or enter a ticket tracking number like 'INC-...' for details!";
    }

    setMessages((items) => [...items, { from: 'you', text }, { from: 'bot', text: reply }]);
    setQuestion('');
  };

  return (
    <>
      {open && (
        <section id="desk-buddy-panel" role="dialog" aria-modal="false" aria-label="Desk Buddy ticket guide" className="chat-panel fixed bottom-24 right-5 z-50 flex flex-col overflow-hidden rounded-card border border-rule bg-panel">
          <header className="chat-panel__header flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="chat-avatar w-8 h-8 rounded-control flex items-center justify-center border border-rule">
                  <Sparkles className="h-4 w-4 text-person" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-chip bg-success-soft border-2 border-instrument" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight flex items-center gap-1.5">
                  Desk Buddy
                </p>
                <p className="text-xs text-secondary">Ticket guide · Ready</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={fetchTickets}
                title="Refresh ticket data"
                aria-label="Refresh ticket data"
                className="chat-tool-button"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="chat-tool-button"
              >
                <X size={16} />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-inset p-3.5 text-xs" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${message.from === 'you' ? 'justify-end' : 'justify-start'}`}
              >
                {message.from === 'bot' && (
                  <div className="chat-avatar chat-avatar--small w-7 h-7 rounded-control flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={15} />
                  </div>
                )}
                <div
                  className={`chat-message max-w-[85%] whitespace-pre-wrap px-3 py-2 text-xs leading-relaxed ${
                    message.from === 'you'
                      ? 'chat-message--user font-medium'
                      : 'chat-message--guide'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick action suggestion pills */}
          <div className="border-t border-rule bg-inset px-3 py-2">
            <p className="text-xs font-semibold text-muted mb-1.5">Try asking</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                'My open tickets',
                'What is the SLA policy?',
                'How is priority calculated?',
                'Campus services',
                'Wi-Fi help',
                'Tell me a joke'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => answer(suggestion)}
                  className="chat-suggestion rounded-control border border-rule bg-panel px-2.5 py-1 text-xs font-medium text-secondary"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              answer(question);
            }}
            className="flex gap-2 border-t border-rule p-3 bg-panel"
          >
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={240}
              aria-label="Ask Desk Buddy"
              placeholder="Ask about tickets, SLA, priority, or Wi-Fi"
              className="min-w-0 flex-1 rounded-control border border-rule-strong px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-focus"
            />
            <button
              type="submit"
              disabled={!question.trim()}
              aria-label="Send message"
              className="primary-action rounded-control px-3.5 disabled:opacity-40 flex items-center justify-center"
            >
              <Send size={15} />
            </button>
          </form>
        </section>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Close Desk Buddy' : 'Open Desk Buddy'}
        aria-expanded={open}
        aria-controls="desk-buddy-panel"
        className="chat-launcher fixed bottom-5 right-5 z-50 flex items-center justify-center rounded-control focus:outline-none focus:ring-4 focus:ring-focus"
        title="Open Desk Buddy"
      >
        {open ? <X size={21} aria-hidden="true" /> : <MessageCircle size={21} aria-hidden="true" />}
      </button>
    </>
  );
}
