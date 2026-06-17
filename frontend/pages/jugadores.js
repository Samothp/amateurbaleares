import { useEffect, useState } from 'react';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';

function JugadoresPage({ user, profile }) {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [form, setForm] = useState({ name: '', age: '', position: '', dorsal: '', height: '', weight: '', dominant_foot: '', team_id: '' });
  const [message, setMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  async function fetchData() {
    const supabase = getSupabase();
    if (!supabase) return;

    const [playersRes, teamsRes] = await Promise.all([
      supabase.from('players').select('id, name, age, position, dorsal, height, weight, dominant_foot, photo, team_id, created_at').order('created_at', { ascending: false }),
      supabase.from('teams').select('id, name, category'),
    ]);

    if (playersRes.data) setPlayers(playersRes.data);
    if (teamsRes.data) setTeams(teamsRes.data);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ name: '', age: '', position: '', dorsal: '', height: '', weight: '', dominant_foot: '', team_id: '' });
    setEditingPlayer(null);
    setShowForm(false);
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setForm({
      name: player.name || '',
      age: player.age || '',
      position: player.position || '',
      dorsal: player.dorsal || '',
      height: player.height || '',
      weight: player.weight || '',
      dominant_foot: player.dominant_foot || '',
      team_id: player.team_id || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const supabase = getSupabase();
    if (!supabase) return;

    const payload = {
      name: form.name,
      age: form.age ? parseInt(form.age) : null,
      position: form.position || null,
      dorsal: form.dorsal ? parseInt(form.dorsal) : null,
      height: form.height ? parseFloat(form.height) : null,
      weight: form.weight ? parseFloat(form.weight) : null,
      dominant_foot: form.dominant_foot || null,
      team_id: form.team_id || null,
    };

    if (editingPlayer) {
      const { error } = await supabase.from('players').update(payload).eq('id', editingPlayer.id);
      if (error) {
        setMessage('Error al actualizar: ' + error.message);
      } else {
        setMessage('Jugador actualizado correctamente');
        resetForm();
        fetchData();
      }
    } else {
      const { error } = await supabase.from('players').insert(payload);
      if (error) {
        setMessage('Error al crear: ' + error.message);
      } else {
        setMessage('Jugador creado correctamente');
        resetForm();
        fetchData();
      }
    }
  };

  const handleDelete = async (playerId) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('players').delete().eq('id', playerId);
    if (error) {
      setMessage('Error al eliminar: ' + error.message);
    } else {
      setMessage('Jugador eliminado');
      setDeleteConfirm(null);
      fetchData();
    }
  };

  const handlePhotoUpload = async (e, playerId) => {
    const file = e.target.files[0];
    if (!file) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const ext = file.name.split('.').pop();
    const path = `players/${playerId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setMessage('Error al subir foto: ' + uploadError.message);
      return;
    }

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from('players')
      .update({ photo: publicUrl })
      .eq('id', playerId);

    if (updateError) {
      setMessage('Error al guardar foto: ' + updateError.message);
    } else {
      setMessage('Foto actualizada');
      fetchData();
    }
  };

  const canEdit = profile?.role === 'Entrenador' || profile?.role === 'Club' || profile?.role === 'Admin';
  const canDelete = profile?.role === 'Entrenador' || profile?.role === 'Club' || profile?.role === 'Admin';

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? `${team.name}${team.category ? ' (' + team.category + ')' : ''}` : 'Sin equipo';
  };

  return (
    <Layout profile={profile}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Jugadores</h1>
        {canEdit && (
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
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
        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: 16 }}>{editingPlayer ? 'Editar Jugador' : 'Crear Jugador'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input type="text" placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
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
            <select value={form.team_id} onChange={(e) => setForm({ ...form, team_id: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
              <option value="">Sin equipo</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}{t.category ? ' (' + t.category + ')' : ''}</option>
              ))}
            </select>
          </div>
          <button type="submit" style={{ marginTop: 16, padding: 10, background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', width: '100%' }}>
            {editingPlayer ? 'Guardar cambios' : 'Crear Jugador'}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {players.map((player) => (
            <div key={player.id} style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'start' }}>
                <div style={{ position: 'relative' }}>
                  {player.photo ? (
                    <img src={player.photo} alt={player.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', background: '#f0f0f0' }} />
                  ) : (
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#ccc' }}>
                      👤
                    </div>
                  )}
                  {canEdit && (
                    <label style={{ position: 'absolute', bottom: -2, right: -2, background: '#1a1a2e', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 10 }}>
                      📷
                      <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, player.id)} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: 2 }}>{player.name}</h3>
                  <p style={{ color: '#666', fontSize: 13 }}>{player.position || 'Sin posición'}</p>
                  <p style={{ color: '#999', fontSize: 12, marginTop: 2 }}>{getTeamName(player.team_id)}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 12, color: '#999' }}>
                    {player.age && <span>{player.age} años</span>}
                    {player.dorsal && <span>#{player.dorsal}</span>}
                    {player.height && <span>{player.height}cm</span>}
                    {player.dominant_foot && <span>{player.dominant_foot}</span>}
                  </div>
                </div>
              </div>
              {canEdit && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                  <button onClick={() => handleEdit(player)} style={{ flex: 1, padding: '6px 12px', background: '#f0f0f0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                    Editar
                  </button>
                  {canDelete && (
                    <button onClick={() => setDeleteConfirm(player.id)} style={{ flex: 1, padding: '6px 12px', background: '#ffe0e0', color: 'crimson', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                      Eliminar
                    </button>
                  )}
                </div>
              )}
              {deleteConfirm === player.id && (
                <div style={{ marginTop: 12, padding: 12, background: '#fff5f5', borderRadius: 8, border: '1px solid #ffcccc' }}>
                  <p style={{ fontSize: 13, marginBottom: 8 }}>¿Eliminar a "{player.name}"?</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleDelete(player.id)} style={{ padding: '6px 12px', background: 'crimson', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                      Sí, eliminar
                    </button>
                    <button onClick={() => setDeleteConfirm(null)} style={{ padding: '6px 12px', background: '#f0f0f0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default withAuth(JugadoresPage, ['Entrenador', 'Club', 'Scout', 'Admin']);
