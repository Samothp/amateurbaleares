import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { SkeletonDashboard } from '../components/Skeleton';
import { calculatePlayerStats } from '../lib/stats';

const DynamicRadarChart = dynamic(() => import('../lib/charts').then((m) => m.DynamicRadarChart), {
  ssr: false,
});
const DynamicPolarGrid = dynamic(() => import('../lib/charts').then((m) => m.PolarGrid), {
  ssr: false,
});
const DynamicPolarAngleAxis = dynamic(() => import('../lib/charts').then((m) => m.PolarAngleAxis), {
  ssr: false,
});
const DynamicPolarRadiusAxis = dynamic(
  () => import('../lib/charts').then((m) => m.PolarRadiusAxis),
  { ssr: false }
);
const DynamicRadar = dynamic(() => import('../lib/charts').then((m) => m.DynamicRadar), {
  ssr: false,
});
const DynamicResponsiveContainer = dynamic(
  () => import('../lib/charts').then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const DynamicBarChart = dynamic(() => import('../lib/charts').then((m) => m.DynamicBarChart), {
  ssr: false,
});
const DynamicBar = dynamic(() => import('../lib/charts').then((m) => m.DynamicBar), { ssr: false });
const DynamicXAxis = dynamic(() => import('../lib/charts').then((m) => m.XAxis), { ssr: false });
const DynamicYAxis = dynamic(() => import('../lib/charts').then((m) => m.YAxis), { ssr: false });
const DynamicCartesianGrid = dynamic(() => import('../lib/charts').then((m) => m.CartesianGrid), {
  ssr: false,
});
const DynamicTooltip = dynamic(() => import('../lib/charts').then((m) => m.Tooltip), {
  ssr: false,
});
const DynamicLegend = dynamic(() => import('../lib/charts').then((m) => m.Legend), { ssr: false });

function ComparativaPage({ user: _user, profile }) {
  const [players, setPlayers] = useState([]);
  const [player1Id, setPlayer1Id] = useState('');
  const [player2Id, setPlayer2Id] = useState('');
  const [player1Data, setPlayer1Data] = useState(null);
  const [player2Data, setPlayer2Data] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase
        .from('players')
        .select('id, name, position, age, dorsal, team_id, teams(name)')
        .order('name');
      if (data) setPlayers(data);
      setLoading(false);
    }
    fetchPlayers();
  }, []);

  useEffect(() => {
    async function fetchPlayerStats(playerId, setPlayer) {
      if (!playerId) {
        setPlayer(null);
        return;
      }
      const supabase = getSupabase();
      if (!supabase) return;
      const player = players.find((p) => p.id === playerId);
      const { data: events } = await supabase
        .from('match_events')
        .select('event_type, minute')
        .eq('player_id', playerId);
      const stats = calculatePlayerStats(events || []);
      setPlayer({ ...player, stats });
    }
    fetchPlayerStats(player1Id, setPlayer1Data);
    fetchPlayerStats(player2Id, setPlayer2Data);
  }, [player1Id, player2Id, players]);

  const statLabels = {
    goals: 'Goles',
    assists: 'Asistencias',
    shots: 'Tiros',
    keyPasses: 'Pases clave',
    recoveries: 'Recuperaciones',
    losses: 'Pérdidas',
    fouls: 'Faltas',
    yellowCards: 'T. Amarillas',
    redCards: 'T. Rojas',
  };

  const radarData =
    player1Data && player2Data
      ? Object.entries(statLabels).map(([key, label]) => ({
          stat: label,
          [player1Data.name]: player1Data.stats[key] || 0,
          [player2Data.name]: player2Data.stats[key] || 0,
        }))
      : [];

  const barData = radarData.slice(0, 6);

  return (
    <Layout profile={profile}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Comparativa de Jugadores</h1>

      {loading ? (
        <SkeletonDashboard />
      ) : (
        <>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}
          >
            <div>
              <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 6 }}>
                Jugador 1
              </label>
              <select
                value={player1Id}
                onChange={(e) => setPlayer1Id(e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  fontSize: 14,
                }}
              >
                <option value="">Seleccionar jugador...</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.dorsal ? `#${p.dorsal}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 6 }}>
                Jugador 2
              </label>
              <select
                value={player2Id}
                onChange={(e) => setPlayer2Id(e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  fontSize: 14,
                }}
              >
                <option value="">Seleccionar jugador...</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.dorsal ? `#${p.dorsal}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {player1Data && player2Data && (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                <PlayerCard player={player1Data} />
                <PlayerCard player={player2Data} />
              </div>

              {radarData.length > 0 && (
                <div
                  style={{
                    background: '#fff',
                    padding: 24,
                    borderRadius: 12,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    marginBottom: 24,
                  }}
                >
                  <h3 style={{ marginBottom: 16 }}>Radar Comparativo</h3>
                  <DynamicResponsiveContainer width="100%" height={300}>
                    <DynamicRadarChart data={radarData}>
                      <DynamicPolarGrid />
                      <DynamicPolarAngleAxis dataKey="stat" />
                      <DynamicPolarRadiusAxis />
                      <DynamicRadar
                        name={player1Data.name}
                        dataKey={player1Data.name}
                        stroke="#2d6a4f"
                        fill="#2d6a4f"
                        fillOpacity={0.3}
                      />
                      <DynamicRadar
                        name={player2Data.name}
                        dataKey={player2Data.name}
                        stroke="#e76f51"
                        fill="#e76f51"
                        fillOpacity={0.3}
                      />
                      <DynamicLegend />
                      <DynamicTooltip />
                    </DynamicRadarChart>
                  </DynamicResponsiveContainer>
                </div>
              )}

              {barData.length > 0 && (
                <div
                  style={{
                    background: '#fff',
                    padding: 24,
                    borderRadius: 12,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    marginBottom: 24,
                  }}
                >
                  <h3 style={{ marginBottom: 16 }}>Comparativa de Métricas</h3>
                  <DynamicResponsiveContainer width="100%" height={300}>
                    <DynamicBarChart data={barData}>
                      <DynamicCartesianGrid strokeDasharray="3 3" />
                      <DynamicXAxis dataKey="stat" />
                      <DynamicYAxis allowDecimals={false} />
                      <DynamicTooltip />
                      <DynamicLegend />
                      <DynamicBar dataKey={player1Data.name} fill="#2d6a4f" />
                      <DynamicBar dataKey={player2Data.name} fill="#e76f51" />
                    </DynamicBarChart>
                  </DynamicResponsiveContainer>
                </div>
              )}

              <div
                style={{
                  background: '#fff',
                  padding: 24,
                  borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <h3 style={{ marginBottom: 16 }}>Tabla Comparativa</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderBottom: '2px solid #eee',
                        }}
                      >
                        Métrica
                      </th>
                      <th
                        style={{
                          textAlign: 'center',
                          padding: '8px 12px',
                          borderBottom: '2px solid #eee',
                          color: '#2d6a4f',
                        }}
                      >
                        {player1Data.name}
                      </th>
                      <th
                        style={{
                          textAlign: 'center',
                          padding: '8px 12px',
                          borderBottom: '2px solid #eee',
                          color: '#e76f51',
                        }}
                      >
                        {player2Data.name}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(statLabels).map(([key, label]) => {
                      const v1 = player1Data.stats[key] || 0;
                      const v2 = player2Data.stats[key] || 0;
                      return (
                        <tr key={key}>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
                            {label}
                          </td>
                          <td
                            style={{
                              textAlign: 'center',
                              padding: '8px 12px',
                              borderBottom: '1px solid #f0f0f0',
                              fontWeight: v1 > v2 ? 700 : 400,
                              background: v1 > v2 ? '#f0fff4' : 'transparent',
                            }}
                          >
                            {v1}
                          </td>
                          <td
                            style={{
                              textAlign: 'center',
                              padding: '8px 12px',
                              borderBottom: '1px solid #f0f0f0',
                              fontWeight: v2 > v1 ? 700 : 400,
                              background: v2 > v1 ? '#fff5f5' : 'transparent',
                            }}
                          >
                            {v2}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!player1Id && !player2Id && (
            <div
              style={{
                background: '#fff',
                padding: 48,
                borderRadius: 12,
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <p style={{ color: '#666' }}>Selecciona dos jugadores para compararlos.</p>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

function PlayerCard({ player }) {
  return (
    <div
      style={{
        background: '#fff',
        padding: 20,
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <h3 style={{ fontSize: 18, marginBottom: 4 }}>{player.name}</h3>
      <p style={{ color: '#666', fontSize: 14 }}>
        {player.position || 'Sin posición'}
        {player.dorsal ? ` — #${player.dorsal}` : ''}
      </p>
      <p style={{ color: '#999', fontSize: 13, marginTop: 4 }}>Edad: {player.age || '—'}</p>
      <p style={{ color: '#999', fontSize: 13 }}>Eventos: {player.stats?.totalEvents || 0}</p>
    </div>
  );
}

export default withAuth(ComparativaPage);
