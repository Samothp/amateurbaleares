import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getSupabase } from '../lib/supabaseClient';

const ROLE_OPTIONS = [
  { value: 'Entrenador', label: 'Entrenador' },
  { value: 'Club', label: 'Club' },
  { value: 'Scout', label: 'Scout' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Entrenador');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

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

    const roleToSave = role;

    const { data, error } = await supabase.auth.signUp(
      {
        email,
        password,
      },
      {
        data: {
          full_name: name,
          role: roleToSave,
        },
      }
    );

    if (error) {
      setLoading(false);
      setMessage(error.message);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      const { data: upsertData, error: upsertError } = await supabase.from('users').upsert({
        id: userId,
        name,
        email,
        role: roleToSave,
      });

      if (upsertError) {
        console.error('Error upserting user profile:', upsertError);
        setLoading(false);
        setMessage('Registro completado, pero fallo al guardar el perfil: ' + upsertError.message);
        return;
      }
    }

    setLoading(false);
    setMessage('Registro completado. Revisa tu correo o inicia sesión.');
    router.push('/login');
  };

  return (
    <main style={{ padding: 24, fontFamily: 'Inter, sans-serif', maxWidth: 540, margin: '0 auto' }}>
      <h1>Registro</h1>
      <p>Regístrate con tu rol para comenzar a usar la plataforma.</p>
      <form onSubmit={handleRegister} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
        <label>
          Nombre completo
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            style={{ width: '100%', padding: 10, marginTop: 8 }}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            style={{ width: '100%', padding: 10, marginTop: 8 }}
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            style={{ width: '100%', padding: 10, marginTop: 8 }}
          />
        </label>
        <label>
          Rol
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            style={{ width: '100%', padding: 10, marginTop: 8 }}
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
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
