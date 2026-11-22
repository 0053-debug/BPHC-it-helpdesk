import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Link2, RefreshCw, UserPlus } from 'lucide-react';
import api from '../services/api';

export default function LoginPage({ onAuthenticated, onRegister, onForgotPassword, initialEmail = '' }) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState(null); // 'not_found' | 'invalid_password' | 'timeout' | 'auth_failed' | 'generic'
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
      const { data } = await api.post('/auth/login', { email, password });
      onAuthenticated(data);
    } catch (requestError) {
      const msg = requestError.response?.data?.message || requestError.message || '';
      const isTimeout =
        requestError.code === 'ECONNABORTED' ||
        msg.toLowerCase().includes('wake up') ||
        msg.toLowerCase().includes('timeout');
      const isNotFound =
        msg.toLowerCase().includes('no account') ||
        msg.toLowerCase().includes('not registered') ||
        msg.toLowerCase().includes('not found');
      const isBadPassword = msg.toLowerCase().includes('incorrect password');

      if (isTimeout) {
        setErrorType('timeout');
        setError(msg || 'The cloud server took longer than expected to wake up. Please click retry — it responds immediately once awake.');
      } else if (isNotFound) {
        setErrorType('not_found');
        setError(msg || `No account found with email "${email}". Please create an account to get started.`);
      } else if (isBadPassword) {
        setErrorType('invalid_password');
        setError(msg);
      } else if (requestError.response?.status === 401) {
        setErrorType('auth_failed');
        setError(msg || 'Could not sign in with this email and password. If you are new to the portal, please create an account.');
      } else {
        setErrorType('generic');
        setError(msg || 'Incorrect email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout" aria-labelledby="sign-in-heading">
      <div className="auth-copy">
        <h1 id="sign-in-heading">Support starts here.</h1>
        <p>Sign in to report a campus technology issue, follow updates, and confirm when it is fixed.</p>
        <div className="auth-note">
          <Link2 size={16} aria-hidden="true" />
          <span>Account passwords are protected with salted BCrypt hashing.</span>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-panel__head">
          <h2>Sign in</h2>
          <p>Enter your registered campus email and password to continue.</p>
        </div>
        <form onSubmit={submit} className="auth-form">
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Password</span>
              <button
                type="button"
                onClick={onForgotPassword}
                style={{ background: 'none', border: 'none', color: 'var(--color-cool)', fontSize: '13px', cursor: 'pointer', padding: 0 }}
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              autoComplete="current-password"
              required
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
                  ↻ Retry Signing In
                </button>
              )}

              {(errorType === 'not_found' || errorType === 'auth_failed') && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                  <button
                    type="button"
                    className="primary-action"
                    style={{ padding: '6px 14px', fontSize: '13px' }}
                    onClick={() => onRegister && onRegister(email)}
                  >
                    Create account for {email ? email : 'this email'} →
                  </button>
                  <button
                    type="button"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.25)',
                      color: 'inherit',
                      borderRadius: 'var(--radius-sm, 4px)',
                      padding: '6px 14px',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                    onClick={onForgotPassword}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {errorType === 'invalid_password' && (
                <button
                  type="button"
                  className="primary-action"
                  style={{ justifySelf: 'start', padding: '6px 14px', fontSize: '13px' }}
                  onClick={onForgotPassword}
                >
                  Reset password for {email} →
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
            {loading ? 'Signing in…' : 'Continue'}
          </button>
        </form>

        <p className="auth-panel__switch">
          New to the portal?{' '}
          <button type="button" onClick={() => onRegister && onRegister(email)}>
            Create an account
          </button>
        </p>
      </div>
    </section>
  );
}
