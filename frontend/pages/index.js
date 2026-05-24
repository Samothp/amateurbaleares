import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: 32, fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto', maxWidth: 680, margin: '0 auto' }}>
      <h1>Amateur Baleares — MVP Frontend</h1>
      <p>Bienvenido. Sprint 1: setup inicial y autenticación con roles.</p>
      <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
        <Link href="/login" style={{ padding: 14, background: '#111827', color: '#ffffff', textDecoration: 'none', borderRadius: 8, display: 'inline-block' }}>
          Login
        </Link>
        <Link href="/register" style={{ padding: 14, background: '#2563eb', color: '#ffffff', textDecoration: 'none', borderRadius: 8, display: 'inline-block' }}>
          Registro
        </Link>
      </div>
    </main>
  );
}
