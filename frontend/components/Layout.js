import { useRouter } from 'next/router';
import Link from 'next/link';
import { getSupabase } from '../lib/supabaseClient';
import { NAV_ITEMS, ROLE_LABELS } from '../lib/roles';

export default function Layout({ children, profile }) {
  const router = useRouter();
  const navItems = NAV_ITEMS[profile?.role] || [];

  const handleSignOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <aside style={{ width: 240, background: '#1a1a2e', color: '#fff', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: 18, marginBottom: 32, paddingLeft: 8 }}>AmateurBaleares</h2>
        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '10px 12px',
                marginBottom: 4,
                borderRadius: 8,
                color: router.pathname === item.href ? '#fff' : '#a0a0b0',
                background: router.pathname === item.href ? '#16213e' : 'transparent',
                textDecoration: 'none',
                fontSize: 14,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ borderTop: '1px solid #333', paddingTop: 16 }}>
          <p style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 4 }}>{profile?.name}</p>
          <p style={{ fontSize: 11, color: '#666', marginBottom: 12 }}>{ROLE_LABELS[profile?.role] || profile?.role}</p>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'transparent',
              border: '1px solid #444',
              borderRadius: 8,
              color: '#a0a0b0',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: 32, background: '#f5f5f5' }}>
        {children}
      </main>
    </div>
  );
}
