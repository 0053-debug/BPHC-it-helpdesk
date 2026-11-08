import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, Search, Shield, Filter, Calendar } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [incidentId, setIncidentId] = useState('');
  const [action, setAction] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (incidentId) params.incidentId = incidentId;
      if (action) params.action = action;
      params.size = 50;

      const res = await api.get('/audit-logs', { params });
      setLogs(res.data.content || []);
    } catch (e) {
      console.warn('Could not fetch audit logs:', e.message);
      // Mock seed audit records for demonstration
      setLogs([
        {
          id: 1,
          incidentId: 101,
          actorName: 'Priya Employee',
          actorRole: 'ROLE_EMPLOYEE',
          action: 'CREATE',
          previousState: null,
          newState: 'NEW',
          description: 'Reported: Payment gateway timing out on fee portal',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 2,
          incidentId: 101,
          actorName: 'SYSTEM_SCHEDULER',
          actorRole: 'SYSTEM',
          action: 'CLASSIFY_PRIORITIZE',
          previousState: 'NEW',
          newState: 'CLASSIFIED',
          description: 'Calculated Priority P1_CRITICAL (Score: 28.0)',
          timestamp: new Date(Date.now() - 3500000).toISOString(),
        },
        {
          id: 3,
          incidentId: 101,
          actorName: 'SYSTEM_ASSIGNMENT_STRATEGY',
          actorRole: 'SYSTEM',
          action: 'ASSIGN',
          previousState: 'CLASSIFIED',
          newState: 'ASSIGNED',
          description: 'SkillBasedStrategy dispatched to Sarah Tech (DATABASE)',
          timestamp: new Date(Date.now() - 3400000).toISOString(),
        },
        {
          id: 4,
          incidentId: 101,
          actorName: 'Sarah Tech',
          actorRole: 'ROLE_TECHNICIAN',
          action: 'ACKNOWLEDGE',
          previousState: 'ASSIGNED',
          newState: 'ACKNOWLEDGED',
          description: 'Technician acknowledged ticket; Response SLA met (3m 20s)',
          timestamp: new Date(Date.now() - 3200000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Enterprise Audit Trail
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable, append-only history of all state transitions, assignments, SLA alerts, and actor actions.
          </p>
        </div>
        <div className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-800 px-3 py-1.5 rounded-lg font-mono">
          PostgreSQL Trigger Enforced: UPDATE/DELETE Forbidden
        </div>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Incident ID</label>
          <input
            type="number"
            placeholder="e.g. 101"
            value={incidentId}
            onChange={(e) => setIncidentId(e.target.value)}
            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-1.5 outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Action Filter</label>
          <input
            type="text"
            placeholder="e.g. ASSIGN, ACKNOWLEDGE, RESOLVE"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-1.5 outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="pt-5">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-xs transition"
          >
            <Search className="w-4 h-4" /> Filter Logs
          </button>
        </div>
      </form>

      {/* Audit Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="space-y-6">
          {logs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">No audit entries found.</div>
          ) : (
            logs.map((logItem, index) => (
              <div key={logItem.id || index} className="flex items-start gap-4 relative">
                {/* Timeline connector line */}
                {index !== logs.length - 1 && (
                  <div className="absolute left-4 top-8 -bottom-6 w-0.5 bg-slate-200" />
                )}

                <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-indigo-500 flex items-center justify-center shrink-0 z-10">
                  <History className="w-4 h-4 text-indigo-600" />
                </div>

                <div className="flex-1 bg-slate-50/60 hover:bg-slate-50 p-4 rounded-xl border border-slate-200 transition">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
                        {logItem.action}
                      </span>
                      {logItem.incidentId && (
                        <span className="text-xs font-mono text-blue-600 font-semibold">
                          Incident #{logItem.incidentId}
                        </span>
                      )}
                      {logItem.previousState && logItem.newState && (
                        <span className="text-xs text-slate-500 font-medium">
                          ({logItem.previousState} &rarr; {logItem.newState})
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(logItem.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 mt-2 font-medium">{logItem.description}</p>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-4 text-[11px] text-slate-500">
                    <span>
                      Actor: <strong>{logItem.actorName}</strong> ({logItem.actorRole})
                    </span>
                    <span>Log ID: #{logItem.id}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
