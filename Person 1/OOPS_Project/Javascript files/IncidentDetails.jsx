import React, { useState, useEffect } from 'react';

const IncidentDetails = ({ incidentId }) => {
  const [incident, setIncident] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState(null);

  const fetchIncident = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/incidents/${incidentId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch incident');
      setIncident(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (incidentId) fetchIncident();
  }, [incidentId]);

  const handleTransition = async (action, bodyPayload = null) => {
    setError(null);
    try {
      const options = { method: 'PATCH' };
      if (bodyPayload) {
        options.headers = { 'Content-Type': 'text/plain' };
        options.body = bodyPayload;
      }

      const response = await fetch(`http://localhost:8080/api/incidents/${incidentId}/${action}`, options);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Failed to ${action} incident`);

      setResolutionNotes('');
      fetchIncident(); // Refresh state
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/api/incidents/${incidentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: newComment
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to post comment');

      setNewComment('');
      fetchIncident(); // Refresh timeline
    } catch (err) {
      setError(err.message);
    }
  };

  if (!incident) return <div>Loading incident details...</div>;

  return (
    <div style={{ maxWidth: '650px', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{incident.id}: {incident.title || 'Incident Details'}</h2>
        <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#e0e7ff', borderRadius: '4px', fontWeight: 'bold' }}>
          {incident.status}
        </span>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</div>}

      <p><strong>Description:</strong> {incident.description}</p>
      {incident.resolutionNotes && (
        <p style={{ backgroundColor: '#f0fdf4', padding: '0.75rem', borderLeft: '4px solid #22c55e' }}>
          <strong>Resolution Notes:</strong> {incident.resolutionNotes}
        </p>
      )}

      {/* Lifecycle Action Controls */}
      <div style={{ margin: '1.5rem 0', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
        <h4>Lifecycle Actions</h4>
        
        {incident.status === 'NEW' && (
          <button onClick={() => handleTransition('classify')}>Classify Incident</button>
        )}
        {incident.status === 'CLASSIFIED' && (
          <button onClick={() => handleTransition('assign')}>Assign Technician</button>
        )}
        {incident.status === 'ASSIGNED' && (
          <button onClick={() => handleTransition('acknowledge')}>Acknowledge</button>
        )}
        {incident.status === 'ACKNOWLEDGED' && (
          <button onClick={() => handleTransition('investigate')}>Start Investigation</button>
        )}
        {incident.status === 'IN_PROGRESS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <textarea
              placeholder="Enter mandatory root-cause and resolution notes..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows="3"
            />
            <button onClick={() => handleTransition('resolve', resolutionNotes)}>Resolve Incident</button>
          </div>
        )}
        {incident.status === 'RESOLVED' && (
          <button onClick={() => handleTransition('verify')}>Verify Resolution</button>
        )}
        {incident.status === 'VERIFIED' && (
          <button onClick={() => handleTransition('close')}>Close Ticket</button>
        )}
        {incident.status === 'CLOSED' && (
          <p style={{ color: '#64748b', margin: 0 }}>Ticket is closed and read-only.</p>
        )}
      </div>

      {/* Comment Timeline */}
      <div>
        <h4>Comment Timeline</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          {incident.comments && incident.comments.length > 0 ? (
            incident.comments.map((c) => (
              <div key={c.id} style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  <strong>{c.authorId}</strong> • {new Date(c.timestamp).toLocaleString()}
                </div>
                <p style={{ margin: '0.25rem 0 0 0' }}>{c.content}</p>
              </div>
            ))
          ) : (
            <p style={{ color: '#64748b' }}>No comments yet.</p>
          )}
        </div>

        {incident.status !== 'CLOSED' && (
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add an update or note..."
              style={{ flex: 1, padding: '0.5rem' }}
            />
            <button type="submit">Post</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default IncidentDetails;