import { useEffect, useState } from 'react';
import Link from 'next/link';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';

function PartidosPage({ user, profile }) {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ team_id: '', opponent: '', date: '', result: '' });
  const [message, setMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  async function fetchData() {
    const supabase = getSupabase();
    if (!supabase) return;

    const [matchesRes, teamsRes] = await Promise.all([
      supabase.from('matches').select('id, team_id, opponent, date, result, created_at').order('date', { ascending: false }),
      supabase.from('teams').select('id, name, category'),
    ]);

    if (matchesRes.data) setMatches(matchesRes.data);
    if (teamsRes.data) setTeams(teamsRes.data);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage(null);
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase.from('matches').insert({
      team_id: form.team_id || null,
      opponent: form.opponent,
      date: form.date || null,
      result: form.result || null,
    });

    if (error) {
      setMessage('Error al crear partido: ' + error.message);
    } else {
      setMessage('Partido creado correctamente');
      setForm({ team_id: '', opponent: '', date: '', result: '' });
      setShowForm(false);
      fetchData();
    }
  };

  const handleDelete = async (matchId) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('matches').delete().eq('id', matchId);
    if (error) {
      setMessage('Error al eliminar: ' + error.message);
    } else {
      setMessage('Partido eliminado');
      setDeleteConfirm(null);
      fetchData();
    }
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? `${team.name}${team.category ? ' (' + team.category + ')' : ''}` : 'Sin equipo';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Sin fecha';
    return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const canEdit = profile?.role === 'Entrenador' || profile?.role === 'Club' || profile?.role === 'Admin';

  return (
    <Layout profile={profile}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Partidos</h1>
        {canEdit && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            {showForm ? 'Cancelar' : '+ Nuevo Partido'}
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
          <h3 style={{ marginBottom: 16 }}>Crear Partido</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <select value={form.team_id} onChange={(e) => setForm({ ...form, team_id: e.target.value })} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
              <option value="">Seleccionar equipo</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}{t.category ? ' (' + t.category + ')' : ''}</option>
              ))}
            </select>
            <input type="text" placeholder="Rival" value={form.opponent} onChange={(e) => setForm({ ...form, opponent: e.target.value })} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
            <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
            <input type="text" placeholder="Resultado (ej: 2-1)" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
          </div>
          <button type="submit" style={{ marginTop: 16, padding: 10, background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', width: '100%' }}>
            Crear Partido
          </button>
        </form>
      )}

      {loading ? (
        <p>Cargando partidos...</p>
      ) : matches.length === 0 ? (
        <div style={{ background: '#fff', padding: 48, borderRadius: 12, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#666' }}>No hay partidos registrados aún.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {matches.map((match) => (
            <div key={match.id} style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href={`/partidos/${match.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'center', minWidth: 80 }}>
                      <p style={{ fontSize: 12, color: '#999' }}>{formatDate(match.date)}</p>
                      {match.result && (
                        <p style={{ fontSize: 20, fontWeight: 'bold', color: '#1a1a2e', marginTop: 4 }}>{match.result}</p>
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, color: '#999' }}>{getTeamName(match.team_id)}</p>
                      <p style={{ fontSize: 18, fontWeight: 600 }}>vs {match.opponent}</p>
                    </div>
                  </div>
                </Link>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/partidos/${match.id}`} style={{ padding: '8px 16px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, textDecoration: 'none' }}>
                    Ver detalle
                  </Link>
                  {canEdit && (
                    <>
                      <Link href={`/partidos/${match.id}?live=true`} style={{ padding: '8px 16px', background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, textDecoration: 'none' }}>
                        En vivo
                      </Link>
                      <button onClick={() => setDeleteConfirm(match.id)} style={{ padding: '8px 16px', background: '#ffe0e0', color: 'crimson', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>
              {deleteConfirm === match.id && (
                <div style={{ marginTop: 12, padding: 12, background: '#fff5f5', borderRadius: 8, border: '1px solid #ffcccc' }}>
                  <p style={{ fontSize: 13, marginBottom: 8 }}>¿Eliminar este partido?</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleDelete(match.id)} style={{ padding: '6px 12px', background: 'crimson', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Sí, eliminar</button>
                    <button onClick={() => setDeleteConfirm(null)} style={{ padding: '6px 12px', background: '#f0f0f0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
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

export default withAuth(PartidosPage, ['Entrenador', 'Club', 'Scout', 'Admin']);
