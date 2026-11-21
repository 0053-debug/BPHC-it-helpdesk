import React, { useState } from 'react';
import { Link2 } from 'lucide-react';
import api from '../services/api';

function errorMessage(error) {
  return error.response?.data?.message || error.message || 'Incorrect email or password. Please try again.';
}

export default function LoginPage({ onAuthenticated, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      onAuthenticated(data);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout" aria-labelledby="sign-in-heading">
      <div className="auth-copy">
        <h1 id="sign-in-heading">Support starts here.</h1>
        <p>Sign in to report a campus technology issue, follow updates, and confirm when it is fixed.</p>
        <div className="auth-note"><Link2 size={16} aria-hidden="true" /><span>Account passwords are stored as BCrypt hashes.</span></div>
      </div>
      <div className="auth-panel">
        <div className="auth-panel__head"><h2>Sign in</h2><p>Use your campus account to continue.</p></div>
        <form onSubmit={submit} className="auth-form">
          <label>Email
            <input type="email" autoComplete="email" required maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>Password
            <input type="password" autoComplete="current-password" required maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <p role="alert" className="notice notice--danger">{error}</p>}
          {loading && <p className="priority-note" style={{ margin: 0, textAlign: 'center' }}>Connecting to cloud server… (If waking from sleep, may take ~20s)</p>}
          <button type="submit" disabled={loading} className="primary-action auth-submit">{loading ? 'Signing in…' : 'Continue'}</button>
        </form>
        <p className="auth-panel__switch">New to the portal? <button type="button" onClick={onRegister}>Create an account</button></p>
      </div>
    </section>
  );
}
