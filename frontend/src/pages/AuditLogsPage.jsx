import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, Search } from 'lucide-react';

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
      <header className="screen-heading">
        <div>
          <h1>System Activity &amp; Audit Log</h1>
          <p>Chronological history of ticket actions, assignments, and status updates.</p>
        </div>
        <span className="status-chip status-chip--instrument">Trigger protected</span>
      </header>

      <form onSubmit={handleSearch} className="work-panel flex flex-wrap items-end gap-4" aria-label="Filter audit history">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-secondary mb-1">Ticket ID</label>
          <input
            type="number"
            placeholder="e.g. 101"
            value={incidentId}
            onChange={(e) => setIncidentId(e.target.value)}
            className="w-full text-sm rounded-control px-3 py-1.5"
          />
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-secondary mb-1">Action Filter</label>
          <input
            type="text"
            placeholder="e.g. ASSIGN, ACKNOWLEDGE, RESOLVE"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full text-sm rounded-control px-3 py-1.5"
          />
        </div>

        <button type="submit" className="secondary-action"><Search size={16} aria-hidden="true" /> Apply filters</button>
      </form>

      <section className="work-section" aria-labelledby="audit-list-title">
      <div className="screen-heading"><div><h2 id="audit-list-title" className="work-section__title">Recent ticket actions</h2><p>Showing up to 50 entries. Filter by ticket ID or action.</p></div></div>
      {loading && <p role="status" className="text-sm text-muted">Loading audit history…</p>}
      <div className="work-panel">
        <div className="space-y-6">
          {logs.length === 0 ? (
            <div className="py-8 text-center text-muted text-sm">No audit entries found.</div>
          ) : (
            logs.map((logItem, index) => (
              <div key={logItem.id || index} className="flex items-start gap-4 relative">
                {/* Timeline connector line */}
                {index !== logs.length - 1 && (
                  <div className="absolute left-4 top-8 -bottom-6 w-0.5 bg-paper" />
                )}

                <div className="w-8 h-8 rounded-chip bg-instrument-soft border-2 border-instrument flex items-center justify-center shrink-0 z-10">
                  <History className="w-4 h-4 text-instrument" />
                </div>

                <div className="flex-1 rounded-control bg-inset p-4 border border-rule">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="status-chip">
                        {logItem.action}
                      </span>
                      {logItem.incidentId && (
                        <span className="text-xs font-mono text-instrument font-semibold">
                          Incident #{logItem.incidentId}
                        </span>
                      )}
                      {logItem.previousState && logItem.newState && (
                        <span className="text-xs text-muted font-medium">
                          ({logItem.previousState} &rarr; {logItem.newState})
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted font-mono">
                      {new Date(logItem.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-secondary mt-2 font-medium">{logItem.description}</p>

                  <div className="mt-2.5 pt-2 border-t border-rule/60 flex items-center gap-4 text-xs text-muted">
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
      </section>
    </div>
  );
}
