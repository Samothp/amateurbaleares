import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getSupabase } from '../lib/supabaseClient';
import { NAV_ITEMS, ROLE_LABELS } from '../lib/roles';

export default function Layout({ children, profile }) {
  const router = useRouter();
  const navItems = NAV_ITEMS[profile?.role] || [];
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, display: 'none' }}
          className="sidebar-overlay"
        />
      )}

      <aside
        className="sidebar"
        style={{
          width: 240,
          background: '#1a1a2e',
          color: '#fff',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          position: sidebarOpen ? 'fixed' : undefined,
          top: sidebarOpen ? 0 : undefined,
          left: sidebarOpen ? 0 : undefined,
          height: sidebarOpen ? '100vh' : undefined,
          zIndex: sidebarOpen ? 50 : undefined,
          transition: 'transform 0.3s ease',
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 32, paddingLeft: 8 }}>AmateurBaleares</h2>
        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'block',
                padding: '10px 12px',
                marginBottom: 4,
                borderRadius: 8,
                color: router.pathname === item.href || router.pathname.startsWith(item.href + '/') ? '#fff' : '#a0a0b0',
                background: router.pathname === item.href || router.pathname.startsWith(item.href + '/') ? '#16213e' : 'transparent',
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header className="mobile-header" style={{ display: 'none', padding: '12px 16px', background: '#1a1a2e', color: '#fff', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>
            ☰
          </button>
          <span style={{ fontSize: 16, fontWeight: 600 }}>AmateurBaleares</span>
        </header>

        <main style={{ flex: 1, padding: 32, background: '#f5f5f5' }}>
          {children}
        </main>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .sidebar { display: ${sidebarOpen ? 'flex' : 'none'} !important; }
          .sidebar-overlay { display: ${sidebarOpen ? 'block' : 'none'} !important; }
          .mobile-header { display: flex !important; }
          main { padding: 16px !important; }
        }
      `}</style>
    </div>
  );
}
