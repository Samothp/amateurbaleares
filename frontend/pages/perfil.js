import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { MessageBanner } from '../components/MessageBanner';

function ProfilePage({ user, profile }) {
  const router = useRouter();
  const [name, setName] = useState(profile?.name || '');
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

    const { error } = await supabase.from('users').update({ name }).eq('id', user.id);

    setLoading(false);
    setMessage(
      error ? 'Error al actualizar: ' + error.message : 'Perfil actualizado correctamente'
    );
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 700 }}>
        <Card padding={24}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Datos personales</h2>
          <form onSubmit={handleUpdate} style={{ display: 'grid', gap: 12 }}>
            <label style={{ fontSize: 14 }}>
              <span style={{ display: 'block', marginBottom: 4, color: '#666' }}>Nombre</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  fontSize: 14,
                }}
              />
            </label>
            <label style={{ fontSize: 14 }}>
              <span style={{ display: 'block', marginBottom: 4, color: '#666' }}>Email</span>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  fontSize: 14,
                  background: '#f5f5f5',
                }}
              />
            </label>
            <label style={{ fontSize: 14 }}>
              <span style={{ display: 'block', marginBottom: 4, color: '#666' }}>Rol</span>
              <input
                type="text"
                value={profile?.role || ''}
                disabled
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  fontSize: 14,
                  background: '#f5f5f5',
                }}
              />
            </label>
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
