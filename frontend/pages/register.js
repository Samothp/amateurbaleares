import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getSupabase } from '../lib/supabaseClient';
import { FormField } from '../components/FormField';
import { PasswordStrength } from '../components/PasswordStrength';
import { mapAuthError } from '../lib/auth';

const DEFAULT_ROLE = 'Entrenador';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = getSupabase();
    if (!supabase) {
      setMessage(
        'Supabase no está configurado. Copia .env.local.example a .env.local con tus credenciales.'
      );
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp(
      {
        email,
        password,
      },
      {
        data: {
          full_name: name,
          role: DEFAULT_ROLE,
        },
      }
    );

    if (error) {
      setLoading(false);
      setMessage(mapAuthError(error));
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      const { error: upsertError } = await supabase.from('users').upsert({
        id: userId,
        name,
        email,
        role: DEFAULT_ROLE,
      });

      if (upsertError) {
        setLoading(false);
        setMessage('Registro completado, pero fallo al guardar el perfil: ' + upsertError.message);
        return;
      }
    }

    setLoading(false);
    setMessage('Registro completado. Redirigiendo al login...');
    setTimeout(() => router.push('/login'), 1500);
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    setMessage(null);

    const supabase = getSupabase();
    if (!supabase) {
      setMessage('Supabase no está configurado.');
      setGoogleLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setMessage(mapAuthError(error));
      setGoogleLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: 'Inter, sans-serif', maxWidth: 540, margin: '0 auto' }}>
      <h1>Registro</h1>
      <p>Regístrate con tu rol para comenzar a usar la plataforma.</p>

      <button
        onClick={handleGoogleRegister}
        disabled={googleLoading}
        style={{
          width: '100%',
          padding: 12,
          marginTop: 24,
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        {googleLoading ? 'Conectando...' : 'Continuar con Google'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#ddd' }} />
        <span style={{ color: '#999', fontSize: 13 }}>o</span>
        <div style={{ flex: 1, height: 1, background: '#ddd' }} />
      </div>

      <p style={{ marginTop: 24, fontSize: 14, color: '#666' }}>
        Tu cuenta se creará como <strong>Entrenador</strong>. Un administrador puede cambiar tu rol después.
      </p>
      <form onSubmit={handleRegister} style={{ display: 'grid', gap: 16 }}>
        <FormField
          label="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
        />
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div>
          <FormField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
          />
          <PasswordStrength password={password} />
        </div>
        <button type="submit" disabled={loading} style={{ padding: 12 }}>
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
        {message ? (
          <p style={{ color: message.includes('completado') ? 'green' : 'crimson' }}>{message}</p>
        ) : null}
      </form>
      <p style={{ marginTop: 24 }}>
        ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
      </p>
    </main>
  );
}
