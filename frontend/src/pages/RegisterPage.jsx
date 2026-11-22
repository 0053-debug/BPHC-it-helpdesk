import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, ClipboardCheck, RefreshCw, UserCheck } from 'lucide-react';
import api from '../services/api';
import { sendWelcomeEmail } from '../services/emailService';

export default function RegisterPage({ onAuthenticated, onLogin, initialEmail = '' }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState(null); // 'already_registered' | 'timeout' | 'generic'
  const [loading, setLoading] = useState(false);
  const [secondsWaiting, setSecondsWaiting] = useState(0);

  useEffect(() => {
    let timer;
    if (loading) {
      setSecondsWaiting(0);
      timer = setInterval(() => setSecondsWaiting((s) => s + 1), 1000);
    } else {
      setSecondsWaiting(0);
    }
    return () => clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const submit = async (event) => {
    if (event) event.preventDefault();
    setError('');
    setErrorType(null);
    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', { fullName, email, password });
      try {
        sendWelcomeEmail({ toEmail: email, userName: fullName, role: 'Student / Employee' });
      } catch (e) {
        console.warn('Welcome email dispatch skipped:', e);
      }
      onAuthenticated(data);
    } catch (requestError) {
      const msg = requestError.response?.data?.message || requestError.message || '';
      const isAlready =
        msg.toLowerCase().includes('already registered') ||
        msg.toLowerCase().includes('already exists') ||
        msg.toLowerCase().includes('duplicate');
      const isTimeout =
        requestError.code === 'ECONNABORTED' ||
        msg.toLowerCase().includes('wake up') ||
        msg.toLowerCase().includes('timeout');

      if (isAlready) {
        setErrorType('already_registered');
        setError(`An account with email "${email}" is already registered.`);
      } else if (isTimeout) {
        setErrorType('timeout');
        setError(msg || 'The cloud server took longer than expected to wake up. Please click retry — it responds immediately once awake.');
      } else {
        setErrorType('generic');
        setError(msg || 'Could not create account. Please check your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout" aria-labelledby="register-heading">
      <div className="auth-copy">
        <h1 id="register-heading">Keep every request in view.</h1>
        <p>Create an account to submit service requests, read technician updates, and verify a resolution when the work is done.</p>
        <div className="auth-note">
          <ClipboardCheck size={16} aria-hidden="true" />
          <span>One account gives you a clear history of your support requests across campus.</span>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-panel__head">
          <h2>Create an account</h2>
          <p>Fill in your details below to create your campus account.</p>
        </div>
        <form onSubmit={submit} className="auth-form">
          <label>
            Full name
            <input
              autoComplete="name"
              required
              maxLength={150}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="e.g. Raghuram Vedantam"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              required
              maxLength={255}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="e.g. name@bphc.ac.in or gmail.com"
            />
          </label>
          <label>
            Password <span className="field-hint">At least 8 characters</span>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={72}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && (
            <div
              role="alert"
              className={`notice ${errorType === 'timeout' ? 'notice--warning' : 'notice--danger'}`}
              style={{ display: 'grid', gap: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '13.5px', lineHeight: 1.4 }}>{error}</span>
              </div>

              {errorType === 'timeout' && (
                <button
                  type="button"
                  className="primary-action"
                  style={{ justifySelf: 'start', padding: '6px 14px', fontSize: '13px' }}
                  onClick={() => submit()}
                >
                  ↻ Retry Creating Account
                </button>
              )}

              {errorType === 'already_registered' && (
                <button
                  type="button"
                  className="primary-action"
                  style={{ justifySelf: 'start', padding: '6px 14px', fontSize: '13px' }}
                  onClick={() => onLogin && onLogin(email)}
                >
                  Sign in with {email} →
                </button>
              )}
            </div>
          )}

          {loading && (
            <p className="priority-note" style={{ margin: 0, textAlign: 'center', fontSize: '13px' }}>
              {secondsWaiting < 4
                ? 'Connecting to cloud server…'
                : `Waking cloud container from sleep (${secondsWaiting}s elapsed, please wait)…`}
            </p>
          )}

          <button type="submit" disabled={loading} className="primary-action auth-submit">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-panel__switch">
          Already registered?{' '}
          <button type="button" onClick={() => onLogin && onLogin(email)}>
            Sign in
          </button>
        </p>
      </div>
    </section>
  );
}
