import React, { useState } from 'react';

const CreateIncidentForm = ({ onIncidentCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'NETWORK',
    urgency: 'MEDIUM',
    impact: 'INDIVIDUAL'
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || 'Failed to create incident');

      if (onIncidentCreated) onIncidentCreated(data);
      setFormData({
        title: '',
        description: '',
        category: 'NETWORK',
        urgency: 'MEDIUM',
        impact: 'INDIVIDUAL'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Report an IT Incident</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label>
          Incident Title:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Concise summary of the issue"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>

        <label>
          Detailed Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Describe what happened, error messages, etc."
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>

        <label>
          Category:
          <select name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }}>
            <option value="HARDWARE">Hardware</option>
            <option value="SOFTWARE">Software</option>
            <option value="NETWORK">Network</option>
            <option value="DATABASE">Database</option>
            <option value="CLOUD">Cloud</option>
            <option value="SECURITY">Security</option>
            <option value="AUTHENTICATION">Authentication</option>
            <option value="APPLICATION">Application</option>
            <option value="STORAGE">Storage</option>
          </select>
        </label>

        <label>
          Urgency:
          <select name="urgency" value={formData.urgency} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </label>

        <label>
          Scope of Impact:
          <select name="impact" value={formData.impact} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }}>
            <option value="INDIVIDUAL">Individual</option>
            <option value="DEPARTMENT">Department</option>
            <option value="ORGANIZATION_WIDE">Organization-Wide</option>
          </select>
        </label>

        <button type="submit" disabled={submitting} style={{ padding: '0.75rem', cursor: 'pointer' }}>
          {submitting ? 'Submitting...' : 'Submit Incident'}
        </button>
      </form>
    </div>
  );
};

export default CreateIncidentForm;