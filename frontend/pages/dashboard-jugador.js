import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { StatCard } from '../components/StatCard';
import { calculatePlayerStats, calculatePlayerTimeline } from '../lib/stats';
import dynamic from 'next/dynamic';

const ChartsLoaded = dynamic(() => import('../lib/charts'), { ssr: false });

function PlayerDashboardPage({ user, profile }) {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    setChartsReady(true);
  }, []);

  useEffect(() => {
    async function fetchPlayers() {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase
        .from('players')
        .select('id, name, position, dorsal, team_id')
        .order('name');
      if (data) setPlayers(data);
      setLoading(false);
    }
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (!selectedPlayer) return;
    async function fetchPlayerData() {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data: events } = await supabase
        .from('match_events')
        .select('id, event_type, minute, metadata, match_id, created_at')
        .eq('player_id', selectedPlayer.id)
        .order('created_at', { ascending: true });

      const playerStats = calculatePlayerStats(events);
      setStats(playerStats);
      setTimeline(calculatePlayerTimeline(events));

      const matchIds = [...new Set(events?.map((e) => e.match_id).filter(Boolean))];
      if (matchIds.length > 0) {
        const { data: matches } = await supabase
          .from('matches')
          .select('id, opponent, date, result')
          .in('id', matchIds)
          .order('date', { ascending: false });
        if (matches) setRecentMatches(matches);
      }
    }
    fetchPlayerData();
  }, [selectedPlayer]);

  return (
    <Layout profile={profile}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Dashboard de Jugador</h1>

      <div style={{ marginBottom: 24 }}>
        <select
          value={selectedPlayer?.id || ''}
          onChange={(e) => {
            const p = players.find((pl) => pl.id === e.target.value);
            setSelectedPlayer(p || null);
          }}
          style={{
            padding: 12,
            borderRadius: 8,
            border: '1px solid #ddd',
            fontSize: 14,
            minWidth: 300,
            maxWidth: '100%',
          }}
        >
          <option value="">Seleccionar jugador...</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.dorsal ? ' #' + p.dorsal : ''} — {p.position || 'Sin posición'}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Cargando...</p>}

      {!loading && !selectedPlayer && (
        <div
          style={{
            background: '#fff',
            padding: 48,
            borderRadius: 12,
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <p style={{ color: '#666' }}>Selecciona un jugador para ver sus estadísticas.</p>
        </div>
      )}

      {selectedPlayer && stats && (
        <>
          <div
            style={{
              marginBottom: 24,
              padding: 20,
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ fontSize: 20 }}>{selectedPlayer.name}</h2>
            <p style={{ color: '#666', fontSize: 14 }}>
              {selectedPlayer.position || 'Sin posición'}
              {selectedPlayer.dorsal ? ` — #${selectedPlayer.dorsal}` : ''}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <StatCard label="Goles" value={stats.goals} color="#2d6a4f" />
            <StatCard label="Asistencias" value={stats.assists} color="#40916c" />
            <StatCard label="Tiros" value={stats.shots} color="#52796f" />
            <StatCard label="Pases clave" value={stats.keyPasses} color="#354f52" />
            <StatCard label="Recuperaciones" value={stats.recoveries} color="#264653" />
            <StatCard label="Faltas" value={stats.fouls} color="#e76f51" />
            <StatCard label="T. Amarillas" value={stats.yellowCards} color="#e9c46a" />
            <StatCard label="T. Rojas" value={stats.redCards} color="#c1121f" />
          </div>

          {chartsReady && timeline.length > 0 && (
            <div
              style={{
                background: '#fff',
                padding: 24,
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: 24,
              }}
            >
              <h3 style={{ marginBottom: 16 }}>Evolución por minuto</h3>
              <ChartsLoaded>
                {(C) => (
                  <C.ResponsiveContainer width="100%" height={250}>
                    <C.BarChart data={timeline}>
                      <C.CartesianGrid strokeDasharray="3 3" />
                      <C.XAxis dataKey="minute" />
                      <C.YAxis allowDecimals={false} />
                      <C.Tooltip />
                      <C.Bar dataKey="goals" fill="#2d6a4f" name="Goles" />
                      <C.Bar dataKey="assists" fill="#40916c" name="Asistencias" />
                    </C.BarChart>
                  </C.ResponsiveContainer>
                )}
              </ChartsLoaded>
            </div>
          )}

          {recentMatches.length > 0 && (
            <div
              style={{
                background: '#fff',
                padding: 24,
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ marginBottom: 16 }}>Partidos con actividad</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                {recentMatches.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#f8f9fa',
                      borderRadius: 8,
                    }}
                  >
                    <span>{m.opponent}</span>
                    <span style={{ color: '#666', fontSize: 13 }}>{m.result || '—'}</span>
                    <span style={{ color: '#999', fontSize: 13 }}>
                      {m.date ? new Date(m.date).toLocaleDateString('es-ES') : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

export default withAuth(PlayerDashboardPage);
