import { useEffect, useState } from 'react';
import Image from 'next/image';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';

function EquiposPage({ user, profile }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [form, setForm] = useState({ name: '', category: '' });
  const [message, setMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  async function fetchTeams() {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase
      .from('teams')
      .select('id, name, category, crest, coach_id, created_at')
      .order('created_at', { ascending: false });
    if (data) setTeams(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchTeams();
  }, []);

  const resetForm = () => {
    setForm({ name: '', category: '' });
    setEditingTeam(null);
    setShowForm(false);
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setForm({ name: team.name || '', category: team.category || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const supabase = getSupabase();
    if (!supabase) return;

    if (editingTeam) {
      const { error } = await supabase
        .from('teams')
        .update({ name: form.name, category: form.category })
        .eq('id', editingTeam.id);
      if (error) {
        setMessage('Error al actualizar: ' + error.message);
      } else {
        setMessage('Equipo actualizado correctamente');
        resetForm();
        fetchTeams();
      }
    } else {
      const { error } = await supabase.from('teams').insert({
        name: form.name,
        category: form.category,
        coach_id: user.id,
      });
      if (error) {
        setMessage('Error al crear: ' + error.message);
      } else {
        setMessage('Equipo creado correctamente');
        resetForm();
        fetchTeams();
      }
    }
  };

  const handleDelete = async (teamId) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('teams').delete().eq('id', teamId);
    if (error) {
      setMessage('Error al eliminar: ' + error.message);
    } else {
      setMessage('Equipo eliminado');
      setDeleteConfirm(null);
      fetchTeams();
    }
  };

  const handleCrestUpload = async (e, teamId) => {
    const file = e.target.files[0];
    if (!file) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const ext = file.name.split('.').pop();
    const path = `crests/${teamId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setMessage('Error al subir escudo: ' + uploadError.message);
      return;
    }

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from('teams')
      .update({ crest: publicUrl })
      .eq('id', teamId);

    if (updateError) {
      setMessage('Error al guardar escudo: ' + updateError.message);
    } else {
      setMessage('Escudo actualizado');
      fetchTeams();
    }
  };

  const canEdit =
    profile?.role === 'Entrenador' || profile?.role === 'Club' || profile?.role === 'Admin';

  return (
    <Layout profile={profile}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: 24 }}>Mis Equipos</h1>
        {canEdit && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            style={{
              padding: '10px 20px',
              background: '#1a1a2e',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            {showForm ? 'Cancelar' : '+ Nuevo Equipo'}
          </button>
        )}
      </div>

      {message && (
        <p
          style={{
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            background: message.includes('Error') ? '#ffe0e0' : '#e0ffe0',
            color: message.includes('Error') ? 'crimson' : 'green',
          }}
        >
          {message}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#fff',
            padding: 24,
            borderRadius: 12,
            marginBottom: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginBottom: 16 }}>{editingTeam ? 'Editar Equipo' : 'Crear Equipo'}</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <input
              type="text"
              placeholder="Nombre del equipo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
            />
            <input
              type="text"
              placeholder="Categoría (ej: Senior, Juvenil, Cadete)"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
            />
            <button
              type="submit"
              style={{
                padding: 10,
                background: '#1a1a2e',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              {editingTeam ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Cargando equipos...</p>
      ) : teams.length === 0 ? (
        <div
          style={{
            background: '#fff',
            padding: 48,
            borderRadius: 12,
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <p style={{ color: '#666' }}>No tienes equipos creados aún.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {teams.map((team) => (
            <div
              key={team.id}
              style={{
                background: '#fff',
                padding: 20,
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'start' }}>
                <div style={{ position: 'relative' }}>
                  {team.crest ? (
                    <Image
                      src={team.crest}
                      alt={team.name}
                      width={64}
                      height={64}
                      style={{
                        borderRadius: 12,
                        objectFit: 'cover',
                        background: '#f0f0f0',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 12,
                        background: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        color: '#ccc',
                      }}
                    >
                      ⚽
                    </div>
                  )}
                  {canEdit && (
                    <label
                      style={{
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        background: '#1a1a2e',
                        color: '#fff',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      📷
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCrestUpload(e, team.id)}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: 4 }}>{team.name}</h3>
                  <p style={{ color: '#666', fontSize: 14 }}>{team.category || 'Sin categoría'}</p>
                  <p style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                    Creado: {new Date(team.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              {canEdit && (
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: '1px solid #f0f0f0',
                  }}
                >
                  <button
                    onClick={() => handleEdit(team)}
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      background: '#f0f0f0',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(team.id)}
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      background: '#ffe0e0',
                      color: 'crimson',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              )}
              {deleteConfirm === team.id && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    background: '#fff5f5',
                    borderRadius: 8,
                    border: '1px solid #ffcccc',
                  }}
                >
                  <p style={{ fontSize: 13, marginBottom: 8 }}>
                    ¿Eliminar &quot;{team.name}&quot;? Esta acción no se puede deshacer.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleDelete(team.id)}
                      style={{
                        padding: '6px 12px',
                        background: 'crimson',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      Sí, eliminar
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      style={{
                        padding: '6px 12px',
                        background: '#f0f0f0',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default withAuth(EquiposPage, ['Entrenador', 'Club', 'Admin']);
