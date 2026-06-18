import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';

function DashboardPage({ user, profile }) {
  const router = useRouter();
  const [stats, setStats] = useState({ teams: 0, players: 0, matches: 0 });
  const [teams, setTeams] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [teamStats, setTeamStats] = useState({});

  useEffect(() => {
    async function fetchDashboard() {
      const supabase = getSupabase();
      if (!supabase) return;

      const [teamsRes, playersRes, matchesRes, allTeamsRes] = await Promise.all([
        supabase.from('teams').select('id', { count: 'exact', head: true }),
        supabase.from('players').select('id', { count: 'exact', head: true }),
        supabase.from('matches').select('id', { count: 'exact', head: true }),
        supabase.from('teams').select('id, name, category'),
      ]);

      setStats({
        teams: teamsRes.count || 0,
        players: playersRes.count || 0,
        matches: matchesRes.count || 0,
      });

      if (allTeamsRes.data) setTeams(allTeamsRes.data);

      const now = new Date().toISOString();

      const [recentRes, upcomingRes] = await Promise.all([
        supabase
          .from('matches')
          .select('id, team_id, opponent, date, result')
          .not('result', 'is', null)
          .order('date', { ascending: false })
          .limit(3),
        supabase
          .from('matches')
          .select('id, team_id, opponent, date, result')
          .is('result', null)
          .gte('date', now)
          .order('date', { ascending: true })
          .limit(3),
      ]);

      if (recentRes.data) setRecentMatches(recentRes.data);
      if (upcomingRes.data) setUpcomingMatches(upcomingRes.data);

      if (allTeamsRes.data && allTeamsRes.data.length > 0) {
        const teamIds = allTeamsRes.data.map((t) => t.id);
        const matchesForTeams = await supabase
          .from('matches')
          .select('team_id, result')
          .in('team_id', teamIds)
          .not('result', 'is', null);

        const playersForTeams = await supabase
          .from('players')
          .select('team_id')
          .in('team_id', teamIds);

        const statsMap = {};
        allTeamsRes.data.forEach((t) => {
          statsMap[t.id] = { name: t.name, category: t.category, players: 0, won: 0, drawn: 0, lost: 0 };
        });

        if (playersForTeams.data) {
          playersForTeams.data.forEach((p) => {
            if (statsMap[p.team_id]) statsMap[p.team_id].players++;
          });
        }

        if (matchesForTeams.data) {
          matchesForTeams.data.forEach((m) => {
            if (!statsMap[m.team_id] || !m.result) return;
            const parts = m.result.split('-').map((s) => parseInt(s.trim(), 10));
            if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return;
            const team = matchesForTeams.data.find(
              (x) => x.team_id === m.team_id && x.result === m.result
            );
            const isHome = team && matchesForTeams.data.indexOf(m) >= 0;
            const gf = parts[0];
            const gc = parts[1];
            if (gf > gc) statsMap[m.team_id].won++;
            else if (gf === gc) statsMap[m.team_id].drawn++;
            else statsMap[m.team_id].lost++;
          });
        }

        setTeamStats(statsMap);
      }
    }
    fetchDashboard();
  }, []);

  const isNewUser = stats.teams === 0 && stats.players === 0;
  const hasTeamsNoMatches = stats.teams > 0 && stats.matches === 0;
  const isEntrenadorOrClub = profile?.role === 'Entrenador' || profile?.role === 'Club';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
  };

  const getTeamName = (teamId) => {
    const t = teams.find((t) => t.id === teamId);
    return t?.name || '';
  };

  return (
    <Layout profile={profile}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Dashboard</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Bienvenido, {profile?.name}.</p>

      {isNewUser && isEntrenadorOrClub && (
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            color: '#fff',
            padding: 32,
            borderRadius: 16,
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Empezamos</h2>
          <p style={{ opacity: 0.8, marginBottom: 20, fontSize: 14 }}>
            Configura tu cuenta en 3 pasos sencillos.
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            <OnboardingStep
              number={1}
              title="Crea tu primer equipo"
              description="Añade el nombre, categoría y ciudad de tu equipo."
              action={() => router.push('/equipos')}
              done={stats.teams > 0}
            />
            <OnboardingStep
              number={2}
              title="Añade jugadores"
              description="Registra a los jugadores de tu plantilla."
              action={() => router.push('/jugadores')}
              done={stats.players > 0}
            />
            <OnboardingStep
              number={3}
              title="Registra un partido"
              description="Crea tu primer partido y empieza a registrar eventos."
              action={() => router.push('/partidos')}
              done={stats.matches > 0}
            />
          </div>
        </div>
      )}

      {hasTeamsNoMatches && isEntrenadorOrClub && (
        <div
          style={{
            background: '#fff',
            padding: 24,
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: 24,
            borderLeft: '4px solid #40916c',
          }}
        >
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>Siguiente paso</h3>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>
            Ya tienes equipos creados. Registra un partido para empezar a recoger datos.
          </p>
          <button
            onClick={() => router.push('/partidos')}
            style={{
              padding: '8px 16px',
              background: '#40916c',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Crear partido
          </button>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <QuickStat label="Equipos" value={stats.teams} icon="⚽" color="#1a1a2e" />
        <QuickStat label="Jugadores" value={stats.players} icon="👤" color="#40916c" />
        <QuickStat label="Partidos" value={stats.matches} icon="📋" color="#52796f" />
      </div>

      {teams.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Mis Equipos</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            {teams.slice(0, 6).map((team) => {
              const s = teamStats[team.id] || { players: 0, won: 0, drawn: 0, lost: 0 };
              return (
                <Link
                  key={team.id}
                  href={`/equipos`}
                  style={{
                    background: '#fff',
                    padding: 16,
                    borderRadius: 12,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                  }}
                >
                  <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{team.name}</p>
                  <p style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>{team.category}</p>
                  <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                    <span>{s.players} jug.</span>
                    <span style={{ color: '#2d6a4f' }}>{s.won}G</span>
                    <span style={{ color: '#b5838d' }}>{s.drawn}E</span>
                    <span style={{ color: '#c1121f' }}>{s.lost}P</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: '#fff',
            padding: 20,
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ fontSize: 15, marginBottom: 12, color: '#666' }}>Últimos resultados</h3>
          {recentMatches.length === 0 ? (
            <p style={{ color: '#999', fontSize: 13 }}>Sin resultados aún</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentMatches.map((m) => (
                <Link
                  key={m.id}
                  href={`/partidos/${m.id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#f8f9fa',
                    borderRadius: 8,
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      {getTeamName(m.team_id)} vs {m.opponent}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#999' }}>{formatDate(m.date)}</span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#1a1a2e',
                        background: '#e8eaf6',
                        padding: '2px 8px',
                        borderRadius: 6,
                      }}
                    >
                      {m.result}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            background: '#fff',
            padding: 20,
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ fontSize: 15, marginBottom: 12, color: '#666' }}>Próximos partidos</h3>
          {upcomingMatches.length === 0 ? (
            <p style={{ color: '#999', fontSize: 13 }}>Sin partidos programados</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcomingMatches.map((m) => (
                <Link
                  key={m.id}
                  href={`/partidos/${m.id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#f8f9fa',
                    borderRadius: 8,
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      {getTeamName(m.team_id)} vs {m.opponent}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, color: '#40916c', fontWeight: 500 }}>
                    {formatDate(m.date)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {profile?.role === 'Entrenador' && (
          <>
            <QuickAction
              icon="⚽"
              label="Equipos"
              description="Gestiona tus equipos y plantillas"
              onClick={() => router.push('/equipos')}
              primary
            />
            <QuickAction
              icon="👤"
              label="Jugadores"
              description="Consulta y edita jugadores"
              onClick={() => router.push('/jugadores')}
            />
            <QuickAction
              icon="📊"
              label="Ranking"
              description="Clasificación global de jugadores"
              onClick={() => router.push('/ranking')}
            />
          </>
        )}
        {profile?.role === 'Club' && (
          <>
            <QuickAction
              icon="🏟️"
              label="Mi Club"
              description="Información y gestión del club"
              onClick={() => router.push('/clubs')}
              primary
            />
            <QuickAction
              icon="⚽"
              label="Equipos"
              description="Los equipos del club"
              onClick={() => router.push('/equipos')}
            />
            <QuickAction
              icon="📊"
              label="Ranking"
              description="Clasificación global de jugadores"
              onClick={() => router.push('/ranking')}
            />
          </>
        )}
        {profile?.role === 'Scout' && (
          <>
            <QuickAction
              icon="🔍"
              label="Scouting"
              description="Busca y analiza jugadores"
              onClick={() => router.push('/scouting')}
              primary
            />
            <QuickAction
              icon="📊"
              label="Comparativa"
              description="Compara jugadores lado a lado"
              onClick={() => router.push('/comparativa')}
            />
            <QuickAction
              icon="🏆"
              label="Ranking"
              description="Los mejores jugadores de la liga"
              onClick={() => router.push('/ranking')}
            />
          </>
        )}
        {profile?.role === 'Admin' && (
          <>
            <QuickAction
              icon="⚙️"
              label="Administrar"
              description="Gestiona usuarios y permisos"
              onClick={() => router.push('/admin')}
              primary
            />
            <QuickAction
              icon="🏟️"
              label="Clubs"
              description="Todos los clubs registrados"
              onClick={() => router.push('/clubs')}
            />
            <QuickAction
              icon="📊"
              label="Ranking"
              description="Clasificación global de jugadores"
              onClick={() => router.push('/ranking')}
            />
          </>
        )}
      </div>
    </Layout>
  );
}

function OnboardingStep({ number, title, description, action, done }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 10,
        cursor: done ? 'default' : 'pointer',
        opacity: done ? 0.5 : 1,
      }}
      onClick={done ? undefined : action}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: done ? '#40916c' : 'rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {done ? '✓' : number}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{title}</p>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '2px 0 0' }}>{description}</p>
      </div>
      {!done && <span style={{ fontSize: 18, opacity: 0.5 }}>→</span>}
    </div>
  );
}

function QuickStat({ label, value, icon, color }) {
  return (
    <div
      style={{
        background: '#fff',
        padding: 16,
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <p style={{ fontSize: 28, fontWeight: 700, color, margin: '4px 0 0' }}>{value}</p>
      <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{label}</p>
    </div>
  );
}

function QuickAction({ icon, label, description, onClick, primary }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 20px',
        background: primary ? '#1a1a2e' : '#fff',
        color: primary ? '#fff' : '#333',
        border: 'none',
        borderRadius: 12,
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 500,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        textAlign: 'left',
        flex: '1 1 200px',
        minWidth: 200,
      }}
    >
      <span style={{ fontSize: 24 }}>{icon}</span>
      <div>
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>{description}</p>
      </div>
    </button>
  );
}

export default withAuth(DashboardPage);
