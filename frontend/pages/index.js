import Link from 'next/link';

const FEATURES = [
  {
    icon: '⚽',
    title: 'Gestión de Equipos',
    desc: 'Crea y administra tus equipos, jugadores y partidos en un solo lugar.',
  },
  {
    icon: '📊',
    title: 'Estadísticas Detalladas',
    desc: 'Analiza el rendimiento de tu equipo con gráficos y datos en tiempo real.',
  },
  {
    icon: '🔍',
    title: 'Scouting Inteligente',
    desc: 'Busca y evalúa jugadores con perfiles detallados y análisis de fortalezas.',
  },
  {
    icon: '📱',
    title: 'Acceso desde Cualquier Lugar',
    desc: 'Plataforma web responsive, disponible en móvil y escritorio.',
  },
];

export default function Home() {
  return (
    <main
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        minHeight: '100vh',
      }}
    >
      <section
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: '#fff',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 16 }}>Amateur Baleares</h1>
        <p
          style={{
            fontSize: 18,
            color: '#a0a0b0',
            maxWidth: 560,
            margin: '0 auto 32px',
            lineHeight: 1.6,
          }}
        >
          Plataforma de estadísticas y scouting de fútbol amateur para clubes, entrenadores y scouts
          en Baleares.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/register"
            style={{
              padding: '14px 32px',
              background: '#2d6a4f',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Comenzar gratis
          </Link>
          <Link
            href="/login"
            style={{
              padding: '14px 32px',
              background: 'transparent',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: 8,
              border: '1px solid #444',
              fontWeight: 500,
              fontSize: 15,
            }}
          >
            Iniciar sesión
          </Link>
        </div>
      </section>

      <section
        style={{
          padding: '64px 24px',
          maxWidth: 960,
          margin: '0 auto',
        }}
      >
        <h2 style={{ fontSize: 28, textAlign: 'center', marginBottom: 48 }}>
          Todo lo que necesitas para gestionar tu equipo
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 24,
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                padding: 24,
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: '1px solid #f0f0f0',
              }}
            >
              <p style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</p>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: '64px 24px',
          background: '#f8f9fa',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: 28, marginBottom: 16 }}>¿Listo para empezar?</h2>
        <p style={{ color: '#666', marginBottom: 32, fontSize: 16 }}>
          Únete a la plataforma y comienza a mejorar tu equipo hoy.
        </p>
        <Link
          href="/register"
          style={{
            padding: '14px 32px',
            background: '#1a1a2e',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          Crear cuenta gratis
        </Link>
      </section>

      <footer
        style={{
          padding: '24px',
          textAlign: 'center',
          color: '#999',
          fontSize: 13,
          borderTop: '1px solid #eee',
        }}
      >
        Amateur Baleares &copy; {new Date().getFullYear()}
      </footer>
    </main>
  );
}
