import { useState, useEffect } from 'react';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { MessageBanner } from '../components/MessageBanner';
import { FormField } from '../components/FormField';
import RoleRequestForm from '../components/RoleRequestForm';

function ProfilePage({ user, profile: initialProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [name, setName] = useState(initialProfile?.name || '');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(initialProfile?.team?.id || '');

  useEffect(() => {
    async function fetchTeams() {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase.from('teams').select('id, name, category').order('name');
      if (data) setTeams(data);
    }
    fetchTeams();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = getSupabase();
    if (!supabase) {
      setMessage('Error: Supabase no disponible');
      setLoading(false);
      return;
    }

    const { data: updated, error } = await supabase
      .from('users')
      .update({ name })
      .eq('id', user.id)
      .select();

    if (error) {
      setMessage('Error al actualizar: ' + error.message);
      setLoading(false);
      return;
    }

    if (!updated || updated.length === 0) {
      const { error: insertError } = await supabase.from('users').upsert({
        id: user.id,
        name,
        email: user.email,
        role: profile?.role || 'Entrenador',
      });

      if (insertError) {
        setMessage('Error al crear perfil: ' + insertError.message);
        setLoading(false);
        return;
      }
    }

    const { data: refreshed } = await supabase
      .from('users')
      .select('name, email, role')
      .eq('id', user.id)
      .single();

    if (refreshed) {
      setProfile(refreshed);
      setName(refreshed.name || '');
    }

    setMessage('Perfil actualizado correctamente');
    setLoading(false);
  };

  const handlePasswordChange = async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setMessage(
      error
        ? 'Error al enviar email: ' + error.message
        : 'Email de cambio de contraseña enviado. Revisa tu bandeja.'
    );
  };

  const handleAssignTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = getSupabase();
    if (!supabase) {
      setMessage('Error: Supabase no disponible');
      setLoading(false);
      return;
    }

    const teamId = selectedTeamId || null;

    const { error: clearError } = await supabase
      .from('teams')
      .update({ coach_id: null })
      .eq('coach_id', user.id);

    if (clearError) {
      setMessage('Error al limpiar asignación anterior: ' + clearError.message);
      setLoading(false);
      return;
    }

    if (teamId) {
      const { data: updateData, error } = await supabase
        .from('teams')
        .update({ coach_id: user.id })
        .eq('id', teamId)
        .select();

      if (error) {
        console.error('Error al asignar equipo:', error);
        setMessage('Error al asignar equipo: ' + error.message);
        setLoading(false);
        return;
      }

      if (!updateData || updateData.length === 0) {
        setMessage('Error: No se pudo actualizar el equipo. Verifica los permisos.');
        setLoading(false);
        return;
      }
    }

    if (teamId) {
      const { data: teamData, error: fetchError } = await supabase
        .from('teams')
        .select('id, name, category, liga, ciudad')
        .eq('id', teamId)
        .single();

      if (fetchError) {
        setMessage('Error al verificar asignación: ' + fetchError.message);
        setLoading(false);
        return;
      }

      setProfile({ ...profile, team: teamData || null });
      setMessage('Equipo asignado correctamente');
    } else {
      setProfile({ ...profile, team: null });
      setMessage('Equipo desasignado');
    }

    setSelectedTeamId(teamId);
    setLoading(false);
  };

  return (
    <Layout profile={profile}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Mi Perfil</h1>

      <MessageBanner message={message} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
          maxWidth: 700,
        }}
      >
        <Card padding={24}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Datos personales</h2>
          <form onSubmit={handleUpdate} style={{ display: 'grid', gap: 12 }}>
            <FormField
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
            <FormField label="Email" type="email" value={user?.email || ''} disabled />
            <FormField label="Rol" value={profile?.role || ''} disabled />
            <Button type="submit" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </form>
        </Card>

        <Card padding={24}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Seguridad</h2>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
            Para cambiar tu contraseña, te enviaremos un email con un enlace de restablecimiento.
          </p>
          <Button variant="ghost" onClick={handlePasswordChange}>
            Cambiar contraseña
          </Button>
        </Card>

        {(profile?.role === 'Aficionado' || profile?.role_status === 'pending') && (
          <Card padding={24}>
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Solicitar Rol</h2>
            {profile?.role === 'Aficionado' ? (
              <div>
                <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
                  Solicita un rol específico (Entrenador, Club, Ojeador, Jugador) para acceder a más funcionalidades.
                </p>
                <RoleRequestForm
                  initialRole={profile?.requested_role || 'Aficionado'}
                  initialExtraFields={{
                    license: profile?.license || '',
                    experience_years: profile?.experience_years || '',
                    preferred_formation: profile?.preferred_formation || '',
                    club_name: profile?.club_name || '',
                    position_in_club: profile?.position_in_club || '',
                    scout_zone: profile?.scout_zone || '',
                    preferred_categories: profile?.preferred_categories || '',
                    scout_experience: profile?.scout_experience || '',
                    current_team_id: profile?.current_team_id || '',
                    position: profile?.position || '',
                    birth_year: profile?.birth_year || '',
                    dominant_foot: profile?.dominant_foot || '',
                    height: profile?.height || '',
                    weight: profile?.weight || '',
                  }}
                  submitLabel="Enviar solicitud"
                  isEditing={false}
                />
              </div>
            ) : profile?.role_status === 'pending' ? (
              <div>
                <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
                  Ya has solicitado un cambio de rol a <strong>{profile?.requested_role}</strong>.
                  El administrador lo revisará pronto.
                </p>
                <p style={{ fontSize: 13, color: '#999' }}>
                  Estado: En espera de aprobación
                </p>
              </div>
            ) : null}
          </Card>
        )}

        {profile?.role === 'Entrenador' && (
          <Card padding={24}>
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Mi Equipo</h2>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
              Asocia tu perfil con un equipo del sistema.
            </p>
            <form onSubmit={handleAssignTeam} style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>
                  Equipo asignado
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    fontSize: 14,
                  }}
                >
                  <option value="">Sin equipo asignado</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                      {t.category ? ' (' + t.category + ')' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? 'Guardando...' : 'Guardar asignación'}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export default withAuth(ProfilePage);
