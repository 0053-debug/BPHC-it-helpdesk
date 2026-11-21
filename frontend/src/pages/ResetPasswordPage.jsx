import React, { useState } from 'react';
import { CheckCircle2, KeyRound, ShieldAlert } from 'lucide-react';
import api from '../services/api';

function errorMessage(error) {
  return error.response?.data?.message || error.message || 'Could not reset password. The link may have expired or is invalid.';
}

export default function ResetPasswordPage({ token: initialToken, onPasswordResetSuccess }) {
  const urlToken = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('token') : null;
  const token = initialToken || urlToken || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Password reset token is missing. Please click the reset link in your email again.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', {
        token,
        newPassword,
      });
      setSuccess(data.message || 'Password has been successfully updated! You can now log in.');
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout" aria-labelledby="reset-heading">
      <div className="auth-copy">
        <h1 id="reset-heading">Choose a new password.</h1>
        <p>Set a strong password to protect your campus IT HelpDesk account and service requests.</p>
        <div className="auth-note">
          <KeyRound size={16} aria-hidden="true" />
          <span>Passwords are stored as BCrypt cryptographic hashes and cannot be read by administrators.</span>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-panel__head">
          <h2>Reset password</h2>
          <p>Enter your new password below.</p>
        </div>

        {!token && (
          <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
            <div className="notice notice--danger" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Missing Reset Token</strong>
                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                  No password reset token was found in the link. Please request a new link from the sign in page.
                </p>
              </div>
            </div>
            <button type="button" className="primary-action auth-submit" onClick={onPasswordResetSuccess}>
              Go to Sign In
            </button>
          </div>
        )}

        {token && success ? (
          <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
            <div className="notice notice--success" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Password Reset Successfully!</strong>
                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>{success}</p>
              </div>
            </div>
            <button type="button" className="primary-action auth-submit" onClick={onPasswordResetSuccess}>
              Sign In with New Password
            </button>
          </div>
        ) : (
          token && (
            <form onSubmit={submit} className="auth-form">
              <label>
                New password <span className="field-hint">At least 8 characters</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={72}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </label>
              <label>
                Confirm new password
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={72}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </label>
              {error && <p role="alert" className="notice notice--danger">{error}</p>}
              {loading && (
                <p className="priority-note" style={{ margin: 0, textAlign: 'center' }}>
                  Connecting to cloud server… (If waking from sleep, may take ~20s)
                </p>
              )}
              <button type="submit" disabled={loading} className="primary-action auth-submit">
                {loading ? 'Updating password…' : 'Update password'}
              </button>
            </form>
          )
        )}
      </div>
    </section>
  );
}
