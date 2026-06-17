import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSupabase } from './supabaseClient';

export default function withAuth(WrappedComponent, allowedRoles = []) {
  return function AuthenticatedComponent(props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
      async function checkAuth() {
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

        const sessionUser = data.session.user;

        const { data: userData } = await supabase
          .from('users')
          .select('name, email, role')
          .eq('id', sessionUser.id)
          .single();

        const userProfile = userData || {
          name: sessionUser.user_metadata?.full_name || sessionUser.email,
          email: sessionUser.email,
          role: sessionUser.user_metadata?.role || 'Entrenador',
        };

        if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile.role)) {
          router.replace('/dashboard');
          return;
        }

        setUser(sessionUser);
        setProfile(userProfile);
        setLoading(false);
      }

      checkAuth();
    }, [router]);

    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
          <p>Cargando...</p>
        </div>
      );
    }

    return <WrappedComponent {...props} user={user} profile={profile} />;
  };
}
