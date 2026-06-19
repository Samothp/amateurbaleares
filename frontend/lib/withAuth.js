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
            .select('name, email, role, requested_role, role_status, license, experience_years, preferred_formation, club_name, position_in_club, scout_zone, preferred_categories, scout_experience, current_team_id, position, birth_year, dominant_foot, height, weight')
            .eq('id', sessionUser.id)
            .single();

          let userProfile = userData || {
            name: sessionUser.user_metadata?.full_name || sessionUser.email,
            email: sessionUser.email,
            role: sessionUser.user_metadata?.role || 'Aficionado',
            requested_role: null,
            role_status: 'none',
          };

          if (userProfile.role === 'Entrenador' || userProfile.role === 'Jugador') {
            const { data: teamData } = await supabase
              .from('teams')
              .select('id, name, category, liga, ciudad')
              .eq('coach_id', sessionUser.id)
              .single();
            if (teamData) {
              userProfile = { ...userProfile, team: teamData };
            }
          }

          if (userProfile.role === 'Jugador') {
            const { data: playerData } = await supabase
              .from('players')
              .select('id, name, age, position, dorsal, height, weight, dominant_foot, photo')
              .eq('team_id', userProfile.current_team_id)
              .single();
            if (playerData) {
              userProfile = { ...userProfile, player: playerData };
            }
          }

          if (!cancelled) {
            const effectiveRole = userProfile.role_status === 'approved' ? userProfile.role : userProfile.role;
            
            if (allowedRoles.length > 0 && !allowedRoles.includes(effectiveRole)) {
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
