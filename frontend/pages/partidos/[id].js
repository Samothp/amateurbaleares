import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import withAuth from '../../lib/withAuth';
import { getSupabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';

const EVENT_TYPES = [
  { value: 'gol', label: '⚽ Gol', color: '#2d6a4f' },
  { value: 'asistencia', label: '🅰️ Asistencia', color: '#40916c' },
  { value: 'tiro', label: '🥅 Tiro', color: '#52796f' },
  { value: 'pase_clave', label: '🎯 Pase clave', color: '#354f52' },
  { value: 'perdida', label: '❌ Pérdida', color: 'crimson' },
  { value: 'recuperacion', label: '🔄 Recuperación', color: '#2d6a4f' },
  { value: 'falta', label: '⚠️ Falta', color: '#e76f51' },
  { value: 'tarjeta_amarilla', label: '🟨 Tarjeta amarilla', color: '#e9c46a' },
  { value: 'tarjeta_roja', label: '🟥 Tarjeta roja', color: 'crimson' },
  { value: 'parada', label: '🧤 Parada', color: '#264653' },
  { value: 'despeje', label: '🛡️ Despeje', color: '#2a9d8f' },
];

function MatchDetailPage({ user, profile }) {
  const router = useRouter();
  const { id, live } = router.query;
  const [match, setMatch] = useState(null);
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [eventForm, setEventForm] = useState({
    player_id: '',
    event_type: 'gol',
    minute: '',
    notes: '',
  });
  const [message, setMessage] = useState(null);

  async function fetchData() {
    if (!id) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const { data: matchData } = await supabase.from('matches').select('*').eq('id', id).single();
    if (matchData) {
      setMatch(matchData);

      const { data: teamData } = await supabase
        .from('teams')
        .select('id, name, category')
        .eq('id', matchData.team_id)
        .single();
      setTeam(teamData);

      const { data: playersData } = await supabase
        .from('players')
        .select('id, name, position, dorsal')
        .eq('team_id', matchData.team_id)
        .order('dorsal');
      if (playersData) setPlayers(playersData);

      const { data: eventsData } = await supabase
        .from('match_events')
        .select('id, player_id, event_type, minute, metadata, created_at')
        .eq('match_id', id)
        .order('minute', { ascending: true });
      if (eventsData) setEvents(eventsData);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [id]);
  useEffect(() => {
    if (live === 'true') setIsLive(true);
  }, [live]);

  useEffect(() => {
    if (!id) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel(`match-events-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'match_events', filter: `match_id=eq.${id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEvents((prev) =>
              [...prev, payload.new].sort((a, b) => (a.minute || 0) - (b.minute || 0))
            );
          } else if (payload.eventType === 'DELETE') {
            setEvents((prev) => prev.filter((e) => e.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setMessage(null);
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase.from('match_events').insert({
      match_id: id,
      player_id: eventForm.player_id || null,
      event_type: eventForm.event_type,
      minute: eventForm.minute ? parseInt(eventForm.minute) : null,
      metadata: eventForm.notes ? { notes: eventForm.notes } : null,
    });

    if (error) {
      setMessage('Error al registrar evento: ' + error.message);
    } else {
      setMessage('Evento registrado');
      setEventForm({ player_id: '', event_type: 'gol', minute: '', notes: '' });
      fetchData();
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('match_events').delete().eq('id', eventId);
    if (!error) {
      setEvents(events.filter((ev) => ev.id !== eventId));
    }
  };

  const getEventLabel = (type) => {
    const found = EVENT_TYPES.find((e) => e.value === type);
    return found ? found.label : type;
  };

  const getEventColor = (type) => {
    const found = EVENT_TYPES.find((e) => e.value === type);
    return found ? found.color : '#666';
  };

  const getPlayerName = (playerId) => {
    const player = players.find((p) => p.id === playerId);
    return player ? `${player.name}${player.dorsal ? ' #' + player.dorsal : ''}` : 'Desconocido';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Sin fecha';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canEdit =
    profile?.role === 'Entrenador' || profile?.role === 'Club' || profile?.role === 'Admin';

  if (loading)
    return (
      <Layout profile={profile}>
        <p>Cargando partido...</p>
      </Layout>
    );
  if (!match)
    return (
      <Layout profile={profile}>
        <p>Partido no encontrado.</p>
      </Layout>
    );

  return (
    <Layout profile={profile}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/partidos" style={{ color: '#666', fontSize: 14, textDecoration: 'none' }}>
          ← Volver a partidos
        </Link>
      </div>

      <div
        style={{
          background: '#fff',
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <p style={{ color: '#999', fontSize: 13 }}>{formatDate(match.date)}</p>
            <h1 style={{ fontSize: 28, marginTop: 4 }}>
              {team?.name || 'Equipo'} vs {match.opponent}
            </h1>
            {match.result && (
              <p style={{ fontSize: 20, color: '#1a1a2e', marginTop: 8 }}>
                Resultado: {match.result}
              </p>
            )}
          </div>
          {canEdit && (
            <button
              onClick={() => setIsLive(!isLive)}
              style={{
                padding: '10px 20px',
                background: isLive ? '#c1121f' : '#2d6a4f',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {isLive ? '⏹ Terminar' : '🔴 En vivo'}
            </button>
          )}
        </div>
      </div>

      {isLive && canEdit && (
        <form
          onSubmit={handleAddEvent}
          style={{
            background: '#f0fff4',
            padding: 24,
            borderRadius: 12,
            border: '2px solid #2d6a4f',
            marginBottom: 24,
          }}
        >
          <h3 style={{ marginBottom: 16, color: '#2d6a4f' }}>Registrar evento en vivo</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <select
              value={eventForm.player_id}
              onChange={(e) => setEventForm({ ...eventForm, player_id: e.target.value })}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
            >
              <option value="">Seleccionar jugador</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.dorsal ? ' #' + p.dorsal : ''}
                </option>
              ))}
            </select>
            <select
              value={eventForm.event_type}
              onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
            >
              {EVENT_TYPES.map((ev) => (
                <option key={ev.value} value={ev.value}>
                  {ev.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Minuto"
              value={eventForm.minute}
              onChange={(e) => setEventForm({ ...eventForm, minute: e.target.value })}
              min="0"
              max="120"
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
            />
          </div>
          <input
            type="text"
            placeholder="Notas (opcional)"
            value={eventForm.notes}
            onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 8,
              border: '1px solid #ccc',
              marginTop: 12,
            }}
          />
          <button
            type="submit"
            style={{
              marginTop: 12,
              padding: '10px 20px',
              background: '#2d6a4f',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Registrar Evento
          </button>
        </form>
      )}

      {message && (
        <p
          style={{
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            background: message.includes('Error') ? '#ffe0e0' : '#e0ffe0',
            color: message.includes('Error') ? 'crimson' : 'green',
          }}
        >
          {message}
        </p>
      )}

      <div
        style={{
          background: '#fff',
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ marginBottom: 16 }}>Eventos del partido</h2>
        {events.length === 0 ? (
          <p style={{ color: '#666' }}>No hay eventos registrados.</p>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {events.map((event) => (
              <div
                key={event.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  background: '#f8f9fa',
                  borderRadius: 8,
                }}
              >
                <span style={{ fontSize: 13, color: '#999', minWidth: 40 }}>
                  {event.minute != null ? `${event.minute}'` : '--'}
                </span>
                <span style={{ fontSize: 14 }}>{getEventLabel(event.event_type)}</span>
                <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>
                  {getPlayerName(event.player_id)}
                </span>
                {event.metadata?.notes && (
                  <span style={{ fontSize: 12, color: '#999', marginLeft: 'auto' }}>
                    {event.metadata.notes}
                  </span>
                )}
                {canEdit && (
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    style={{
                      marginLeft: 'auto',
                      background: 'none',
                      border: 'none',
                      color: '#ccc',
                      cursor: 'pointer',
                      fontSize: 16,
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default withAuth(MatchDetailPage, ['Entrenador', 'Club', 'Scout', 'Admin']);
