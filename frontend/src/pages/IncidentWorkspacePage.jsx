import React, { useEffect, useState } from 'react';
import api from '../services/api';
import TicketChatWidget from '../components/TicketChatWidget';


const categories = ['HARDWARE', 'SOFTWARE', 'NETWORK', 'DATABASE', 'CLOUD', 'SECURITY', 'AUTHENTICATION', 'APPLICATION', 'STORAGE'];
const urgencies = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const impacts = ['INDIVIDUAL', 'DEPARTMENT', 'ORGANIZATION_WIDE'];

export default function IncidentWorkspacePage({ currentUser }) {
  const [incidents, setIncidents] = useState([]);
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [form, setForm] = useState({ title: '', description: '', serviceId: '', category: 'SOFTWARE', urgency: 'MEDIUM', impact: 'INDIVIDUAL' });
  const [filters, setFilters] = useState({ id: '', dateFrom: '', dateTo: '', status: '', priority: '', serviceId: '', technicianId: '', slaStatus: '' });
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
  };
  const submitIncident = async (event) => {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await api.post('/incidents', { ...form, serviceId: Number(form.serviceId) });
      setForm((old) => ({ ...old, title: '', description: '' })); await refresh(); await openIncident(data);
    } catch (e) { setError(e.response?.data?.message || 'Could not submit incident.'); }
    finally { setLoading(false); }
  };
  const postUpdate = async (event) => {
    event.preventDefault(); if (!selected || !message.trim()) return;
    try { const { data } = await api.post(`/incidents/${selected.id}/comments`, { message }); setComments((old) => [...old, data]); setMessage(''); }
    catch (e) { setError(e.response?.data?.message || 'Could not post update.'); }
  };
  const transition = async (action) => {
    try { const { data } = await api.post(`/incidents/${selected.id}/${action}`); setSelected(data); await refresh(); }
    catch (e) { setError(e.response?.data?.message || `Could not ${action} incident.`); }
  };
  const employee = currentUser?.role === 'ROLE_EMPLOYEE';
  const assignedTechnician = currentUser?.role === 'ROLE_TECHNICIAN' && Number(selected?.technicianId) === Number(currentUser.id);
  const resolveIncident = async (event) => {
    event.preventDefault();
    try { const { data } = await api.post(`/incidents/${selected.id}/resolve`, { resolutionNotes, rootCause }); setSelected(data); await refresh(); }
    catch (e) { setError(e.response?.data?.message || 'Could not resolve incident.'); }
  };

  return <div className="space-y-8">
    <header><p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Support Desk</p><h1 className="mt-1 text-3xl font-bold text-slate-900">{employee ? 'My Tickets' : 'Ticket Queue'}</h1><p className="mt-2 text-slate-600">Submit a campus IT issue, track live progress, or exchange updates with support staff.</p></header>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <form onSubmit={submitIncident} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
      <h2 className="text-xl font-semibold md:col-span-2">Submit a Support Ticket</h2>
      <label className="text-sm font-medium">Subject / Title<input required maxLength="255" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-lg border p-2" placeholder="e.g. Wi-Fi disconnected in Lab 204" /></label>
      <label className="text-sm font-medium">Affected Service<select required value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} className="mt-1 w-full rounded-lg border p-2">{services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <label className="text-sm font-medium">Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-lg border p-2">{categories.map((v) => <option key={v}>{v}</option>)}</select></label>
      <label className="text-sm font-medium">Urgency<select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })} className="mt-1 w-full rounded-lg border p-2">{urgencies.map((v) => <option key={v}>{v}</option>)}</select></label>
      <label className="text-sm font-medium">Impact<select value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} className="mt-1 w-full rounded-lg border p-2">{impacts.map((v) => <option key={v}>{v}</option>)}</select></label>
      <label className="text-sm font-medium md:col-span-2">Description<textarea required maxLength="10000" rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border p-2" placeholder="Please provide details about what went wrong and where..." /></label>
      {suggestions.length > 0 && <aside className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 md:col-span-2"><h3 className="font-semibold text-emerald-900">Similar Past Solutions</h3><p className="mt-1 text-xs text-emerald-800">These solutions resolved similar tickets earlier and may help solve this problem:</p><div className="mt-3 grid gap-3 md:grid-cols-3">{suggestions.map((item, index) => <div key={`${item.priority}-${index}`} className="rounded-lg bg-white p-3 text-sm"><p className="text-xs font-semibold text-emerald-800">{item.priority} · {Math.round(item.similarity * 100)}% match</p><p className="mt-2 whitespace-pre-wrap text-slate-700">{item.resolution}</p>{item.rootCause && <p className="mt-2 border-t pt-2 text-xs text-slate-500">Cause: {item.rootCause}</p>}</div>)}</div></aside>}
      <button disabled={loading || !form.serviceId} className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-60 md:col-span-2">{loading ? 'Submitting…' : 'Submit Ticket'}</button>
    </form>
    <section className="space-y-4">
      <div className="grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        <input aria-label="Incident ID" placeholder="Ticket # or ID..." value={filters.id} onChange={(e) => setFilters({ ...filters, id: e.target.value })} className="rounded border p-2" />
        <input aria-label="Created from" type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} className="rounded border p-2" />
        <input aria-label="Created to" type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} className="rounded border p-2" />
        <select aria-label="Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded border p-2"><option value="">All statuses</option>{['NEW','CLASSIFIED','ASSIGNED','ACKNOWLEDGED','IN_PROGRESS','RESOLVED','VERIFIED','CLOSED'].map((v) => <option key={v}>{v}</option>)}</select>
        <select aria-label="Priority" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className="rounded border p-2"><option value="">All priorities</option>{['P1_CRITICAL','P2_HIGH','P3_MEDIUM','P4_LOW'].map((v) => <option key={v}>{v}</option>)}</select>
        <select aria-label="Service" value={filters.serviceId} onChange={(e) => setFilters({ ...filters, serviceId: e.target.value })} className="rounded border p-2"><option value="">All services</option>{services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <select aria-label="SLA state" value={filters.slaStatus} onChange={(e) => setFilters({ ...filters, slaStatus: e.target.value })} className="rounded border p-2"><option value="">All SLA states</option>{['NORMAL','WARNING','BREACHED'].map((v) => <option key={v}>{v}</option>)}</select>
        {!employee && <input aria-label="Technician ID" type="number" min="1" placeholder="Technician ID" value={filters.technicianId} onChange={(e) => setFilters({ ...filters, technicianId: e.target.value })} className="rounded border p-2" />}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">{incidents.map((item) => <button key={item.id} onClick={() => openIncident(item)} className={`w-full rounded-xl border bg-white p-4 text-left shadow-sm hover:border-blue-400 ${selected?.id === item.id ? 'border-blue-500' : 'border-slate-200'}`}>
          <div className="flex items-start justify-between gap-3"><span className="font-semibold text-slate-900">{item.trackingNumber} · {item.title}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{item.status}</span></div><p className="mt-2 text-sm text-slate-600">{item.serviceName} · {item.priority} · {item.urgency}</p>{item.potentialDuplicate && <p className="mt-2 text-xs text-amber-700">Possible duplicate of ticket #{item.primaryIncidentId}</p>}
        </button>)}{incidents.length === 0 && <p className="rounded-lg bg-white p-5 text-slate-500">No tickets found matching these filters.</p>}</div>
        {selected && <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-bold">{selected.trackingNumber}</h2><p className="mt-1 font-medium">{selected.title}</p><p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{selected.description}</p><dl className="mt-4 grid grid-cols-2 gap-2 text-sm"><dt>Status</dt><dd>{selected.status}</dd><dt>Priority</dt><dd>{selected.priority} (score {selected.priorityScore ?? '—'})</dd><dt>Service</dt><dd>{selected.serviceName}</dd><dt>Technician</dt><dd>{selected.technicianName || 'Awaiting assignment'}</dd><dt>Response due</dt><dd>{selected.responseDeadline ? new Date(selected.responseDeadline).toLocaleString() : '—'}</dd><dt>Resolution due</dt><dd>{selected.resolutionDeadline ? new Date(selected.resolutionDeadline).toLocaleString() : '—'}</dd><dt>Acknowledged</dt><dd>{selected.acknowledgedAt ? new Date(selected.acknowledgedAt).toLocaleString() : '—'}</dd><dt>Resolved</dt><dd>{selected.resolvedAt ? new Date(selected.resolvedAt).toLocaleString() : '—'}</dd><dt>Closed</dt><dd>{selected.closedAt ? new Date(selected.closedAt).toLocaleString() : '—'}</dd><dt>Resolution</dt><dd>{selected.resolutionNotes || 'Pending'}</dd><dt>Root cause</dt><dd>{selected.rootCause || 'Pending'}</dd></dl>
          <aside className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-950"><h3 className="font-semibold">Priority calculation</h3><p className="mt-1">Impact {selected.impact} ({selected.impact === 'ORGANIZATION_WIDE' ? 4 : selected.impact === 'DEPARTMENT' ? 2 : 1}) × urgency {selected.urgency} ({({ LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 })[selected.urgency]}) × service criticality {selected.criticalityFactor ?? 1} + service weight {selected.serviceWeight ?? 0} = {selected.priorityScore ?? '—'}.</p><p className="mt-1 text-xs text-blue-800">Priority ranges: P1 ≥ 24 · P2 ≥ 14 · P3 ≥ 6 · P4 below 6.</p></aside>
          {assignedTechnician && selected.status === 'ASSIGNED' && <button onClick={() => transition('acknowledge')} className="mt-4 mr-2 rounded bg-blue-700 px-3 py-2 text-sm font-semibold text-white">Acknowledge Ticket</button>}
          {assignedTechnician && selected.status === 'ACKNOWLEDGED' && <button onClick={() => transition('investigate')} className="mt-4 rounded bg-blue-700 px-3 py-2 text-sm font-semibold text-white">Start Working</button>}
          {assignedTechnician && selected.status === 'IN_PROGRESS' && <form onSubmit={resolveIncident} className="mt-4 space-y-2"><textarea required value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} placeholder="Explain how the issue was fixed..." className="w-full rounded border p-2" /><textarea required value={rootCause} onChange={(e) => setRootCause(e.target.value)} placeholder="What caused the problem..." className="w-full rounded border p-2" /><button className="rounded bg-blue-700 px-3 py-2 text-sm font-semibold text-white">Mark Resolved</button></form>}
          {employee && selected.status === 'RESOLVED' && <button onClick={() => transition('verify')} className="mt-4 rounded bg-blue-700 px-3 py-2 text-sm font-semibold text-white">Confirm Fix</button>}{employee && selected.status === 'VERIFIED' && <button onClick={() => transition('close')} className="mt-4 rounded bg-slate-800 px-3 py-2 text-sm font-semibold text-white">Close Ticket</button>}
          <h3 className="mt-6 font-semibold">Updates & Messages</h3><div className="mt-2 max-h-48 space-y-2 overflow-auto">{comments.map((c) => <div key={c.id} className="rounded bg-slate-50 p-3 text-sm"><p>{c.message}</p><p className="mt-1 text-xs text-slate-500">{c.authorName} · {new Date(c.createdAt).toLocaleString()}</p></div>)}</div><form onSubmit={postUpdate} className="mt-3 flex gap-2"><input value={message} onChange={(e) => setMessage(e.target.value)} maxLength="4000" placeholder="Post an update or reply..." className="min-w-0 flex-1 rounded border p-2" /><button className="rounded bg-blue-700 px-3 font-semibold text-white">Send</button></form>
        </article>}
      </div>
    </section>
    <TicketChatWidget incidents={incidents} selected={selected} />
  </div>;
}
