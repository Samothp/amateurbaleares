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
      let cancelled = false;

      async function checkAuth() {
        const supabase = getSupabase();
        if (!supabase) {
          if (!cancelled) {
            router.replace('/login');
          }
          return;
        }

        try {
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            if (!cancelled) {
              router.replace('/login');
            }
            return;
          }

          const sessionUser = data.session.user;

          const { data: userData } = await supabase
            .from('users')
            .select('name, email, role')
            .eq('id', sessionUser.id)
            .single();

          let userProfile = userData || {
            name: sessionUser.user_metadata?.full_name || sessionUser.email,
            email: sessionUser.email,
            role: sessionUser.user_metadata?.role || 'Entrenador',
          };

          if (userProfile.role === 'Entrenador') {
            const { data: teamData } = await supabase
              .from('teams')
              .select('id, name, category, liga, ciudad')
              .eq('coach_id', sessionUser.id)
              .single();
            if (teamData) {
              userProfile = { ...userProfile, team: teamData };
            }
          }

          if (!cancelled) {
            if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile.role)) {
              router.replace('/dashboard');
              return;
            }

            setUser(sessionUser);
            setProfile(userProfile);
            setLoading(false);
          }
        } catch (_err) {
          if (!cancelled) {
            router.replace('/login');
          }
        }
      }

      checkAuth();

      return () => {
        cancelled = true;
      };
    }, [router]);

    if (loading) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 32,
                height: 32,
                border: '3px solid #f0f0f0',
                borderTopColor: '#1a1a2e',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 12px',
              }}
            />
            <p style={{ color: '#666', fontSize: 14 }}>Cargando...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} user={user} profile={profile} />;
  };
}
