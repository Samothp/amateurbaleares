import { useEffect, useState } from 'react';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';

function JugadoresPage({ user, profile }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', age: '', position: '', dorsal: '', height: '', weight: '', dominant_foot: '' });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function fetchPlayers() {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data, error } = await supabase
        .from('players')
        .select('id, name, age, position, dorsal, created_at')
        .order('created_at', { ascending: false });

      if (data) setPlayers(data);
      setLoading(false);
    }
    fetchPlayers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage(null);
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase.from('players').insert({
      name: form.name,
      age: form.age ? parseInt(form.age) : null,
      position: form.position,
      dorsal: form.dorsal ? parseInt(form.dorsal) : null,
      height: form.height ? parseFloat(form.height) : null,
      weight: form.weight ? parseFloat(form.weight) : null,
      dominant_foot: form.dominant_foot,
    });

    if (error) {
      setMessage('Error al crear jugador: ' + error.message);
    } else {
      setMessage('Jugador creado correctamente');
      setForm({ name: '', age: '', position: '', dorsal: '', height: '', weight: '', dominant_foot: '' });
      setShowForm(false);
      const { data } = await supabase.from('players').select('id, name, age, position, dorsal, created_at').order('created_at', { ascending: false });
      if (data) setPlayers(data);
    }
  };

  return (
    <Layout profile={profile}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Jugadores</h1>
        {(profile?.role === 'Entrenador' || profile?.role === 'Club' || profile?.role === 'Admin') && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            {showForm ? 'Cancelar' : '+ Nuevo Jugador'}
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
          <h3 style={{ marginBottom: 16 }}>Crear Jugador</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input type="text" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
            <input type="number" placeholder="Edad" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
            <input type="text" placeholder="Posición" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
            <input type="number" placeholder="Dorsal" value={form.dorsal} onChange={(e) => setForm({ ...form, dorsal: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
            <input type="number" placeholder="Altura (cm)" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
            <input type="number" placeholder="Peso (kg)" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
            <select value={form.dominant_foot} onChange={(e) => setForm({ ...form, dominant_foot: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
              <option value="">Pierna dominante</option>
              <option value="Derecha">Derecha</option>
              <option value="Izquierda">Izquierda</option>
              <option value="Ambidiestro">Ambidiestro</option>
            </select>
          </div>
          <button type="submit" style={{ marginTop: 16, padding: 10, background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', width: '100%' }}>
            Crear Jugador
          </button>
        </form>
      )}

      {loading ? (
        <p>Cargando jugadores...</p>
      ) : players.length === 0 ? (
        <div style={{ background: '#fff', padding: 48, borderRadius: 12, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#666' }}>No hay jugadores registrados aún.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {players.map((player) => (
            <div key={player.id} style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: 4 }}>{player.name}</h3>
              <p style={{ color: '#666', fontSize: 14 }}>{player.position || 'Sin posición'}</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 13, color: '#999' }}>
                {player.age && <span>{player.age} años</span>}
                {player.dorsal && <span>#{player.dorsal}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default withAuth(JugadoresPage, ['Entrenador', 'Club', 'Scout', 'Admin']);
