import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSupabase } from '../lib/supabaseClient';

function capitalizeRole(role) {
  if (!role) return role;
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ name: '', role: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const supabase = getSupabase();
      if (!supabase) {
        router.replace('/login');
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }

      const session = data.session;
      setUser(session.user);

      // Obtener perfil desde la tabla users
      const { data: userData, error } = await supabase
        .from('users')
        .select('name, role')
        .eq('id', session.user.id)
        .single();

      if (userData) {
        setProfile({
          name: userData.name || session.user.email,
          role: userData.role ? capitalizeRole(userData.role) : 'Sin rol',
        });
      } else {
        // Fallback a metadatos si no existe en BD; intentamos crear el perfil automáticamente
        const metadata = session.user.user_metadata || {};
        const nameToSave = metadata.full_name || metadata.name || session.user.email;
        const roleToSave = metadata.role ? capitalizeRole(metadata.role) : 'Entrenador';

        try {
          const { data: inserted, error: insertError } = await supabase
            .from('users')
            .insert({ id: session.user.id, name: nameToSave, email: session.user.email, role: roleToSave })
            .select()
            .single();

          if (insertError) {
            console.error('Error creando perfil automáticamente:', insertError);
            setProfile({ name: nameToSave, role: roleToSave });
          } else {
            setProfile({ name: inserted.name || nameToSave, role: inserted.role || roleToSave });
          }
        } catch (e) {
          console.error('Excepción al crear perfil:', e);
          setProfile({ name: nameToSave, role: roleToSave });
        }
      }

      setLoading(false);
    }

    loadSession();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <p style={{ padding: 24, fontFamily: 'Inter, sans-serif' }}>Cargando...</p>;
  }

  return (
    <main style={{ padding: 24, fontFamily: 'Inter, sans-serif', maxWidth: 720, margin: '0 auto' }}>
      <h1>Dashboard</h1>
      <p>Bienvenido, {profile.name}.</p>
      <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 12, marginTop: 16 }}>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Rol:</strong> {profile.role}
        </p>
      </div>
      <button onClick={handleSignOut} style={{ marginTop: 24, padding: 12 }}>
        Cerrar sesión
      </button>
    </main>
  );
}
