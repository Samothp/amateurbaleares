import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { SkeletonList } from '../components/Skeleton';
import { SearchBar, filterByText } from '../components/SearchBar';
import { Toast } from '../components/Toast';

function PartidosPage({ user: _user, profile }) {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [form, setForm] = useState({
    team_id: '',
    opponent_team_id: '',
    date: '',
    result: '',
    jornada: '',
  });
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [lineup, setLineup] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);

  async function fetchData() {
    const supabase = getSupabase();
    if (!supabase) return;

    const [matchesRes, teamsRes, eventsRes] = await Promise.all([
      supabase
        .from('matches')
        .select(
          'id, team_id, opponent, opponent_team_id, date, result, jornada, lineup, created_at'
        )
        .order('jornada', { ascending: true })
        .order('date', { ascending: true }),
      supabase.from('teams').select('id, name, category'),
      supabase.from('match_events').select('match_id, event_type'),
    ]);

    if (matchesRes.data) setMatches(matchesRes.data);
    if (teamsRes.data) setTeams(teamsRes.data);
    if (eventsRes.data) setEvents(eventsRes.data);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!form.team_id) {
      setAvailablePlayers([]);
      return;
    }
    async function fetchPlayers() {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase
        .from('players')
        .select('id, name, dorsal, position')
        .eq('team_id', form.team_id)
        .order('dorsal', { ascending: true });
      if (data) setAvailablePlayers(data);
    }
    fetchPlayers();
  }, [form.team_id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setToast(null);
    const supabase = getSupabase();
    if (!supabase) return;

    const opponentTeam = teams.find((t) => t.id === form.opponent_team_id);
    const opponentName = opponentTeam ? opponentTeam.name : '';

    const payload = {
      team_id: form.team_id || null,
      opponent_team_id: form.opponent_team_id || null,
      opponent: opponentName,
      date: form.date || null,
      result: form.result || null,
      jornada: form.jornada ? parseInt(form.jornada) : null,
      lineup: lineup,
    };

    if (editingMatch) {
      const { error } = await supabase.from('matches').update(payload).eq('id', editingMatch.id);
      if (error) {
        setToast('Error al actualizar: ' + error.message);
      } else {
        setToast('Partido actualizado correctamente');
        resetForm();
        fetchData();
      }
    } else {
      const { error } = await supabase.from('matches').insert(payload);
      if (error) {
        setToast('Error al crear partido: ' + error.message);
      } else {
        setToast('Partido creado correctamente');
        resetForm();
        fetchData();
      }
    }
  };

  const resetForm = () => {
    setForm({ team_id: '', opponent_team_id: '', date: '', result: '', jornada: '' });
    setEditingMatch(null);
    setShowForm(false);
    setLineup([]);
    setAvailablePlayers([]);
  };

  const handleEdit = (match) => {
    setEditingMatch(match);
    setForm({
      team_id: match.team_id || '',
      opponent_team_id: match.opponent_team_id || '',
      date: match.date ? match.date.slice(0, 16) : '',
      result: match.result || '',
      jornada: match.jornada || '',
    });
    setLineup(match.lineup || []);
    setShowForm(true);
  };

  const handleDelete = async (matchId) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('matches').delete().eq('id', matchId);
    if (error) {
      setToast('Error al eliminar: ' + error.message);
    } else {
      setToast('Partido eliminado');
      setDeleteConfirm(null);
      fetchData();
    }
  };

  const getTeamName = (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : 'Sin equipo';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Sin fecha';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canEdit = profile?.role === 'Admin';
  const canCreate = profile?.role === 'Admin';

  const getMatchStatus = (match) => {
    if (!match.date) return match.result ? 'finalizado' : 'sin-fecha';
    const now = new Date();
    const matchDate = new Date(match.date);
    const matchDay = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (match.result) return 'finalizado';
    if (matchDay.getTime() === today.getTime()) return 'en-vivo';
    if (matchDay < today) return 'finalizado';
    return 'proximo';
  };

  const statusLabel = {
    'en-vivo': { text: 'En vivo', color: '#2d6a4f', bg: '#d4edda' },
    finalizado: { text: 'Finalizado', color: '#666', bg: '#f0f0f0' },
    proximo: { text: 'Próximo', color: '#1a1a2e', bg: '#e8eaf6' },
    'sin-fecha': { text: 'Sin fecha', color: '#999', bg: '#f5f5f5' },
  };

  const getMatchStats = (matchId) => {
    const matchEvents = events.filter((e) => e.match_id === matchId);
    return {
      goles: matchEvents.filter((e) => e.event_type === 'gol').length,
      asistencias: matchEvents.filter((e) => e.event_type === 'asistencia').length,
      faltas: matchEvents.filter((e) => e.event_type === 'falta').length,
      tarjetas: matchEvents.filter(
        (e) => e.event_type === 'tarjeta_amarilla' || e.event_type === 'tarjeta_roja'
      ).length,
    };
  };

  const filtered = filterByText(matches, search, ['opponent', 'result']);
  const filteredWithJornada = filtered.filter((m) =>
    form.jornada ? m.jornada === parseInt(form.jornada) : true
  );

  const groupedByJornada = useMemo(() => {
    const groups = {};
    filteredWithJornada.forEach((match) => {
      const j = match.jornada || 0;
      if (!groups[j]) groups[j] = [];
      groups[j].push(match);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([jornada, matches]) => ({
        jornada: Number(jornada),
        matches,
      }));
  }, [filteredWithJornada]);

  const handleSearchChange = (val) => {
    setSearch(val);
  };

  const availableOpponents = form.team_id ? teams.filter((t) => t.id !== form.team_id) : teams;

  return (
    <Layout profile={profile}>
      <Toast message={toast} onClose={() => setToast(null)} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <h1 style={{ fontSize: 24 }}>Partidos</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <SearchBar value={search} onChange={handleSearchChange} placeholder="Buscar partido..." />
          {canEdit && (
            <button
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setShowForm(true);
                }
              }}
              style={{
                padding: '10px 20px',
                background: '#1a1a2e',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {showForm ? 'Cancelar' : '+ Nuevo Partido'}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            background: '#fff',
            padding: 24,
            borderRadius: 12,
            marginBottom: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginBottom: 16 }}>{editingMatch ? 'Editar Partido' : 'Crear Partido'}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>
                Equipo local *
              </label>
              <select
                value={form.team_id}
                onChange={(e) =>
                  setForm({ ...form, team_id: e.target.value, opponent_team_id: '' })
                }
                required
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
              >
                <option value="">Seleccionar equipo</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.category ? ' (' + t.category + ')' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>
                Rival *
              </label>
              <select
                value={form.opponent_team_id}
                onChange={(e) => setForm({ ...form, opponent_team_id: e.target.value })}
                required
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
              >
                <option value="">Seleccionar rival</option>
                {availableOpponents.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.category ? ' (' + t.category + ')' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>
                Fecha y hora
              </label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>
                Resultado
              </label>
              <input
                type="text"
                placeholder="ej: 2-1"
                value={form.result}
                onChange={(e) => setForm({ ...form, result: e.target.value })}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>
                Jornada
              </label>
              <input
                type="number"
                placeholder="ej: 1"
                min="1"
                max="38"
                value={form.jornada}
                onChange={(e) => setForm({ ...form, jornada: e.target.value })}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
              />
            </div>
          </div>

          {availablePlayers.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 6 }}>
                Alineación ({lineup.length} jugadores)
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 6,
                  maxHeight: 200,
                  overflowY: 'auto',
                  padding: 8,
                  background: '#f8f9fa',
                  borderRadius: 8,
                }}
              >
                {availablePlayers.map((p) => (
                  <label
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 4,
                      background: lineup.includes(p.id) ? '#e8f5e9' : 'transparent',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={lineup.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setLineup([...lineup, p.id]);
                        } else {
                          setLineup(lineup.filter((id) => id !== p.id));
                        }
                      }}
                    />
                    {p.dorsal ? `#${p.dorsal}` : ''} {p.name}
                    {p.position ? ` (${p.position})` : ''}
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            style={{
              marginTop: 16,
              padding: 10,
              background: '#1a1a2e',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            {editingMatch ? 'Guardar cambios' : 'Crear Partido'}
          </button>
        </form>
      )}

      {loading ? (
        <SkeletonList count={3} />
      ) : filtered.length === 0 ? (
        <div
          style={{
            background: '#fff',
            padding: 48,
            borderRadius: 12,
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <p style={{ color: '#666', marginBottom: 16 }}>
            {search ? 'No se encontraron partidos.' : 'No tienes partidos creados aún.'}
          </p>
          {!search && canEdit && (
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              style={{
                padding: '10px 20px',
                background: '#1a1a2e',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              + Crear primer partido
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 24 }}>
          {groupedByJornada.map((group) => (
            <div key={group.jornada}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    background: '#1a1a2e',
                    color: '#fff',
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {group.jornada > 0 ? `Jornada ${group.jornada}` : 'Sin jornada'}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: '#e0e0e0',
                  }}
                />
                <span style={{ fontSize: 12, color: '#999' }}>
                  {group.matches.length} partido{group.matches.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {group.matches.map((match) => {
                  const stats = getMatchStats(match.id);
                  return (
                    <div
                      key={match.id}
                      style={{
                        background: '#fff',
                        padding: 16,
                        borderRadius: 12,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Link
                          href={`/partidos/${match.id}`}
                          style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ textAlign: 'center', minWidth: 80 }}>
                              <p style={{ fontSize: 12, color: '#999' }}>
                                {formatDate(match.date)}
                              </p>
                              {match.result && (
                                <p
                                  style={{
                                    fontSize: 22,
                                    fontWeight: 'bold',
                                    color: '#1a1a2e',
                                    marginTop: 2,
                                  }}
                                >
                                  {match.result}
                                </p>
                              )}
                            </div>
                            <div>
                              <p style={{ fontSize: 14, color: '#666' }}>
                                {getTeamName(match.team_id)}
                              </p>
                              <p style={{ fontSize: 18, fontWeight: 600 }}>vs {match.opponent}</p>
                            </div>
                            {(() => {
                              const status = getMatchStatus(match);
                              const info = statusLabel[status];
                              return (
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: info.color,
                                    background: info.bg,
                                    padding: '3px 10px',
                                    borderRadius: 12,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {info.text}
                                </span>
                              );
                            })()}
                          </div>
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {(stats.goles > 0 || stats.asistencias > 0 || stats.faltas > 0) && (
                            <div
                              style={{
                                display: 'flex',
                                gap: 8,
                                fontSize: 12,
                                color: '#666',
                              }}
                            >
                              {stats.goles > 0 && <span title="Goles">⚽ {stats.goles}</span>}
                              {stats.asistencias > 0 && (
                                <span title="Asistencias">🅰️ {stats.asistencias}</span>
                              )}
                              {stats.faltas > 0 && <span title="Faltas">⚠️ {stats.faltas}</span>}
                              {stats.tarjetas > 0 && (
                                <span title="Tarjetas">🟨 {stats.tarjetas}</span>
                              )}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: 6 }}>
                            {canEdit && (
                              <button
                                onClick={() => handleEdit(match)}
                                style={{
                                  padding: '6px 12px',
                                  background: '#f0f0f0',
                                  border: 'none',
                                  borderRadius: 6,
                                  cursor: 'pointer',
                                  fontSize: 12,
                                }}
                              >
                                Editar
                              </button>
                            )}
                            <Link
                              href={`/partidos/${match.id}`}
                              style={{
                                padding: '6px 12px',
                                background: '#1a1a2e',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: 12,
                                textDecoration: 'none',
                              }}
                            >
                              Detalle
                            </Link>
                            {canEdit && (
                              <button
                                onClick={() => setDeleteConfirm(match.id)}
                                style={{
                                  padding: '6px 12px',
                                  background: '#ffe0e0',
                                  color: 'crimson',
                                  border: 'none',
                                  borderRadius: 6,
                                  cursor: 'pointer',
                                  fontSize: 12,
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {deleteConfirm === match.id && (
                        <div
                          style={{
                            marginTop: 12,
                            padding: 12,
                            background: '#fff5f5',
                            borderRadius: 8,
                            border: '1px solid #ffcccc',
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ fontSize: 13, flex: 1 }}>¿Eliminar este partido?</span>
                          <button
                            onClick={() => handleDelete(match.id)}
                            style={{
                              padding: '6px 12px',
                              background: 'crimson',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: 12,
                            }}
                          >
                            Sí, eliminar
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            style={{
                              padding: '6px 12px',
                              background: '#f0f0f0',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: 12,
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default withAuth(PartidosPage, ['Entrenador', 'Club', 'Scout', 'Admin']);
