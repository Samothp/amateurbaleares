import { useRouter } from 'next/router';
import withAuth from '../lib/withAuth';
import Layout from '../components/Layout';

function DashboardPage({ user, profile }) {
  const router = useRouter();

  return (
    <Layout profile={profile}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Bienvenido, {profile?.name}.</p>

      <div
        style={{
          background: '#fff',
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
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
        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => router.push('/equipos')}
            style={{
              padding: '10px 20px',
              background: '#1a1a2e',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              marginRight: 12,
            }}
          >
            Gestionar Equipos
          </button>
          <button
            onClick={() => router.push('/jugadores')}
            style={{
              padding: '10px 20px',
              background: '#16213e',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Ver Jugadores
          </button>
        </div>
      )}

      {profile?.role === 'Scout' && (
        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => router.push('/scouting')}
            style={{
              padding: '10px 20px',
              background: '#1a1a2e',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Ir a Scouting
          </button>
        </div>
      )}

      {profile?.role === 'Admin' && (
        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => router.push('/admin')}
            style={{
              padding: '10px 20px',
              background: '#1a1a2e',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Administrar Usuarios
          </button>
        </div>
      )}
    </Layout>
  );
}

export default withAuth(DashboardPage);
