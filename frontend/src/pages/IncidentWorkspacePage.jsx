import React, { useEffect, useState } from 'react';
import api from '../services/api';
import TicketChatWidget from '../components/TicketChatWidget';
import { sendTicketCreatedEmail, sendTicketProgressEmail, sendTicketResolvedEmail, sendSlaBreachEmail } from '../services/emailService';


const categories = ['HARDWARE', 'SOFTWARE', 'NETWORK', 'DATABASE', 'CLOUD', 'SECURITY', 'AUTHENTICATION', 'APPLICATION', 'STORAGE'];
const urgencies = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const impacts = ['INDIVIDUAL', 'DEPARTMENT', 'ORGANIZATION_WIDE'];

export default function IncidentWorkspacePage({ currentUser }) {
  const [incidents, setIncidents] = useState([]);
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [message, setMessage] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [form, setForm] = useState({ title: '', description: '', serviceId: '', category: 'SOFTWARE', urgency: 'MEDIUM', impact: 'INDIVIDUAL' });
  const [filters, setFilters] = useState({ id: '', dateFrom: '', dateTo: '', status: '', priority: '', category: '', serviceId: '', technicianId: '', slaStatus: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const refresh = async () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
    const { data } = await api.get('/incidents', { params });
    setIncidents(data);
  };
  useEffect(() => {
    api.get('/services').then(({ data }) => { setServices(data); if (data.length) setForm((old) => ({ ...old, serviceId: String(data[0].id) })); }).catch(() => setError('Could not load services.'));
  }, []);
  useEffect(() => { refresh().catch((e) => setError(e.response?.data?.message || 'Could not load incidents.')); }, [filters]);
  useEffect(() => {
    if (!form.serviceId || !form.title.trim() || !form.description.trim()) { setSuggestions([]); return undefined; }
    let active = true;
    const timer = setTimeout(() => api.post('/incidents/recommendations', {
      title: form.title, description: form.description, serviceId: Number(form.serviceId), category: form.category
    }).then(({ data }) => { if (active) setSuggestions(data); }).catch(() => { if (active) setSuggestions([]); }), 400);
    return () => { active = false; clearTimeout(timer); };
  }, [form.title, form.description, form.serviceId, form.category]);
  const openIncident = async (incident) => {
    setSelected(incident);
    try { const { data } = await api.get(`/incidents/${incident.id}/comments`); setComments(data); }
    catch (e) { setError(e.response?.data?.message || 'Could not load incident updates.'); }
    try { const { data: trail } = await api.get(`/incidents/${incident.id}/audit-trail`); setAuditTrail(trail); }
    catch (e) { setAuditTrail([]); }
  };
  const submitIncident = async (event) => {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await api.post('/incidents', { ...form, serviceId: Number(form.serviceId) });
      setForm((old) => ({ ...old, title: '', description: '' })); await refresh(); await openIncident(data);
      const userEmail = currentUser?.email || (JSON.parse(localStorage.getItem('iitsm_user') || '{}')).email;
      if (userEmail) {
        sendTicketCreatedEmail({
          toEmail: userEmail,
          userName: currentUser?.fullName || currentUser?.username || 'User',
          ticketId: data.trackingNumber || data.id,
          title: data.title,
          priority: data.priority,
          assignedTo: data.technicianName || 'Automatic Assignment Pool',
        }).catch((err) => console.warn('Could not dispatch ticket confirmation email:', err));
      }
    } catch (e) { setError(e.response?.data?.message || 'Could not submit incident.'); }
    finally { setLoading(false); }
  };
  const postUpdate = async (event) => {
    event.preventDefault(); if (!selected || !message.trim()) return;
    try { const { data } = await api.post(`/incidents/${selected.id}/comments`, { message }); setComments((old) => [...old, data]); setMessage(''); }
    catch (e) { setError(e.response?.data?.message || 'Could not post update.'); }
  };
  const transition = async (action) => {
    try {
      const prevStatus = selected?.status;
      const { data } = await api.post(`/incidents/${selected.id}/${action}`);
      setSelected(data);
      await refresh();
      try { const { data: trail } = await api.get(`/incidents/${selected.id}/audit-trail`); setAuditTrail(trail); } catch (e) {}
      const userEmail = currentUser?.email || (JSON.parse(localStorage.getItem('iitsm_user') || '{}')).email;
      if (userEmail) {
        sendTicketProgressEmail({
          toEmail: userEmail,
          userName: currentUser?.fullName || 'User',
          ticketId: data.trackingNumber || data.id,
          title: data.title,
          previousStatus: prevStatus,
          currentStatus: data.status,
          statusNote: `Ticket transitioned via ${action}`,
          technicianName: data.technicianName || 'Specialist',
        }).catch((err) => console.warn('Progress email dispatch failed:', err));
      }
    } catch (e) { setError(e.response?.data?.message || `Could not ${action} incident.`); }
  };
  const employee = currentUser?.role === 'ROLE_EMPLOYEE';
  const assignedTechnician = currentUser?.role === 'ROLE_TECHNICIAN' && Number(selected?.technicianId) === Number(currentUser.id);
  const resolveIncident = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post(`/incidents/${selected.id}/resolve`, { resolutionNotes, rootCause });
      setSelected(data);
      await refresh();
      const userEmail = currentUser?.email || (JSON.parse(localStorage.getItem('iitsm_user') || '{}')).email;
      if (userEmail) {
        sendTicketResolvedEmail({
          toEmail: userEmail,
          userName: currentUser?.fullName || 'User',
          ticketId: data.trackingNumber || data.id,
          title: data.title,
          resolutionNotes,
          rootCause,
          technicianName: data.technicianName || 'Specialist',
        }).catch((err) => console.warn('Resolved email dispatch failed:', err));
      }
    } catch (e) { setError(e.response?.data?.message || 'Could not resolve incident.'); }
  };

  return <div className="space-y-8">
    <header className="screen-heading"><div><h1>{employee ? 'My tickets' : 'Ticket queue'}</h1><p>Submit a campus IT issue, track its progress, or exchange updates with support staff.</p></div></header>
    {error && <p role="alert" className="notice notice--danger">{error}</p>}
    <section className="work-section" aria-labelledby="new-ticket-title">
    <h2 id="new-ticket-title" className="work-section__title">Report an issue</h2>
    <form onSubmit={submitIncident} className="ticket-form work-panel grid gap-4 p-5 md:grid-cols-2">
      <label className="text-sm font-medium">Subject / Title<input required maxLength="255" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-control border p-2" placeholder="e.g. Wi-Fi disconnected in Lab 204" /></label>
      <label className="text-sm font-medium">Affected Service<select required value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} className="mt-1 w-full rounded-control border p-2">{services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <label className="text-sm font-medium">Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-control border p-2">{categories.map((v) => <option key={v}>{v}</option>)}</select></label>
      <label className="text-sm font-medium">Urgency<select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })} className="mt-1 w-full rounded-control border p-2">{urgencies.map((v) => <option key={v}>{v}</option>)}</select></label>
      <label className="text-sm font-medium">Impact<select value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} className="mt-1 w-full rounded-control border p-2">{impacts.map((v) => <option key={v}>{v}</option>)}</select></label>
      <label className="text-sm font-medium md:col-span-2">Description<textarea required maxLength="10000" rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-control border p-2" placeholder="Please provide details about what went wrong and where..." /></label>
      {suggestions.length > 0 && <aside className="notice notice--success md:col-span-2"><h3 className="font-semibold">Similar past solutions</h3><p className="mt-1 text-xs">These solutions resolved similar tickets earlier and may help solve this problem:</p><div className="mt-3 grid gap-3 md:grid-cols-3">{suggestions.map((item, index) => <div key={`${item.priority}-${index}`} className="work-panel p-3 text-sm"><p className="text-xs font-semibold">{item.priority} · {Math.round(item.similarity * 100)}% match</p><p className="mt-2 whitespace-pre-wrap text-secondary">{item.resolution}</p>{item.rootCause && <p className="mt-2 border-t border-rule pt-2 text-xs text-muted">Cause: {item.rootCause}</p>}</div>)}</div></aside>}
      <button disabled={loading || !form.serviceId} className="primary-action md:col-span-2">{loading ? 'Submitting…' : 'Submit ticket'}</button>
    </form>
    </section>
    <section className="work-section space-y-4" aria-labelledby="ticket-list-title">
      <h2 id="ticket-list-title" className="work-section__title">Find a ticket</h2>
      <div className="work-panel grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Filter tickets">
        <input aria-label="Incident ID" placeholder="Ticket # or ID..." value={filters.id} onChange={(e) => setFilters({ ...filters, id: e.target.value })} className="rounded border p-2" />
        <input aria-label="Created from" type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} className="rounded border p-2" />
        <input aria-label="Created to" type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} className="rounded border p-2" />
        <select aria-label="Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded border p-2"><option value="">All statuses</option>{['NEW','CLASSIFIED','ASSIGNED','ACKNOWLEDGED','IN_PROGRESS','RESOLVED','VERIFIED','CLOSED'].map((v) => <option key={v}>{v}</option>)}</select>
        <select aria-label="Priority" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className="rounded border p-2"><option value="">All priorities</option>{['P1_CRITICAL','P2_HIGH','P3_MEDIUM','P4_LOW'].map((v) => <option key={v}>{v}</option>)}</select>
        <select aria-label="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="rounded border p-2"><option value="">All categories</option>{categories.map((v) => <option key={v}>{v}</option>)}</select>
        <select aria-label="Service" value={filters.serviceId} onChange={(e) => setFilters({ ...filters, serviceId: e.target.value })} className="rounded border p-2"><option value="">All services</option>{services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <select aria-label="SLA state" value={filters.slaStatus} onChange={(e) => setFilters({ ...filters, slaStatus: e.target.value })} className="rounded border p-2"><option value="">All SLA states</option>{['NORMAL','WARNING','BREACHED'].map((v) => <option key={v}>{v}</option>)}</select>
        {!employee && <input aria-label="Technician ID" type="number" min="1" placeholder="Technician ID" value={filters.technicianId} onChange={(e) => setFilters({ ...filters, technicianId: e.target.value })} className="rounded border p-2" />}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">{incidents.map((item) => <button key={item.id} onClick={() => openIncident(item)} className={`ticket-row ${selected?.id === item.id ? 'ticket-row--selected' : ''}`}>
          <div className="flex items-start justify-between gap-3"><span className="font-semibold text-ink">{item.trackingNumber} · {item.title}</span><span className="rounded-chip bg-inset px-2 py-1 text-xs">{item.status}</span></div><p className="mt-2 text-sm text-secondary">{item.serviceName} · {item.priority} · {item.urgency}</p>{item.potentialDuplicate && <p className="mt-2 text-xs text-person">Duplicate check: #{item.primaryIncidentId}</p>}
        </button>)}{incidents.length === 0 && <p className="rounded-control bg-panel p-5 text-muted">No tickets found matching these filters.</p>}</div>
        {selected && <article className="work-panel ticket-detail p-5"><div className="ticket-detail__heading"><div><h2 className="ticket-id mono">{selected.trackingNumber}</h2><p className="mt-1 font-medium">{selected.title}</p></div><span className="status-chip status-chip--instrument">{selected.status}</span></div><p className="mt-3 whitespace-pre-wrap text-sm text-secondary">{selected.description}</p><dl className="ticket-facts mt-4 text-sm"><dt>Status</dt><dd>{selected.status}</dd><dt>Priority</dt><dd>{selected.priority} (score {selected.priorityScore ?? '—'})</dd><dt>Service</dt><dd>{selected.serviceName}</dd><dt>Technician</dt><dd>{selected.technicianName || 'Awaiting assignment'}</dd><dt>Response due</dt><dd>{selected.responseDeadline ? new Date(selected.responseDeadline).toLocaleString() : '—'}</dd><dt>Resolution due</dt><dd>{selected.resolutionDeadline ? new Date(selected.resolutionDeadline).toLocaleString() : '—'}</dd><dt>Acknowledged</dt><dd>{selected.acknowledgedAt ? new Date(selected.acknowledgedAt).toLocaleString() : '—'}</dd><dt>Resolved</dt><dd>{selected.resolvedAt ? new Date(selected.resolvedAt).toLocaleString() : '—'}</dd><dt>Closed</dt><dd>{selected.closedAt ? new Date(selected.closedAt).toLocaleString() : '—'}</dd><dt>Resolution</dt><dd>{selected.resolutionNotes || 'Pending'}</dd><dt>Root cause</dt><dd>{selected.rootCause || 'Pending'}</dd></dl>
          <aside className="priority-note mt-4"><h3 className="font-semibold">How priority is calculated</h3><p className="mt-1">Impact {selected.impact} ({selected.impact === 'ORGANIZATION_WIDE' ? 4 : selected.impact === 'DEPARTMENT' ? 2 : 1}) × urgency {selected.urgency} ({({ LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 })[selected.urgency]}) × service criticality {selected.criticalityFactor ?? 1} + service weight {selected.serviceWeight ?? 0} = {selected.priorityScore ?? '—'}.</p><p className="mt-1 text-xs">Priority ranges: P1 ≥ 24, P2 ≥ 14, P3 ≥ 6, and P4 below 6.</p></aside>
          {selected.slaBreached && (
            <div style={{ marginTop: '14px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <strong style={{ color: '#ef4444', fontSize: '13px', display: 'block' }}>⚠️ SLA Target Breached on this Ticket</strong>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>An automated SLA escalation notice can be dispatched to operational leads.</span>
              </div>
              <button
                type="button"
                className="primary-action"
                style={{ background: '#ef4444', color: '#ffffff', padding: '6px 14px', fontSize: '12px', fontWeight: 600, border: 'none' }}
                onClick={() => {
                  const userEmail = currentUser?.email || (JSON.parse(localStorage.getItem('iitsm_user') || '{}')).email || 'raghuramvedantam16@gmail.com';
                  sendSlaBreachEmail({
                    toEmail: userEmail,
                    userName: currentUser?.fullName || 'IT Lead',
                    ticketId: selected.trackingNumber || selected.id,
                    title: selected.title,
                    priority: selected.priority,
                    deadline: selected.responseDeadline ? new Date(selected.responseDeadline).toLocaleString() : 'Exceeded',
                    escalationStatus: 'TIER-2 ESCALATION',
                    slaType: 'Resolution',
                  });
                  alert(`SLA Breach Email using templates/sla-breach.html dispatched to ${userEmail}!`);
                }}
              >
                ✉ Dispatch SLA Breach Email
              </button>
            </div>
          )}
          {assignedTechnician && selected.status === 'ASSIGNED' && <button onClick={() => transition('acknowledge')} className="primary-action mt-4 mr-2">Acknowledge ticket</button>}
          {assignedTechnician && selected.status === 'ACKNOWLEDGED' && <button onClick={() => transition('investigate')} className="primary-action mt-4">Start work</button>}
          {assignedTechnician && selected.status === 'IN_PROGRESS' && <form onSubmit={resolveIncident} className="work-section space-y-2"><h3 className="work-section__title">Resolution details</h3><textarea required value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} placeholder="Explain how the issue was fixed..." className="w-full" /><textarea required value={rootCause} onChange={(e) => setRootCause(e.target.value)} placeholder="What caused the problem..." className="w-full" /><button className="primary-action">Mark resolved</button></form>}
          {employee && selected.status === 'RESOLVED' && <button onClick={() => transition('verify')} className="primary-action mt-4">Confirm the fix</button>}{employee && selected.status === 'VERIFIED' && <button onClick={() => transition('close')} className="secondary-action mt-4">Close ticket</button>}
          <section className="work-section" aria-labelledby="ticket-updates-title"><h3 id="ticket-updates-title" className="work-section__title">Updates and messages</h3><div className="mt-2 max-h-48 space-y-2 overflow-auto">{comments.map((c) => <div key={c.id} className="work-panel p-3 text-sm"><p>{c.message}</p><p className="mt-1 text-xs text-muted">{c.authorName} · {new Date(c.createdAt).toLocaleString()}</p></div>)}</div><form onSubmit={postUpdate} className="mt-3 flex gap-2"><input value={message} onChange={(e) => setMessage(e.target.value)} maxLength="4000" placeholder="Post an update or reply..." className="min-w-0 flex-1" /><button className="secondary-action">Send</button></form></section>
          <section className="work-section mt-4" aria-labelledby="ticket-audit-title">
            <div className="flex items-center justify-between">
              <h3 id="ticket-audit-title" className="work-section__title">Incident Audit Trail</h3>
              <span className="text-xs text-muted">{auditTrail.length} events logged</span>
            </div>
            <div className="mt-2 max-h-56 space-y-2 overflow-auto">
              {auditTrail.map((entry) => (
                <div key={entry.id || `${entry.action}-${entry.timestamp}`} className="work-panel p-2.5 text-xs flex flex-col gap-1 border-l-2 border-accent">
                  <div className="flex items-center justify-between text-muted">
                    <span className="font-semibold text-ink">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} – {entry.action}
                    </span>
                    <span className="rounded bg-inset px-1.5 py-0.5 text-[11px]">{entry.actorName || 'SYSTEM'} ({entry.actorRole || 'SYSTEM'})</span>
                  </div>
                  {entry.previousState && entry.newState && (
                    <div className="text-[11px] text-secondary">
                      State transition: <span className="font-mono text-ink">{entry.previousState}</span> → <span className="font-mono text-accent font-semibold">{entry.newState}</span>
                    </div>
                  )}
                  {entry.description && <p className="text-muted text-[11px] mt-0.5 whitespace-pre-wrap">{entry.description}</p>}
                </div>
              ))}
              {auditTrail.length === 0 && (
                <p className="text-xs text-muted p-3 text-center">No audit records recorded yet.</p>
              )}
            </div>
          </section>
        </article>}
      </div>
    </section>
    <TicketChatWidget incidents={incidents} selected={selected} />
  </div>;
}
