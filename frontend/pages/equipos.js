import { useEffect, useState } from 'react';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';

function EquiposPage({ user, profile }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', city: '' });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function fetchTeams() {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data, error } = await supabase
        .from('teams')
        .select('id, name, category, created_at')
        .order('created_at', { ascending: false });

      if (data) setTeams(data);
      setLoading(false);
    }
    fetchTeams();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage(null);
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase.from('teams').insert({
      name: form.name,
      category: form.category,
      coach_id: user.id,
    });

    if (error) {
      setMessage('Error al crear equipo: ' + error.message);
    } else {
      setMessage('Equipo creado correctamente');
      setForm({ name: '', category: '', city: '' });
      setShowForm(false);
      const { data } = await supabase.from('teams').select('id, name, category, created_at').order('created_at', { ascending: false });
      if (data) setTeams(data);
    }
  };

  return (
    <Layout profile={profile}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Mis Equipos</h1>
        {(profile?.role === 'Entrenador' || profile?.role === 'Club') && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            {showForm ? 'Cancelar' : '+ Nuevo Equipo'}
          </button>
        )}
      </div>

      {message && (
        <p style={{ padding: 12, borderRadius: 8, marginBottom: 16, background: message.includes('Error') ? '#ffe0e0' : '#e0ffe0', color: message.includes('Error') ? 'crimson' : 'green' }}>
          {message}
        </p>
      )}

      {showForm && (
        <form onSubmit={handleCreate} style={{ background: '#fff', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: 16 }}>Crear Equipo</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <input
              type="text"
              placeholder="Nombre del equipo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
            />
            <input
              type="text"
              placeholder="Categoría (ej: Senior, Juvenil, Cadete)"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
            />
            <button type="submit" style={{ padding: 10, background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              Crear
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Cargando equipos...</p>
      ) : teams.length === 0 ? (
        <div style={{ background: '#fff', padding: 48, borderRadius: 12, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#666' }}>No tienes equipos creados aún.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {teams.map((team) => (
            <div key={team.id} style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: 8 }}>{team.name}</h3>
              <p style={{ color: '#666', fontSize: 14 }}>{team.category || 'Sin categoría'}</p>
              <p style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                Creado: {new Date(team.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default withAuth(EquiposPage, ['Entrenador', 'Club', 'Admin']);
