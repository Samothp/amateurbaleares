import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getSupabase } from '../lib/supabaseClient';
import { FormField } from '../components/FormField';
import { PasswordStrength } from '../components/PasswordStrength';
import { mapAuthError } from '../lib/auth';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setTokenValid(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
      }
    });
  }, []);

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
      setMessage(mapAuthError(error));
    } else {
      setMessage('Contraseña actualizada correctamente.');
      setTimeout(() => router.push('/login'), 2000);
    }
  };

  if (tokenValid === null) {
    return (
      <main style={{ padding: 24, fontFamily: 'Inter, sans-serif', maxWidth: 480, margin: '0 auto' }}>
        <p>Verificando enlace...</p>
      </main>
    );
  }

  if (tokenValid === false) {
    return (
      <main style={{ padding: 24, fontFamily: 'Inter, sans-serif', maxWidth: 480, margin: '0 auto' }}>
        <h1>Enlace no válido</h1>
        <p style={{ color: '#666', marginTop: 12 }}>
          El enlace de recuperación no es válido o ha expirado.
        </p>
        <p style={{ marginTop: 24 }}>
          <Link href="/forgot-password">Solicitar nuevo enlace</Link>
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: 'Inter, sans-serif', maxWidth: 480, margin: '0 auto' }}>
      <h1>Nueva contraseña</h1>
      <p>Introduce tu nueva contraseña.</p>
      <form onSubmit={handleReset} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
        <div>
          <FormField
            label="Nueva contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
          />
          <PasswordStrength password={password} />
        </div>
        <FormField
          label="Confirmar contraseña"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          placeholder="Mínimo 6 caracteres"
        />
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
