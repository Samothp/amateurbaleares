import { useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '../lib/supabaseClient';
import { mapAuthError } from '../lib/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = getSupabase();
    if (!supabase) {
      setMessage('Supabase no está configurado.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setMessage(mapAuthError(error));
    } else {
      setMessage('Revisa tu correo para restablecer la contraseña.');
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: 'Inter, sans-serif', maxWidth: 480, margin: '0 auto' }}>
      <h1>Recuperar contraseña</h1>
      <p>Te enviaremos un enlace para restablecer tu contraseña.</p>
      <form onSubmit={handleReset} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 10, marginTop: 8 }}
          />
        </label>
        <button type="submit" disabled={loading} style={{ padding: 12 }}>
          {loading ? 'Enviando...' : 'Enviar enlace'}
        </button>
        {message && (
          <p style={{ color: message.includes('Revisa') ? 'green' : 'crimson' }}>{message}</p>
        )}
      </form>
      <p style={{ marginTop: 24 }}>
        <Link href="/login">Volver al login</Link>
      </p>
    </main>
  );
}
