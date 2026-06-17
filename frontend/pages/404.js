import Link from 'next/link';

export default function Custom404() {
  return (
    <div style={{ padding: 48, fontFamily: 'Inter, system-ui, sans-serif', textAlign: 'center', maxWidth: 480, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <p style={{ fontSize: 64, marginBottom: 16 }}>404</p>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Página no encontrada</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>La página que buscas no existe o fue movida.</p>
      <Link href="/" style={{ display: 'inline-block', padding: '10px 20px', background: '#1a1a2e', color: '#fff', borderRadius: 8, textDecoration: 'none' }}>
        Volver al inicio
      </Link>
    </div>
  );
}
