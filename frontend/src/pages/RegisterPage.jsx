import React, { useState } from 'react';
import api from '../services/api';

function errorMessage(error) {
  return error.response?.data?.message || 'Registration failed. Check your details and try again.';
}

export default function RegisterPage({ onAuthenticated, onLogin, onHome }) {
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
    <section className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
      {onHome && (
        <button onClick={onHome} className="text-sm text-blue-700 hover:underline mb-2 block">
          Back to home
        </button>
      )}
      <h1 className="text-2xl font-bold text-slate-900 mt-5">Create an account</h1>
      <p className="text-sm text-slate-600 mt-1">New registrations receive the Employee role.</p>
      <form onSubmit={submit} className="space-y-4 mt-6">
        <label className="block text-sm font-medium text-slate-700">
          Full name
          <input
            autoComplete="name"
            required
            maxLength={150}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            autoComplete="email"
            required
            maxLength={255}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password (at least 8 characters)
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Register'}
        </button>
      </form>
      <p className="text-sm text-slate-600 mt-5">
        Already registered? <button onClick={onLogin} className="text-blue-700 font-semibold hover:underline">Sign in</button>
      </p>
    </section>
  );
}
