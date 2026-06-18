import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getSupabase } from '../lib/supabaseClient';
import { FormField } from '../components/FormField';
import GoogleLogo from '../components/GoogleLogo';
import { mapAuthError } from '../lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/dashboard');
      }
    });
  }, [router]);

  const handleLogin = async (event) => {
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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(mapAuthError(error));
      return;
    }

    router.push('/dashboard');
  };

  const handleGoogleLogin = async () => {
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
    <main style={{ padding: 24, fontFamily: 'Inter, sans-serif', maxWidth: 480, margin: '0 auto' }}>
      <h1>Login</h1>
      <p>Accede con tu cuenta para continuar.</p>

      <button
        onClick={handleGoogleLogin}
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
        <GoogleLogo size={18} />
        {googleLoading ? 'Conectando...' : 'Continuar con Google'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#ddd' }} />
        <span style={{ color: '#999', fontSize: 13 }}>o</span>
        <div style={{ flex: 1, height: 1, background: '#ddd' }} />
      </div>

      <form onSubmit={handleLogin} style={{ display: 'grid', gap: 16 }}>
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading} style={{ padding: 12 }}>
          {loading ? 'Accediendo...' : 'Acceder'}
        </button>
        {message ? <p style={{ color: 'crimson' }}>{message}</p> : null}
      </form>
      <p style={{ marginTop: 16 }}>
        <Link href="/forgot-password" style={{ color: '#666', fontSize: 14 }}>
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
      <p style={{ marginTop: 24 }}>
        ¿No tienes cuenta? <Link href="/register">Regístrate</Link>
      </p>
    </main>
  );
}
