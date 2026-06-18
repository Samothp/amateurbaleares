import { useEffect, useState } from 'react';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { MessageBanner } from '../components/MessageBanner';
import { SkeletonList, SkeletonStyles } from '../components/Skeleton';

const ROLE_OPTIONS = ['Entrenador', 'Club', 'Scout', 'Admin'];

function AdminPage({ user: _user, profile }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [confirmRole, setConfirmRole] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        setMessage('Error al cargar usuarios: ' + error.message);
      } else if (data) {
        setUsers(data);
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setConfirmRole({ userId, newRole });
  };

  const confirmRoleChange = async () => {
    if (!confirmRole) return;
    const { userId, newRole } = confirmRole;
    setConfirmRole(null);

    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);

    if (error) {
      setMessage('Error al cambiar rol: ' + error.message);
    } else {
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      setMessage('Rol actualizado correctamente');
    }
  };

  return (
    <Layout profile={profile}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Administración de Usuarios</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Gestiona los usuarios de la plataforma.</p>

      <MessageBanner message={message} />

      {confirmRole && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={() => setConfirmRole(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              padding: 24,
              borderRadius: 12,
              maxWidth: 400,
              width: '90%',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            }}
          >
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>¿Cambiar rol?</h3>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
              El usuario pasará a tener el rol <strong>{confirmRole.newRole}</strong>.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmRole(null)}
                style={{
                  padding: '8px 16px',
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmRoleChange}
                style={{
                  padding: '8px 16px',
                  background: '#1a1a2e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <>
          <SkeletonStyles />
          <SkeletonList count={5} />
        </>
      ) : (
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontSize: 13, color: '#666' }}>Nombre</th>
                <th style={{ padding: '12px 16px', fontSize: 13, color: '#666' }}>Email</th>
                <th style={{ padding: '12px 16px', fontSize: 13, color: '#666' }}>Rol</th>
                <th style={{ padding: '12px 16px', fontSize: 13, color: '#666' }}>Registro</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '12px 16px' }}>{u.name || 'Sin nombre'}</td>
                  <td style={{ padding: '12px 16px', color: '#666' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <select
                      value={u.role || ''}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        border: '1px solid #ddd',
                        fontSize: 13,
                      }}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#999', fontSize: 13 }}>
                    {new Date(u.created_at).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

export default withAuth(AdminPage, ['Admin']);
