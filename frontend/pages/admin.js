import { useEffect, useState } from 'react';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { SkeletonList, SkeletonStyles } from '../components/Skeleton';

function AdminPage({ user: _user, profile }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data } = await supabase
        .from('users')
        .select('id, name, email, role, created_at')
        .order('created_at', { ascending: false });

      if (data) setUsers(data);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);

    if (!error) {
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    }
  };

  return (
    <Layout profile={profile}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Administración de Usuarios</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Gestiona los usuarios de la plataforma.</p>

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
                      <option value="Entrenador">Entrenador</option>
                      <option value="Club">Club</option>
                      <option value="Scout">Scout</option>
                      <option value="Admin">Admin</option>
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
