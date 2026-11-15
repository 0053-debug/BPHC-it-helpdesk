import React, { useEffect, useState } from 'react';
import { RefreshCw, Users } from 'lucide-react';
import api from '../services/api';

const availabilityOptions = ['AVAILABLE', 'ON_LEAVE', 'OFF_DUTY'];
const strategyOptions = ['SKILL_BASED', 'LOAD_BASED', 'PRIORITY_AWARE'];

function apiError(error) {
  return error.response?.data?.message || error.message || 'The request could not be completed.';
}

export default function TechnicianDirectoryPage({ currentUser }) {
  const [technicians, setTechnicians] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [strategy, setStrategy] = useState('SKILL_BASED');
  const [savingStrategy, setSavingStrategy] = useState(false);

  const isAdmin = currentUser.role === 'ROLE_ADMIN';
  const selected = technicians.find((technician) => technician.id === selectedId);
  const canEditAvailability = selected && (
    isAdmin || (currentUser.role === 'ROLE_TECHNICIAN' && selected.id === currentUser.id)
  );

  const loadTechnicians = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/technicians');
      setTechnicians(data);
      setSelectedId((previousId) => data.some((technician) => technician.id === previousId)
        ? previousId
        : data[0]?.id ?? null);
    } catch (requestError) {
      setError(apiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
    if (isAdmin) {
      api.get('/admin/assignment-strategy')
        .then(({ data }) => setStrategy(data.strategy))
        .catch((requestError) => setError(apiError(requestError)));
    }
  }, []);

  const saveAvailability = async (availability) => {
    if (!selected) return;
    setSavingAvailability(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.put(`/technicians/${selected.id}/availability`, { availability });
      setTechnicians((previous) => previous.map((technician) => technician.id === data.id ? data : technician));
      setSuccess('Availability updated.');
    } catch (requestError) {
      setError(apiError(requestError));
    } finally {
      setSavingAvailability(false);
    }
  };

  const saveStrategy = async (nextStrategy) => {
    setStrategy(nextStrategy);
    setSavingStrategy(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post('/admin/assignment-strategy', { strategy: nextStrategy });
      setStrategy(data.strategy);
      setSuccess('Assignment strategy updated for this backend process.');
    } catch (requestError) {
      setError(apiError(requestError));
    } finally {
      setSavingStrategy(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Users className="w-6 h-6" /> Technician directory</h1>
          <p className="text-sm text-slate-600 mt-1">Skills, availability, and live active workload versus capacity.</p>
        </div>
        <button onClick={loadTechnicians} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm disabled:opacity-60">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </header>

      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {success && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}

      {isAdmin && (
        <div className="rounded-xl border bg-white p-4 flex flex-wrap items-center gap-3">
          <label htmlFor="assignment-strategy" className="font-semibold text-sm">Automatic assignment strategy</label>
          <select
            id="assignment-strategy"
            value={strategy}
            disabled={savingStrategy}
            onChange={(event) => saveStrategy(event.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            {strategyOptions.map((option) => <option key={option} value={option}>{option.replace('_', ' ')}</option>)}
          </select>
          {savingStrategy && <span className="text-sm text-slate-500">Saving…</span>}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-600">Loading technicians…</p>
      ) : technicians.length === 0 ? (
        <p className="rounded-xl border bg-white p-6 text-sm text-slate-600">No active technicians are registered.</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="px-4 py-3">Technician</th><th className="px-4 py-3">Skills</th><th className="px-4 py-3">Availability</th><th className="px-4 py-3">Active / Capacity</th></tr>
              </thead>
              <tbody className="divide-y">
                {technicians.map((technician) => (
                  <tr
                    key={technician.id}
                    onClick={() => setSelectedId(technician.id)}
                    className={`cursor-pointer ${technician.id === selectedId ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-4 py-3"><span className="block font-semibold text-slate-900">{technician.fullName}</span><span className="text-xs text-slate-500">{technician.email}</span></td>
                    <td className="px-4 py-3">{technician.skills.length ? technician.skills.join(', ') : 'None listed'}</td>
                    <td className="px-4 py-3">{technician.availability}</td>
                    <td className="px-4 py-3">{technician.activeWorkload} / {technician.capacity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <aside className="rounded-xl border bg-white p-5">
              <h2 className="text-lg font-bold text-slate-900">Technician profile</h2>
              <p className="text-sm text-slate-600 mt-1">{selected.fullName}</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div><dt className="font-semibold text-slate-700">Skills</dt><dd>{selected.skills.length ? selected.skills.join(', ') : 'None listed'}</dd></div>
                <div><dt className="font-semibold text-slate-700">Current workload</dt><dd>{selected.activeWorkload} active incidents, capacity {selected.capacity}</dd></div>
                <div><dt className="font-semibold text-slate-700">Availability</dt><dd>{selected.availability}</dd></div>
              </dl>
              {canEditAvailability && (
                <label className="block mt-5 text-sm font-semibold text-slate-700">
                  Update availability
                  <select
                    value={selected.availability}
                    disabled={savingAvailability}
                    onChange={(event) => saveAvailability(event.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 font-normal"
                  >
                    {availabilityOptions.map((option) => <option key={option} value={option}>{option.replace('_', ' ')}</option>)}
                  </select>
                </label>
              )}
            </aside>
          )}
        </div>
      )}
    </section>
  );
}
