import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Copy, Check, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import api from '../services/api';

function errorMessage(error) {
  return error.response?.data?.message || error.message || 'Could not generate reset link. Please check your email and try again.';
}

export default function ForgotPasswordPage({ onBackToLogin, onNavigateToReset }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setResetLink('');
    setCopied(false);
    setLoading(true);

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      const generatedLink = data.resetLink;
      if (generatedLink) {
        setResetLink(generatedLink);
      }
      setSuccess(data.message || 'A secure, single-use password reset link has been generated.');
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToReset = () => {
    let extractedToken = '';
    try {
      const url = new URL(resetLink);
      extractedToken = url.searchParams.get('token') || '';
    } catch {
      const match = resetLink.match(/token=([^&]+)/);
      if (match) extractedToken = match[1];
    }

    if (onNavigateToReset && extractedToken) {
      onNavigateToReset(extractedToken);
    } else if (resetLink) {
      window.location.href = resetLink;
    }
  };

  const copyLink = async () => {
    if (!resetLink) return;
    try {
      await navigator.clipboard.writeText(resetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
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
                <strong>Secure Reset Link Ready</strong>
                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                  A 15-minute single-use secure reset token has been verified for your account.
                </p>
              </div>
            </div>

            {resetLink && (
              <div className="priority-note" style={{ display: 'grid', gap: '10px', padding: '16px' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>
                  Proceed to Reset:
                </p>
                <button
                  type="button"
                  onClick={handleProceedToReset}
                  className="primary-action auth-submit"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <KeyRound size={16} />
                  Reset Password Now &rarr;
                </button>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    readOnly
                    value={resetLink}
                    style={{ fontSize: '12px', padding: '8px 10px', borderRadius: '4px', flex: 1, minWidth: 0 }}
                  />
                  <button
                    type="button"
                    onClick={copyLink}
                    className="secondary-action"
                    style={{ padding: '8px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-ink-2)' }}>
                  <ShieldCheck size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                  Stored with BCrypt hash verification. Inactivated immediately after first use or 15 minutes.
                </p>
              </div>
            )}

            <button type="button" className="secondary-action auth-submit" onClick={onBackToLogin}>
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
                Generating secure reset token…
              </p>
            )}
            <button type="submit" disabled={loading} className="primary-action auth-submit">
              {loading ? 'Generating link…' : 'Generate reset link'}
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
