import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getSupabase } from '../lib/supabaseClient';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) {
      setMessage('Supabase no está configurado.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Contraseña actualizada correctamente.');
      setTimeout(() => router.push('/login'), 2000);
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: 'Inter, sans-serif', maxWidth: 480, margin: '0 auto' }}>
      <h1>Nueva contraseña</h1>
      <p>Introduce tu nueva contraseña.</p>
      <form onSubmit={handleReset} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
        <label>
          Nueva contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: '100%', padding: 10, marginTop: 8 }}
          />
        </label>
        <label>
          Confirmar contraseña
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: '100%', padding: 10, marginTop: 8 }}
          />
        </label>
        <button type="submit" disabled={loading} style={{ padding: 12 }}>
          {loading ? 'Actualizando...' : 'Actualizar contraseña'}
        </button>
        {message && (
          <p style={{ color: message.includes('correctamente') ? 'green' : 'crimson' }}>
            {message}
          </p>
        )}
      </form>
      <p style={{ marginTop: 24 }}>
        <Link href="/login">Volver al login</Link>
      </p>
    </main>
  );
}
