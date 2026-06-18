import { useEffect, useState } from 'react';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { SkeletonList } from '../components/Skeleton';
import { calculatePlayerStats } from '../lib/stats';

function RankingPage({ user: _user, profile }) {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [statType, setStatType] = useState('goals');
  const [loading, setLoading] = useState(true);

  const statOptions = [
    { value: 'goals', label: 'Goles' },
    { value: 'assists', label: 'Asistencias' },
    { value: 'shots', label: 'Tiros' },
    { value: 'keyPasses', label: 'Pases clave' },
    { value: 'recoveries', label: 'Recuperaciones' },
    { value: 'fouls', label: 'Faltas' },
    { value: 'yellowCards', label: 'T. Amarillas' },
    { value: 'totalEvents', label: 'Eventos totales' },
  ];

  useEffect(() => {
    async function fetchTeams() {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase.from('teams').select('id, name').order('name');
      if (data) setTeams(data);
    }
    fetchTeams();
  }, []);

  useEffect(() => {
    async function fetchRanking() {
      setLoading(true);
      const supabase = getSupabase();
      if (!supabase) return;

      let query = supabase
        .from('players')
        .select('id, name, position, dorsal, team_id, teams(name)');
      if (selectedTeam) query = query.eq('team_id', selectedTeam);
      const { data: playersData } = await query.order('name');

      if (!playersData || playersData.length === 0) {
        setPlayers([]);
        setLoading(false);
        return;
      }

      const playerIds = playersData.map((p) => p.id);
      const { data: events } = await supabase
        .from('match_events')
        .select('player_id, event_type, minute')
        .in('player_id', playerIds);

      const enriched = playersData.map((p) => {
        const pEvents = (events || []).filter((e) => e.player_id === p.id);
        const stats = calculatePlayerStats(pEvents);
        return { ...p, stats, teamName: p.teams?.name || 'Sin equipo' };
      });

      enriched.sort((a, b) => (b.stats[statType] || 0) - (a.stats[statType] || 0));
      setPlayers(enriched);
      setLoading(false);
    }
    fetchRanking();
  }, [selectedTeam, statType]);

  const currentStatLabel = statOptions.find((s) => s.value === statType)?.label || statType;

  return (
    <Layout profile={profile}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Ranking Global</h1>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            border: '1px solid #ddd',
            fontSize: 14,
            minWidth: 200,
          }}
        >
          <option value="">Todos los equipos</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          value={statType}
          onChange={(e) => setStatType(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            border: '1px solid #ddd',
            fontSize: 14,
            minWidth: 180,
          }}
        >
          {statOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonList count={5} />
      ) : players.length === 0 ? (
        <div
          style={{
            background: '#fff',
            padding: 48,
            borderRadius: 12,
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <p style={{ color: '#666' }}>No hay jugadores para mostrar.</p>
        </div>
      ) : (
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderBottom: '2px solid #eee',
                    width: 50,
                  }}
                >
                  #
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderBottom: '2px solid #eee',
                  }}
                >
                  Jugador
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderBottom: '2px solid #eee',
                  }}
                >
                  Equipo
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderBottom: '2px solid #eee',
                  }}
                >
                  Posición
                </th>
                <th
                  style={{
                    textAlign: 'center',
                    padding: '12px 16px',
                    borderBottom: '2px solid #eee',
                  }}
                >
                  {currentStatLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={p.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      fontWeight: 700,
                      color: i < 3 ? '#1a1a2e' : '#999',
                    }}
                  >
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      fontWeight: 500,
                    }}
                  >
                    {p.name} {p.dorsal ? `#${p.dorsal}` : ''}
                  </td>
                  <td
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      color: '#666',
                    }}
                  >
                    {p.teamName}
                  </td>
                  <td
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      color: '#666',
                    }}
                  >
                    {p.position || '—'}
                  </td>
                  <td
                    style={{
                      textAlign: 'center',
                      padding: '10px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      fontWeight: 700,
                      fontSize: 16,
                      color: '#1a1a2e',
                    }}
                  >
                    {p.stats[statType] || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

export default withAuth(RankingPage);
