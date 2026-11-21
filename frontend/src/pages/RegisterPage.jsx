import React, { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import api from '../services/api';

function errorMessage(error) {
  return error.response?.data?.message || error.message || 'Could not create account. Please check your details and try again.';
}

export default function RegisterPage({ onAuthenticated, onLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { fullName, email, password });
      onAuthenticated(data);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout" aria-labelledby="register-heading">
      <div className="auth-copy">
        <h1 id="register-heading">Keep every request in view.</h1>
        <p>Create an account to submit service requests, read technician updates, and verify a resolution when the work is done.</p>
        <div className="auth-note"><ClipboardCheck size={16} aria-hidden="true" /><span>One account gives you a clear history of your support requests.</span></div>
      </div>
      <div className="auth-panel">
        <div className="auth-panel__head"><h2>Create an account</h2><p>Use your campus name and email address.</p></div>
        <form onSubmit={submit} className="auth-form">
          <label>Full name
            <input autoComplete="name" required maxLength={150} value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </label>
          <label>Email
            <input type="email" autoComplete="email" required maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>Password <span className="field-hint">At least 8 characters</span>
            <input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <p role="alert" className="notice notice--danger">{error}</p>}
          {loading && <p className="priority-note" style={{ margin: 0, textAlign: 'center' }}>Connecting to cloud server… (If waking from sleep, may take ~20s)</p>}
          <button type="submit" disabled={loading} className="primary-action auth-submit">{loading ? 'Creating account…' : 'Create account'}</button>
        </form>
        <p className="auth-panel__switch">Already registered? <button type="button" onClick={onLogin}>Sign in</button></p>
      </div>
    </section>
  );
}
