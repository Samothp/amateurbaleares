import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';

function DashboardPage({ user, profile }) {
  const router = useRouter();
  const [stats, setStats] = useState({ teams: 0, players: 0, matches: 0 });

  useEffect(() => {
    async function fetchStats() {
      const supabase = getSupabase();
      if (!supabase) return;

      const [teamsRes, playersRes, matchesRes] = await Promise.all([
        supabase.from('teams').select('id', { count: 'exact', head: true }),
        supabase.from('players').select('id', { count: 'exact', head: true }),
        supabase.from('matches').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        teams: teamsRes.count || 0,
        players: playersRes.count || 0,
        matches: matchesRes.count || 0,
      });
    }
    fetchStats();
  }, []);

  const isNewUser = stats.teams === 0 && stats.players === 0;
  const hasTeamsNoMatches = stats.teams > 0 && stats.matches === 0;
  const isEntrenadorOrClub = profile?.role === 'Entrenador' || profile?.role === 'Club';

  return (
    <Layout profile={profile}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Dashboard</h1>
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
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Empezemos</h2>
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
        <QuickStat label="Equipos" value={stats.teams} color="#1a1a2e" />
        <QuickStat label="Jugadores" value={stats.players} color="#40916c" />
        <QuickStat label="Partidos" value={stats.matches} color="#52796f" />
      </div>

      <div
        style={{
          background: '#fff',
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: 16,
        }}
      >
        <p style={{ marginBottom: 8 }}>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Rol:</strong> {profile?.role}
        </p>
      </div>

      {profile?.role === 'Entrenador' && (
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          <QuickButton label="Gestionar Equipos" onClick={() => router.push('/equipos')} primary />
          <QuickButton label="Ver Jugadores" onClick={() => router.push('/jugadores')} />
          <QuickButton label="Ranking" onClick={() => router.push('/ranking')} />
        </div>
      )}

      {profile?.role === 'Club' && (
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          <QuickButton label="Mi Club" onClick={() => router.push('/clubs')} primary />
          <QuickButton label="Equipos" onClick={() => router.push('/equipos')} />
          <QuickButton label="Ranking" onClick={() => router.push('/ranking')} />
        </div>
      )}

      {profile?.role === 'Scout' && (
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          <QuickButton label="Ir a Scouting" onClick={() => router.push('/scouting')} primary />
          <QuickButton label="Comparativa" onClick={() => router.push('/comparativa')} />
          <QuickButton label="Ranking" onClick={() => router.push('/ranking')} />
        </div>
      )}

      {profile?.role === 'Admin' && (
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          <QuickButton label="Administrar Usuarios" onClick={() => router.push('/admin')} primary />
          <QuickButton label="Clubs" onClick={() => router.push('/clubs')} />
          <QuickButton label="Ranking" onClick={() => router.push('/ranking')} />
        </div>
      )}
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

function QuickStat({ label, value, color }) {
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
      <p style={{ fontSize: 28, fontWeight: 700, color, margin: 0 }}>{value}</p>
      <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{label}</p>
    </div>
  );
}

function QuickButton({ label, onClick, primary }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        background: primary ? '#1a1a2e' : '#f0f0f0',
        color: primary ? '#fff' : '#333',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      {label}
    </button>
  );
}

export default withAuth(DashboardPage);
