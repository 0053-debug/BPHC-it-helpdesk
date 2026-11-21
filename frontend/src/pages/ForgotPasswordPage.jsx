import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from 'lucide-react';
import api from '../services/api';

function errorMessage(error) {
  return error.response?.data?.message || error.message || 'Could not send reset link. Please check your email and try again.';
}

export default function ForgotPasswordPage({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setResetLink('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSuccess(data.message || 'Password reset link generated.');
      if (data.resetLink) {
        setResetLink(data.resetLink);
      }
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout" aria-labelledby="forgot-heading">
      <div className="auth-copy">
        <h1 id="forgot-heading">Recover your password.</h1>
        <p>Enter the email address registered with your campus account and we will generate a secure link to reset your password.</p>
        <div className="auth-note">
          <Mail size={16} aria-hidden="true" />
          <span>The reset link is valid for 15 minutes and protects against unauthorized access.</span>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-panel__head">
          <h2>Forgot password?</h2>
          <p>We'll generate password recovery instructions for your account.</p>
        </div>

        {success ? (
          <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
            <div className="notice notice--success" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>{resetLink ? 'Reset Link Ready' : 'Check your inbox'}</strong>
                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>{success}</p>
              </div>
            </div>

            {resetLink && (
              <div className="priority-note" style={{ display: 'grid', gap: '8px', padding: '14px' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>
                  One-Click Password Reset:
                </p>
                <a
                  href={resetLink}
                  className="primary-action"
                  style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px 16px' }}
                >
                  <KeyRound size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '6px' }} />
                  Reset Password Now &rarr;
                </a>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-ink-2)', wordBreak: 'break-all' }}>
                  Direct URL: <a href={resetLink} style={{ color: 'var(--color-cool)' }}>{resetLink}</a>
                </p>
              </div>
            )}

            <button type="button" className="primary-action auth-submit" onClick={onBackToLogin}>
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="auth-form">
            <label>
              Email address
              <input
                type="email"
                autoComplete="email"
                required
                maxLength={255}
                placeholder="e.g. yourname@gmail.com or campus ID"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            {error && <p role="alert" className="notice notice--danger">{error}</p>}
            {loading && (
              <p className="priority-note" style={{ margin: 0, textAlign: 'center' }}>
                Connecting to cloud server… (If waking from sleep, may take ~20s)
              </p>
            )}
            <button type="submit" disabled={loading} className="primary-action auth-submit">
              {loading ? 'Generating link…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="auth-panel__switch">
          Remember your password?{' '}
          <button type="button" onClick={onBackToLogin} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={13} aria-hidden="true" /> Back to Sign In
          </button>
        </p>
      </div>
    </section>
  );
}
