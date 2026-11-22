import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertTriangle, Send, X, ExternalLink, RefreshCw, Eye } from 'lucide-react';
import {
  sendWelcomeEmail,
  sendTicketCreatedEmail,
  sendTicketProgressEmail,
  sendTicketResolvedEmail,
  sendSlaBreachEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  getEmailDispatchHistory,
} from '../services/emailService';
import {
  generateWelcomeHtml,
  generateTicketCreatedHtml,
  generateTicketProgressHtml,
  generateTicketResolvedHtml,
  generateSlaBreachHtml,
  generatePasswordResetRequestHtml,
  generatePasswordUpdatedHtml,
} from '../services/emailTemplates';

const TEMPLATES = [
  {
    id: 'ticket_created',
    name: 'Ticket Logged / Assigned',
    category: 'Incident Lifecycle',
    badge: 'BLUE',
    generator: () => generateTicketCreatedHtml({
      ticketId: 'INC-20261122-401',
      recipientName: 'Raghuram V',
      ticketTitle: 'Wi-Fi Access Point unreachable in Lab 3',
      ticketPriority: 'HIGH',
      assignedTechnician: 'Network Operations Team',
      ticketUrl: 'https://bphc-it-helpdesk.web.app/?app=console&tab=incidents',
    }),
    dispatch: (email, name) => sendTicketCreatedEmail({
      toEmail: email,
      userName: name,
      ticketId: 'INC-20261122-401',
      title: 'Wi-Fi Access Point unreachable in Lab 3',
      priority: 'HIGH',
      assignedTo: 'Network Operations Team',
    }),
  },
  {
    id: 'ticket_progress',
    name: 'Ticket Status Transition',
    category: 'Technician Workflow',
    badge: 'AMBER',
    generator: () => generateTicketProgressHtml({
      ticketId: 'INC-20261122-401',
      recipientName: 'Raghuram V',
      ticketTitle: 'Wi-Fi Access Point unreachable in Lab 3',
      previousStatus: 'ASSIGNED',
      currentStatus: 'IN_PROGRESS',
      technicianName: 'Alex Tech (Networking)',
      statusNote: 'Rebooted PoE switch module; diagnostics in progress.',
      ticketUrl: 'https://bphc-it-helpdesk.web.app/?app=console&tab=incidents',
    }),
    dispatch: (email, name) => sendTicketProgressEmail({
      toEmail: email,
      userName: name,
      ticketId: 'INC-20261122-401',
      title: 'Wi-Fi Access Point unreachable in Lab 3',
      previousStatus: 'ASSIGNED',
      currentStatus: 'IN_PROGRESS',
      technicianName: 'Alex Tech (Networking)',
      statusNote: 'Rebooted PoE switch module; diagnostics in progress.',
    }),
  },
  {
    id: 'ticket_resolved',
    name: 'Ticket Resolved & Root Cause',
    category: 'Resolution Report',
    badge: 'GREEN',
    generator: () => generateTicketResolvedHtml({
      ticketId: 'INC-20261122-401',
      recipientName: 'Raghuram V',
      ticketTitle: 'Wi-Fi Access Point unreachable in Lab 3',
      technicianName: 'Alex Tech (Networking)',
      resolutionNotes: 'Replaced blown PoE injector fuse and restored Gigabit uplink to switch B-2.',
      rootCause: 'Power surge caused transient hardware trip.',
      ticketUrl: 'https://bphc-it-helpdesk.web.app/?app=console&tab=incidents',
    }),
    dispatch: (email, name) => sendTicketResolvedEmail({
      toEmail: email,
      userName: name,
      ticketId: 'INC-20261122-401',
      title: 'Wi-Fi Access Point unreachable in Lab 3',
      technicianName: 'Alex Tech (Networking)',
      resolutionNotes: 'Replaced blown PoE injector fuse and restored Gigabit uplink to switch B-2.',
      rootCause: 'Power surge caused transient hardware trip.',
    }),
  },
  {
    id: 'sla_breach',
    name: 'SLA Breach Escalation',
    category: 'Urgent Operational Alert',
    badge: 'RED',
    generator: () => generateSlaBreachHtml({
      ticketId: 'INC-20261122-401',
      ticketTitle: 'Core Network Switch Outage',
      priority: 'CRITICAL',
      deadline: 'Exceeded by 14 minutes',
      escalationStatus: 'TIER-2 LEAD ESCALATED',
      slaType: 'Response',
      ticketUrl: 'https://bphc-it-helpdesk.web.app/?app=console&tab=incidents',
    }),
    dispatch: (email, name) => sendSlaBreachEmail({
      toEmail: email,
      userName: name,
      ticketId: 'INC-20261122-401',
      title: 'Core Network Switch Outage',
      priority: 'CRITICAL',
      deadline: 'Exceeded by 14 minutes',
      escalationStatus: 'TIER-2 LEAD ESCALATED',
      slaType: 'Response',
    }),
  },
  {
    id: 'welcome',
    name: 'Welcome / Account Activation',
    category: 'Onboarding',
    badge: 'PURPLE',
    generator: () => generateWelcomeHtml({
      recipientName: 'Raghuram V',
      userEmail: 'raghuramvedantam16@gmail.com',
      userRole: 'Student / Faculty',
      portalUrl: 'https://bphc-it-helpdesk.web.app',
    }),
    dispatch: (email, name) => sendWelcomeEmail({
      toEmail: email,
      userName: name,
      role: 'Student / Faculty',
    }),
  },
  {
    id: 'password_reset_request',
    name: 'Password Reset Token Link',
    category: 'Security & Auth',
    badge: 'BLUE',
    generator: () => generatePasswordResetRequestHtml({
      recipientName: 'Raghuram V',
      resetLink: 'https://bphc-it-helpdesk.web.app/?app=console&tab=reset-password&token=demo-bcrypt-token',
      validMinutes: 15,
    }),
    dispatch: (email, name) => sendPasswordResetEmail({
      toEmail: email,
      resetLink: 'https://bphc-it-helpdesk.web.app/?app=console&tab=reset-password&token=demo-bcrypt-token',
      recipientName: name,
      validMinutes: 15,
    }),
  },
  {
    id: 'password_updated',
    name: 'Password Updated Confirmation',
    category: 'Security Alert',
    badge: 'GREEN',
    generator: () => generatePasswordUpdatedHtml({
      recipientName: 'Raghuram V',
      userEmail: 'raghuramvedantam16@gmail.com',
      changeTime: new Date().toLocaleString(),
    }),
    dispatch: (email, name) => sendPasswordResetSuccessEmail({
      toEmail: email,
      recipientName: name,
      changeTime: new Date().toLocaleString(),
    }),
  },
];

export default function EmailCenterModal({ isOpen, onClose, defaultEmail = '' }) {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [targetEmail, setTargetEmail] = useState(defaultEmail || 'raghuramvedantam16@gmail.com');
  const [targetName, setTargetName] = useState('Campus Member');
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (defaultEmail) setTargetEmail(defaultEmail);
  }, [defaultEmail]);

  useEffect(() => {
    if (isOpen) {
      setHistory(getEmailDispatchHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!targetEmail || !targetEmail.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid recipient email address.' });
      return;
    }

    setSending(true);
    setStatusMessage(null);

    try {
      const res = await selectedTemplate.dispatch(targetEmail, targetName);
      if (res.sent) {
        setStatusMessage({
          type: 'success',
          text: `✓ "${selectedTemplate.name}" dispatched to ${targetEmail} via EmailJS!`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: `Dispatch reported an issue: ${res.error?.text || res.error?.message || 'Check EmailJS configuration.'}`,
        });
      }
      setHistory(getEmailDispatchHistory());
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Error executing email send.' });
    } finally {
      setSending(false);
    }
  };

  const previewHtml = selectedTemplate.generator();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          borderRadius: '12px',
          width: '95%',
          maxWidth: '1100px',
          height: '88vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #334155',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: '#38bdf8', color: '#0f172a', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <Mail size={20} />
            </span>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#f8fafc' }}>
                Email Notification & HTML Template Center
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                Interactive live preview and 1-click test dispatcher for all 7 ITSM templates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Split */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Left: Template Selector & Controls */}
          <div
            style={{
              width: '380px',
              borderRight: '1px solid #334155',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              overflowY: 'auto',
              background: '#131d31',
            }}
          >
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Select ITSM Template (7 Total):
              </label>
              <div style={{ display: 'grid', gap: '6px', marginTop: '8px' }}>
                {TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplate.id === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(tpl);
                        setStatusMessage(null);
                      }}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '1px solid #38bdf8' : '1px solid #1e293b',
                        background: isSelected ? 'rgba(56, 189, 248, 0.12)' : '#1e293b',
                        color: isSelected ? '#38bdf8' : '#cbd5e1',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{tpl.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{tpl.category}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test Send Panel */}
            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '14px', display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                <Send size={14} style={{ color: '#38bdf8' }} />
                <span>Test Dispatch Live:</span>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>Recipient Email:</label>
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="e.g. your-email@gmail.com"
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #334155',
                    background: '#1e293b',
                    color: '#f8fafc',
                    fontSize: '13px',
                    marginTop: '3px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>Recipient Name:</label>
                <input
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  placeholder="Name"
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #334155',
                    background: '#1e293b',
                    color: '#f8fafc',
                    fontSize: '13px',
                    marginTop: '3px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {statusMessage && (
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: statusMessage.type === 'success' ? '#34d399' : '#f87171',
                    border: statusMessage.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    lineHeight: 1.4,
                  }}
                >
                  {statusMessage.text}
                </div>
              )}

              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="primary-action"
                style={{
                  padding: '9px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {sending ? <RefreshCw size={14} className="spin" /> : <Send size={14} />}
                <span>{sending ? 'Sending via EmailJS…' : `Send "${selectedTemplate.name}"`}</span>
              </button>
            </div>

            {/* Recent Session Logs */}
            {history.length > 0 && (
              <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #1e293b' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Session Dispatch Log ({history.length}):
                </span>
                <div style={{ maxHeight: '110px', overflowY: 'auto', marginTop: '6px', display: 'grid', gap: '4px' }}>
                  {history.slice(0, 4).map((h) => (
                    <div
                      key={h.id}
                      style={{
                        fontSize: '11px',
                        background: '#1e293b',
                        padding: '5px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                        {h.type} &rarr; {h.toEmail}
                      </span>
                      <span style={{ color: h.status === 'DELIVERED' ? '#10b981' : '#f87171', fontWeight: 700 }}>
                        {h.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Live HTML Preview */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0f1d' }}>
            <div
              style={{
                padding: '10px 18px',
                borderBottom: '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#0f172a',
                fontSize: '12px',
                color: '#94a3b8',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={14} style={{ color: '#38bdf8' }} />
                <span>Live Responsive Render: <strong>{selectedTemplate.name}</strong></span>
              </div>
              <span style={{ color: '#64748b' }}>Rendered from /frontend/src/services/emailTemplates.js</span>
            </div>

            <div style={{ flex: 1, padding: '16px', overflow: 'hidden' }}>
              <iframe
                title="Email Preview"
                srcDoc={previewHtml}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#0f172a',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
