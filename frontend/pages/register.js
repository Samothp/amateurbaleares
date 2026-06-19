import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getSupabase } from '../lib/supabaseClient';
import { FormField } from '../components/FormField';
import { PasswordStrength } from '../components/PasswordStrength';
import GoogleLogo from '../components/GoogleLogo';
import { mapAuthError } from '../lib/auth';

const ROLE_OPTIONS = [
  { value: 'Aficionado', label: 'Aficionado (Free)', description: 'Acceso básico gratuito' },
  { value: 'Club', label: 'Club', description: 'Gestión de clubs y equipos' },
  { value: 'Entrenador', label: 'Entrenador', description: 'Gestión de equipos y jugadores' },
  { value: 'Ojeador', label: 'Ojeador', description: 'Scouting y análisis de jugadores' },
  { value: 'Jugador', label: 'Jugador', description: 'Mi ficha y estadísticas' },
];

const EXTRA_FIELDS = {
  Entrenador: [
    { name: 'license', label: 'Licencia/Titulación', type: 'text', placeholder: 'Ej: UEFA B' },
  ],
  Club: [
    { name: 'club_name', label: 'Nombre del club', type: 'text', placeholder: 'Ej: RCD Mallorca' },
    { name: 'position_in_club', label: 'Cargo', type: 'text', placeholder: 'Ej: Presidente, Director Deportivo' },
  ],
  Ojeador: [
    { name: 'scout_zone', label: 'Zona de scouting', type: 'text', placeholder: 'Ej: Mallorca' },
  ],
  Jugador: [
    { name: 'position', label: 'Posición', type: 'select', options: ['Portero', 'Defensa', 'Centrocampista', 'Delantero', 'Otro'] },
    { name: 'birth_year', label: 'Año de nacimiento', type: 'number', placeholder: 'Ej: 1995' },
    { name: 'dominant_foot', label: 'Pie dominante', type: 'select', options: ['Derecho', 'Izquierdo', 'Ambidiestro'] },
  ],
  Aficionado: [],
  Admin: [],
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [requestedRole, setRequestedRole] = useState('Aficionado');
  const [extraFields, setExtraFields] = useState({});
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function fetchTeams() {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase.from('teams').select('id, name, category').order('name');
      if (data) setTeams(data);
    }
    if (requestedRole === 'Jugador') fetchTeams();
  }, [requestedRole]);

  const roleFields = EXTRA_FIELDS[requestedRole] || [];

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
          role: 'Aficionado',
        },
      }
    );

    if (error) {
      setLoading(false);
      setMessage(mapAuthError(error));
      return;
    }

    const userId = data.user?.id;
    const isSubscriptionRole = requestedRole !== 'Aficionado';
    if (userId) {
      const { error: upsertError } = await supabase.from('users').upsert({
        id: userId,
        name,
        email,
        role: 'Aficionado',
        requested_role: isSubscriptionRole ? requestedRole : null,
        role_status: isSubscriptionRole ? 'pending' : 'none',
        role_requested_at: isSubscriptionRole ? new Date().toISOString() : null,
        ...extraFields,
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
        <GoogleLogo size={18} />
        {googleLoading ? 'Conectando...' : 'Continuar con Google'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#ddd' }} />
        <span style={{ color: '#999', fontSize: 13 }}>o</span>
        <div style={{ flex: 1, height: 1, background: '#ddd' }} />
      </div>

      <form onSubmit={handleRegister} style={{ display: 'grid', gap: 16 }}>
        <FormField label="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
        <FormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div>
          <FormField label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" />
          <PasswordStrength password={password} />
        </div>
        <div>
          <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>Rol solicitado</label>
          <select
            value={requestedRole}
            onChange={(e) => { setRequestedRole(e.target.value); setExtraFields({}); }}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <p style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{ROLE_OPTIONS.find(r => r.value === requestedRole)?.description}</p>
        </div>

        {roleFields.map(field => {
          if (field.type === 'select') {
            return (
              <div key={field.name}>
                <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>{field.label}</label>
                <select
                  value={extraFields[field.name] || ''}
                  onChange={(e) => setExtraFields(prev => ({ ...prev, [field.name]: e.target.value }))}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
                >
                  <option value="">Seleccionar...</option>
                  {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            );
          }
          return (
            <FormField
              key={field.name}
              label={field.label}
              type={field.type}
              placeholder={field.placeholder}
              value={extraFields[field.name] || ''}
              onChange={(e) => setExtraFields(prev => ({ ...prev, [field.name]: e.target.value }))}
            />
          );
        })}

        {requestedRole === 'Jugador' && teams.length > 0 && (
          <div>
            <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>Equipo actual</label>
            <select
              value={extraFields.current_team_id || ''}
              onChange={(e) => setExtraFields(prev => ({ ...prev, current_team_id: e.target.value }))}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
            >
              <option value="">Seleccionar equipo...</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.category})</option>)}
            </select>
          </div>
        )}

        <button type="submit" disabled={loading} style={{ padding: 12, background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 16, fontWeight: 500 }}>
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
        {message ? <p style={{ color: message.includes('completado') ? 'green' : 'crimson', fontSize: 14 }}>{message}</p> : null}
      </form>
      <p style={{ marginTop: 24 }}>
        ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
      </p>
    </main>
  );
}
