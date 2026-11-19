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
      text: "👋 Hi! I'm Desk Buddy, your AI ITSM assistant.\nAsk me about your tickets, SLA deadlines, priority calculation, campus IT services, or error troubleshooting!"
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
      reply = "I'm running great and fully synchronized with the campus ITSM system! Ready to help you track tickets, check technician status, or answer questions.";
    } else if (/(who are you|what is your name|who made you|are you (ai|a bot|human|sentient))/i.test(lower)) {
      reply = "I am Desk Buddy, the dedicated AI assistant for BPHC IT HelpDesk. I'm connected to the real-time ticket database, SLA engine, and priority scoring algorithms to help students, faculty, and technicians.";
    } else if (/(thank|thanks|thx|awesome|great|cool|good job|nice|appreciate)/i.test(lower)) {
      reply = "You're very welcome! If you need anything else, I'm right here.";
    } else if (/(joke|tell me a joke|make me laugh)/i.test(lower)) {
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs! 🪲",
        "There are 10 types of people in the world: those who understand binary, and those who don't. 💻",
        "A technician walks into a bar and orders a beer. Orders 0 beers. Orders 999999 beers. Orders a lizard. Orders -1 beers. Everything passes QA! 🍺"
      ];
      reply = jokes[Math.floor(Math.random() * jokes.length)];
    }

    // 2. Capabilities & Bot Features
    else if (/(what can you do|capabilities|capability|features|help|commands|what do you do|menu)/i.test(lower)) {
      reply = "Here is what I can do for you:\n" +
              "• 🎫 Ticket Status: Ask 'My open tickets', 'Latest ticket status', or give an ID like 'INC-20261119-FE8833A6'\n" +
              "• ⏱️ SLA Policies: Ask 'What is the SLA policy?' or 'Response times'\n" +
              "• ⚖️ Priority Math: Ask 'How is priority calculated?'\n" +
              "• 🏢 Campus Services: Ask 'What services are supported?'\n" +
              "• 🌐 Wi-Fi / VPN: Ask 'Wi-Fi issues' or 'How to connect to VPN'\n" +
              "• 🔑 Password Reset: Ask 'How to reset password'\n" +
              "• 🛠️ Error Help: Ask 'Why did ticket submission fail?'";
    }

    // 3. SLA Knowledge Base
    else if (/(what is sla|sla policy|sla target|sla rules|sla time|sla levels|resolution time|response time)/i.test(lower)) {
      reply = "Campus IT Service Level Agreement (SLA) Targets:\n\n" +
              "🔴 P1 Critical: 5-min response / 30-min resolution (Campus-wide outages)\n" +
              "🟠 P2 High: 15-min response / 2-hr resolution (Department / Critical services)\n" +
              "🟡 P3 Medium: 1-hr response / 8-hr resolution (Single user work blocked)\n" +
              "🟢 P4 Low: 4-hr response / 24-hr resolution (General queries & requests)\n\n" +
              "If a ticket breaches its resolution deadline, the system automatically marks it breached and escalates it to the IT manager.";
    }

    // 4. Priority Scoring Algorithm
    else if (/(how is priority|priority formula|priority score|calculation|algorithm|priority matrix)/i.test(lower)) {
      reply = "Priority is calculated dynamically by the backend using:\n\n" +
              "Priority Score = (Impact Factor × Urgency Factor × Service Criticality) + SLA Weight.\n\n" +
              "• Score ≥ 20 ➜ P1 Critical\n" +
              "• Score 12 – 19 ➜ P2 High\n" +
              "• Score 6 – 11 ➜ P3 Medium\n" +
              "• Score < 6 ➜ P4 Low\n\n" +
              "Impact ranges from USER (1) to CAMPUS (4). Urgency ranges from LOW (1) to CRITICAL (4).";
    }

    // 5. Campus Services & Common Issues (Wi-Fi, ERP, Password, VPN)
    else if (/(wifi|wi-fi|internet|eduroam|lan|network|vpn)/i.test(lower)) {
      reply = "Campus Connectivity Tips:\n" +
              "• Wi-Fi SSIDs: Connect to 'BPHC-Student' or 'eduroam' using your BITS email and network password.\n" +
              "• Fortinet/VPN: Required when accessing ERP or campus library databases from outside the campus network.\n" +
              "• Still down? Submit a ticket under category 'NETWORK' with Affected Service set to 'Corporate Network & Campus VPN'.";
    } else if (/(password|reset password|forgot password|ldap|sso|login issue)/i.test(lower) && !/register/i.test(lower)) {
      reply = "Account & Password Help:\n" +
              "• Central Authentication uses Campus SSO / LDAP.\n" +
              "• To reset your credentials, visit the campus IT self-service portal or submit a ticket under 'Central Authentication (SSO / LDAP)' with category 'ACCESS'.";
    } else if (/(erp|student portal|moodle|cms|grade)/i.test(lower)) {
      reply = "ERP & Student Portal Support:\n" +
              "• If ERP shows blank pages or session expired, try clearing your browser cache or opening an Incognito window.\n" +
              "• For registration holds or grade sync errors, submit an incident for 'Enterprise ERP & Student Portal'.";
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
        const top3 = visibleTickets.slice(0, 3).map((t) => `• ${t.trackingNumber}: "${t.title}" (${readable(t.status)} - ${readable(t.priority)})`).join('\n');
        reply = `You have ${visibleTickets.length} total ticket${visibleTickets.length === 1 ? '' : 's'} (${open.length} active, ${breached.length} breached):\n\n${top3}` +
                (visibleTickets.length > 3 ? `\n...and ${visibleTickets.length - 3} more.` : '');
      }
    }

    // 8. Specific Ticket Inquiry (Status, Technician, Deadlines, Details)
    else if (targetTicket && /(status|where|progress|update|next|happen|resolution|resolved|close|verify|technician|assigned|who|deadline|sla|when|detail)/i.test(lower)) {
      if (/(deadline|sla|due|late|breach)/i.test(lower)) {
        reply = targetTicket.slaBreached
          ? `⚠️ Ticket ${targetTicket.trackingNumber} has breached its SLA! Target resolution was ${formatDate(targetTicket.resolutionDeadline)}.`
          : `Ticket ${targetTicket.trackingNumber} SLA Target:\n• Response Deadline: ${formatDate(targetTicket.responseDeadline)}\n• Resolution Deadline: ${formatDate(targetTicket.resolutionDeadline)}`;
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
                `• Status: ${readable(targetTicket.status)}\n` +
                `• Priority: ${readable(targetTicket.priority)} (Score: ${targetTicket.priorityScore ?? 'N/A'})\n` +
                `• Assigned Technician: ${targetTicket.technicianName || 'Queued'}\n` +
                `• Next Step: ${nextStep}`;
      }
    }

    // 9. If a specific ticket ID was mentioned
    else if (reference && targetTicket) {
      reply = `Ticket ${targetTicket.trackingNumber} ("${targetTicket.title}"):\n` +
              `• Status: ${readable(targetTicket.status)}\n` +
              `• Priority: ${readable(targetTicket.priority)} (Score: ${targetTicket.priorityScore ?? 'N/A'})\n` +
              `• Category: ${targetTicket.category || 'N/A'}\n` +
              `• Assigned to: ${targetTicket.technicianName || 'Queued for technician'}\n` +
              `• Resolution Deadline: ${formatDate(targetTicket.resolutionDeadline)}`;
    }

    // 10. Default / Fallback - Conversational, helpful, and non-repetitive
    else {
      reply = "I didn't quite catch that, but here are some things I can help with:\n" +
              "• 'My open tickets' — list your current incidents\n" +
              "• 'SLA Policy' — view resolution & response deadlines\n" +
              "• 'How is priority calculated?' — understand P1-P4 scoring\n" +
              "• 'Wi-Fi issues' or 'Reset password' — common campus guides\n" +
              "Or enter a ticket tracking number like 'INC-...' for details!";
    }

    setMessages((items) => [...items, { from: 'you', text }, { from: 'bot', text: reply }]);
    setQuestion('');
  };

  return (
    <>
      {open && (
        <section aria-label="Ticket chat" className="fixed bottom-24 right-5 z-50 flex h-[min(38rem,calc(100vh-8rem))] w-[min(26rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all">
          <header className="flex items-center justify-between bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-blue-800" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight flex items-center gap-1.5">
                  Desk Buddy
                  <span className="rounded bg-blue-500/30 px-1.5 py-0.2 text-[10px] font-normal uppercase tracking-wider text-blue-200">AI</span>
                </p>
                <p className="text-[11px] text-blue-200">ITSM Assistant • Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={fetchTickets}
                title="Refresh ticket data"
                className="rounded p-1.5 hover:bg-white/10 text-blue-200 hover:text-white transition"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded p-1.5 hover:bg-white/10 text-blue-200 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-3.5 text-xs" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${message.from === 'you' ? 'justify-end' : 'justify-start'}`}
              >
                {message.from === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot size={15} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                    message.from === 'you'
                      ? 'bg-blue-600 text-white rounded-br-none font-medium'
                      : 'border border-slate-200 bg-white text-slate-800 rounded-bl-none'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick action suggestion pills */}
          <div className="border-t border-slate-100 bg-slate-50/50 px-3 py-2">
            <p className="text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Quick Suggestions</p>
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
                  className="rounded-full border border-blue-200/80 bg-white px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition shadow-2xs"
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
            className="flex gap-2 border-t border-slate-200 p-3 bg-white"
          >
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={240}
              aria-label="Ask Desk Buddy"
              placeholder="Ask about tickets, SLA, priority, Wi-Fi…"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={!question.trim()}
              aria-label="Send message"
              className="rounded-xl bg-blue-600 px-3.5 text-white hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 transition flex items-center justify-center"
            >
              <Send size={15} />
            </button>
          </form>
        </section>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Close Desk Buddy' : 'Open Desk Buddy'}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
        title="Open Desk Buddy"
      >
        <MessageCircle size={24} />
      </button>
    </>
  );
}
