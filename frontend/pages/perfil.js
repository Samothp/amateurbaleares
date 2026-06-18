import { useState } from 'react';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { MessageBanner } from '../components/MessageBanner';
import { FormField } from '../components/FormField';

function ProfilePage({ user, profile: initialProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [name, setName] = useState(initialProfile?.name || '');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

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
      </div>
    </Layout>
  );
}

export default withAuth(ProfilePage);
