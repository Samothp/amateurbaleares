import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import withAuth from '../../lib/withAuth';
import { getSupabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';
import { SkeletonDashboard } from '../../components/Skeleton';
import {
  calculatePlayerStats,
  analyzeStrengthsWeaknesses,
} from '../../lib/stats';

const DynamicRadarChart = dynamic(() => import('../../lib/charts').then((m) => m.DynamicRadarChart), { ssr: false });
const DynamicPolarGrid = dynamic(() => import('../../lib/charts').then((m) => m.PolarGrid), { ssr: false });
const DynamicPolarAngleAxis = dynamic(() => import('../../lib/charts').then((m) => m.PolarAngleAxis), { ssr: false });
const DynamicPolarRadiusAxis = dynamic(() => import('../../lib/charts').then((m) => m.PolarRadiusAxis), { ssr: false });
const DynamicRadar = dynamic(() => import('../../lib/charts').then((m) => m.DynamicRadar), { ssr: false });
const DynamicResponsiveContainer = dynamic(() => import('../../lib/charts').then((m) => m.ResponsiveContainer), { ssr: false });

function PlayerProfilePage({ user: _user, profile }) {
  const router = useRouter();
  const { id } = router.query;
  const [player, setPlayer] = useState(null);
  const [team, setTeam] = useState(null);
  const [events, setEvents] = useState([]);
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data: playerData } = await supabase
        .from('players')
        .select('id, name, age, position, dorsal, height, weight, dominant_foot, photo, team_id, created_at')
        .eq('id', id)
        .single();
      if (!playerData) {
        setLoading(false);
        return;
      }
      setPlayer(playerData);

      if (playerData.team_id) {
        const { data: teamData } = await supabase
          .from('teams')
          .select('id, name, category')
          .eq('id', playerData.team_id)
          .single();
        setTeam(teamData);
      }

      const { data: eventsData } = await supabase
        .from('match_events')
        .select('id, event_type, minute, metadata, match_id, created_at')
        .eq('player_id', id)
        .order('created_at', { ascending: true });
      setEvents(eventsData || []);

      const matchIds = [...new Set((eventsData || []).map((e) => e.match_id).filter(Boolean))];
      if (matchIds.length > 0) {
        const { data: matchesData } = await supabase
          .from('matches')
          .select('id, opponent, date, result')
          .in('id', matchIds)
          .order('date', { ascending: false });
        setMatches(matchesData || []);
      }

      setLoading(false);
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    if (events.length === 0) return;
    setStats(calculatePlayerStats(events));
    setAnalysis(analyzeStrengthsWeaknesses(events));
  }, [events]);

  const radarData = stats
    ? [
        { stat: 'Goles', A: stats.goals, fullMark: Math.max(stats.goals, 5) },
        { stat: 'Asist.', A: stats.assists, fullMark: Math.max(stats.assists, 5) },
        { stat: 'Tiros', A: stats.shots, fullMark: Math.max(stats.shots, 5) },
        { stat: 'Pases Cl.', A: stats.keyPasses, fullMark: Math.max(stats.keyPasses, 5) },
        { stat: 'Recup.', A: stats.recoveries, fullMark: Math.max(stats.recoveries, 5) },
        { stat: 'Despejes', A: stats.clearances, fullMark: Math.max(stats.clearances, 5) },
      ]
    : [];

  if (loading)
    return (
      <Layout profile={profile}>
        <SkeletonDashboard />
      </Layout>
    );
  if (!player)
    return (
      <Layout profile={profile}>
        <p>Jugador no encontrado.</p>
      </Layout>
    );

  return (
    <Layout profile={profile}>
      <div style={{ marginBottom: 16 }}>
        <Link href="/scouting" style={{ color: '#666', fontSize: 14, textDecoration: 'none' }}>
          ← Volver a scouting
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 24 }}>
        <div
          style={{
            background: '#fff',
            padding: 24,
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            {player.photo ? (
              <Image
                src={player.photo}
                alt={player.name}
                width={80}
                height={80}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  color: '#ccc',
                }}
              >
                👤
              </div>
            )}
            <div>
              <h1 style={{ fontSize: 24, margin: 0 }}>{player.name}</h1>
              <p style={{ color: '#666', margin: 0 }}>
                {player.position || 'Sin posición'}
                {player.dorsal ? ` — #${player.dorsal}` : ''}
              </p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <InfoRow label="Edad" value={player.age ? `${player.age} años` : '—'} />
            <InfoRow label="Altura" value={player.height ? `${player.height} cm` : '—'} />
            <InfoRow label="Peso" value={player.weight ? `${player.weight} kg` : '—'} />
            <InfoRow label="Pierna" value={player.dominant_foot || '—'} />
            <InfoRow
              label="Equipo"
              value={
                team
                  ? `${team.name}${team.category ? ' (' + team.category + ')' : ''}`
                  : 'Sin equipo'
              }
            />
            <InfoRow label="Partidos" value={matches.length} />
            <InfoRow label="Eventos totales" value={stats?.totalEvents || 0} />
          </div>
        </div>

        <div>
          {analysis && (
            <div
              style={{
                background: '#fff',
                padding: 24,
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: 24,
              }}
            >
              <h2 style={{ fontSize: 18, marginBottom: 12 }}>Análisis Scouting</h2>
              <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                {analysis.summary}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: 14, color: '#2d6a4f', marginBottom: 8 }}>Fortalezas</h3>
                  {analysis.strengths.length === 0 ? (
                    <p style={{ fontSize: 13, color: '#999' }}>Sin datos suficientes</p>
                  ) : (
                    analysis.strengths.map((s, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          background: '#f0fff4',
                          borderRadius: 6,
                          marginBottom: 4,
                          fontSize: 13,
                        }}
                      >
                        <span>{s.label}</span>
                        <span style={{ fontWeight: 600, color: '#2d6a4f' }}>{s.value}</span>
                      </div>
                    ))
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: 14, color: '#e76f51', marginBottom: 8 }}>
                    Áreas de mejora
                  </h3>
                  {analysis.weaknesses.length === 0 ? (
                    <p style={{ fontSize: 13, color: '#999' }}>Sin debilidades detectadas</p>
                  ) : (
                    analysis.weaknesses.map((w, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          background: '#fff5f5',
                          borderRadius: 6,
                          marginBottom: 4,
                          fontSize: 13,
                        }}
                      >
                        <span>{w.label}</span>
                        <span style={{ fontWeight: 600, color: '#e76f51' }}>{w.value}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {radarData.length > 0 && (
            <div
              style={{
                background: '#fff',
                padding: 24,
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ fontSize: 16, marginBottom: 16 }}>Rendimiento</h3>
              <DynamicResponsiveContainer width="100%" height={280}>
                <DynamicRadarChart data={radarData}>
                  <DynamicPolarGrid />
                  <DynamicPolarAngleAxis dataKey="stat" />
                  <DynamicPolarRadiusAxis />
                  <DynamicRadar
                    name="Jugador"
                    dataKey="A"
                    stroke="#2d6a4f"
                    fill="#2d6a4f"
                    fillOpacity={0.3}
                  />
                </DynamicRadarChart>
              </DynamicResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <MiniStat label="Goles" value={stats.goals} color="#2d6a4f" />
          <MiniStat label="Asistencias" value={stats.assists} color="#40916c" />
          <MiniStat label="Tiros" value={stats.shots} color="#52796f" />
          <MiniStat label="Pases clave" value={stats.keyPasses} color="#354f52" />
          <MiniStat label="Recuperaciones" value={stats.recoveries} color="#264653" />
          <MiniStat label="Pérdidas" value={stats.losses} color="#e76f51" />
          <MiniStat label="Faltas" value={stats.fouls} color="#e76f51" />
          <MiniStat label="T. Amarillas" value={stats.yellowCards} color="#e9c46a" />
          <MiniStat label="T. Rojas" value={stats.redCards} color="#c1121f" />
        </div>
      )}

      {matches.length > 0 && (
        <div
          style={{
            background: '#fff',
            padding: 24,
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Historial de partidos</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {matches.map((m) => (
              <Link
                key={m.id}
                href={`/partidos/${m.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f8f9fa',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <span>vs {m.opponent}</span>
                <span style={{ fontWeight: 600 }}>{m.result || '—'}</span>
                <span style={{ color: '#999', fontSize: 13 }}>
                  {m.date ? new Date(m.date).toLocaleDateString('es-ES') : ''}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '6px 0',
        borderBottom: '1px solid #f8f8f8',
        fontSize: 14,
      }}
    >
      <span style={{ color: '#666' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div
      style={{
        background: '#fff',
        padding: 12,
        borderRadius: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: 22, fontWeight: 700, color, margin: 0 }}>{value}</p>
      <p style={{ fontSize: 12, color: '#666', margin: '4px 0 0' }}>{label}</p>
    </div>
  );
}

export default withAuth(PlayerProfilePage);
