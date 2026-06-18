import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { calculateTeamStats } from '../lib/stats';
import { SkeletonDashboard } from '../components/Skeleton';
import {
  DynamicBarChart as BarChart,
  DynamicBar as Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  DynamicPieChart as PieChart,
  DynamicPie as Pie,
  Cell,
  Legend,
} from '../lib/charts';

const COLORS = [
  '#2d6a4f',
  '#40916c',
  '#52796f',
  '#354f52',
  '#264653',
  '#e76f51',
  '#e9c46a',
  '#f4a261',
  '#2a9d8f',
  '#264653',
  '#c1121f',
];

function TeamDashboardPage({ user: _user, profile }) {
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamStats, setTeamStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeams() {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase.from('teams').select('id, name, category').order('name');
      if (data) {
        setTeams(data);
        // If teamId is in URL, auto-select that team
        if (router.query.teamId) {
          const team = data.find((t) => t.id === router.query.teamId);
          if (team) setSelectedTeam(team);
        }
      }
      setLoading(false);
    }
    fetchTeams();
  }, [router.query.teamId]);

  useEffect(() => {
    if (!selectedTeam) return;
    async function fetchTeamData() {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data: players } = await supabase
        .from('players')
        .select('id, name')
        .eq('team_id', selectedTeam.id);

      const [homeRes, awayRes] = await Promise.all([
        supabase
          .from('matches')
          .select('id, opponent, date, result, team_id, opponent_team_id')
          .eq('team_id', selectedTeam.id),
        supabase
          .from('matches')
          .select('id, opponent, date, result, team_id, opponent_team_id')
          .eq('opponent_team_id', selectedTeam.id),
      ]);

       const allMatchesMap = new Map();
       [...(homeRes.data || []), ...(awayRes.data || [])].forEach((m) => allMatchesMap.set(m.id, m));
       const teamMatches = [...allMatchesMap.values()].map((m) => ({
         ...m,
         isHome: m.team_id === selectedTeam.id,
       })).sort(
         (a, b) => new Date(b.date) - new Date(a.date),
       );

       if (teamMatches) setMatches(teamMatches);

      const matchIds = teamMatches?.map((m) => m.id) || [];
      if (matchIds.length === 0) {
        setTeamStats(calculateTeamStats([], [], selectedTeam.id));
        return;
      }

      const { data: events } = await supabase
        .from('match_events')
        .select('id, event_type, minute, player_id, match_id')
        .in('match_id', matchIds);

      setTeamStats(calculateTeamStats(events || [], players || [], selectedTeam.id, teamMatches));
    }
    fetchTeamData();
  }, [selectedTeam]);

  const StatCard = ({ label, value, color }) => (
    <div
      style={{
        background: '#fff',
        padding: 16,
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: 28, fontWeight: 700, color: color || '#1a1a2e' }}>{value}</p>
      <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{label}</p>
    </div>
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: '#fff',
            padding: '8px 12px',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <p style={{ fontWeight: 600 }}>{payload[0].name}</p>
          <p style={{ color: '#666' }}>{payload[0].value} eventos</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Layout profile={profile}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Dashboard de Equipo</h1>

      <div style={{ marginBottom: 24 }}>
        <select
          value={selectedTeam?.id || ''}
          onChange={(e) => {
            const t = teams.find((tm) => tm.id === e.target.value);
            setSelectedTeam(t || null);
          }}
          style={{
            padding: 12,
            borderRadius: 8,
            border: '1px solid #ddd',
            fontSize: 14,
            minWidth: 300,
          }}
        >
          <option value="">Seleccionar equipo...</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
              {t.category ? ' (' + t.category + ')' : ''}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <>
          <SkeletonDashboard />
        </>
      )}

      {!loading && !selectedTeam && (
        <div
          style={{
            background: '#fff',
            padding: 48,
            borderRadius: 12,
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <p style={{ color: '#666' }}>Selecciona un equipo para ver sus estadísticas.</p>
        </div>
      )}

      {selectedTeam && teamStats && (
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
            <h2 style={{ fontSize: 20 }}>{selectedTeam.name}</h2>
            <p style={{ color: '#666', fontSize: 14 }}>
              {selectedTeam.category || 'Sin categoría'} — {matches.length} partidos
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <StatCard label="Partidos" value={teamStats.played} color="#264653" />
            <StatCard label="Ganados" value={teamStats.won} color="#2d6a4f" />
            <StatCard label="Empatados" value={teamStats.drawn} color="#e9c46a" />
            <StatCard label="Perdidos" value={teamStats.lost} color="#c1121f" />
            <StatCard label="Goles FAVOR" value={teamStats.goalsFor} color="#40916c" />
            <StatCard label="Goles CONTRA" value={teamStats.goalsAgainst} color="#e76f51" />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              marginBottom: 24,
            }}
          >
            {teamStats.played > 0 && (
              <div
                style={{
                  background: '#fff',
                  padding: 24,
                  borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <h3 style={{ marginBottom: 16 }}>Distribución de resultados</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Ganados', value: teamStats.won },
                        { name: 'Empatados', value: teamStats.drawn },
                        { name: 'Perdidos', value: teamStats.lost },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      <Cell fill="#2d6a4f" />
                      <Cell fill="#e9c46a" />
                      <Cell fill="#c1121f" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {teamStats.played > 0 && (
              <div
                style={{
                  background: '#fff',
                  padding: 24,
                  borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <h3 style={{ marginBottom: 16 }}>Balance de goles</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={[
                      { name: 'Favor', value: teamStats.goalsFor, fill: '#40916c' },
                      { name: 'Contra', value: teamStats.goalsAgainst, fill: '#e76f51' },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2d6a4f">
                      {[
                        { name: 'Favor', value: teamStats.goalsFor, fill: '#40916c' },
                        { name: 'Contra', value: teamStats.goalsAgainst, fill: '#e76f51' },
                      ].map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}
          >
            {teamStats.eventsByType.length > 0 && (
              <div
                style={{
                  background: '#fff',
                  padding: 24,
                  borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <h3 style={{ marginBottom: 16 }}>Eventos por tipo</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={teamStats.eventsByType}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {teamStats.eventsByType.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {teamStats.eventsByMinute.length > 0 && (
              <div
                style={{
                  background: '#fff',
                  padding: 24,
                  borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <h3 style={{ marginBottom: 16 }}>Actividad por tramos</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={teamStats.eventsByMinute}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2d6a4f" name="Eventos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}
          >
            {teamStats.topScorers.length > 0 && (
              <div
                style={{
                  background: '#fff',
                  padding: 24,
                  borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <h3 style={{ marginBottom: 16 }}>Goleadores</h3>
                {teamStats.topScorers.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <span>{s.name}</span>
                    <span style={{ fontWeight: 700, color: '#2d6a4f' }}>{s.count} ⚽</span>
                  </div>
                ))}
              </div>
            )}

            {teamStats.topAssists.length > 0 && (
              <div
                style={{
                  background: '#fff',
                  padding: 24,
                  borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <h3 style={{ marginBottom: 16 }}>Asistentes</h3>
                {teamStats.topAssists.map((a, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <span>{a.name}</span>
                    <span style={{ fontWeight: 700, color: '#40916c' }}>{a.count} 🅰️</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {matches.length > 0 && (
            <div
              style={{
                background: '#fff',
                padding: 24,
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ marginBottom: 16 }}>Historial de partidos</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                {matches.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 14px',
                      background: '#f8f9fa',
                      borderRadius: 8,
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 13, color: '#666' }}>
                        {m.isHome ? selectedTeam.name : m.opponent}
                      </span>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: '60px' }}>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>{m.result || '—'}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                      <span style={{ fontSize: 13, color: '#666' }}>
                        {m.isHome ? m.opponent : selectedTeam.name}
                      </span>
                    </div>
                    <span style={{ color: '#999', fontSize: 12, whiteSpace: 'nowrap' }}>
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

export default withAuth(TeamDashboardPage, ['Entrenador', 'Club', 'Admin']);
