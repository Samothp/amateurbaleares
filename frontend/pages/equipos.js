import { useEffect, useState } from 'react';
import Image from 'next/image';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { SkeletonList } from '../components/Skeleton';
import { SearchBar, filterByText } from '../components/SearchBar';
import { Pagination, paginate } from '../components/Pagination';
import { Toast } from '../components/Toast';

const LIGAS = [
  'Tercera Federación',
  'División de Honor Mallorca',
  'División de Honor Menorca',
  'Preferente Regional Mallorca',
  'Primera Regional Mallorca (Grupo A)',
  'Primera Regional Mallorca (Grupo B)',
  'Segunda Regional Mallorca (Grupo A)',
  'Segunda Regional Mallorca (Grupo B)',
  'Segunda Regional Mallorca (Grupo C)',
];

const CIUDADES = [
  'Alaior',
  'Alaró',
  'Alcúdia',
  'Algaida',
  'Andratx',
  'Artà',
  'Banyalbufar',
  'Binissalem',
  'Bunyola',
  'Calvià',
  'Campos',
  'Campanet',
  'Capdepera',
  'Ciutadella',
  'Consell',
  'Deià',
  'Eivissa',
  'Es Castell',
  'Es Mercadal',
  "Es Pont d'Inca",
  'Esporles',
  'Felanitx',
  'Ferreries',
  'Formentera',
  'Inca',
  'Lloret de Vistalegre',
  'Llucmajor',
  'Maó',
  'Manacor',
  'Maria de la Salut',
  'Marratxí',
  'Montuïri',
  'Muro',
  'Palma',
  'Petra',
  'Pollença',
  'Porreres',
  'Sa Pobla',
  'Sant Antoni de Portmany',
  'Sant Joan de Labritja',
  'Sant Lluís',
  'Santanyí',
  'Santa Eugènia',
  'Santa Eulària des Riu',
  'Santa Margalida',
  'Santa María del Camí',
  'Sencelles',
  'Ses Salines',
  'Sineu',
  'Sóller',
  'Son Servera',
  'Valldemossa',
  'Vilafranca de Bonany',
].sort();

function EquiposPage({ user, profile }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Senior', liga: '', ciudad: '' });
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  async function fetchTeams() {
    const supabase = getSupabase();
    if (!supabase) return;

    if (profile?.role === 'Entrenador') {
      // For Entrenador, fetch the team where they are the coach
      console.log('Fetching teams for Entrenador with user.id:', user.id);
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, category, liga, ciudad, crest, coach_id, created_at')
        .eq('coach_id', user.id);
      console.log('Query result:', { data, error });
      if (error) {
        console.error('Error fetching teams:', error);
        setToast('Error al cargar equipos: ' + error.message);
      }
      if (data) setTeams(data);
    } else {
      // For other roles, fetch all teams
      const { data } = await supabase
        .from('teams')
        .select('id, name, category, liga, ciudad, crest, coach_id, created_at')
        .order('created_at', { ascending: false });
      if (data) setTeams(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchTeams();
  }, [user?.id, profile?.role]);

  const resetForm = () => {
    setForm({ name: '', category: 'Senior', liga: '', ciudad: '' });
    setEditingTeam(null);
    setShowForm(false);
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setForm({
      name: team.name || '',
      category: team.category || '',
      liga: team.liga || '',
      ciudad: team.ciudad || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);
    const supabase = getSupabase();
    if (!supabase) return;

    if (editingTeam) {
      const { error } = await supabase
        .from('teams')
        .update({
          name: form.name,
          category: form.category,
          liga: form.liga || null,
          ciudad: form.ciudad || null,
        })
        .eq('id', editingTeam.id);
      if (error) {
        setToast('Error al actualizar: ' + error.message);
      } else {
        setToast('Equipo actualizado correctamente');
        resetForm();
        fetchTeams();
      }
    } else {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: form.name,
          category: form.category,
          liga: form.liga || null,
          ciudad: form.ciudad || null,
          coach_id: user.id,
        })
        .select();
      if (error) {
        setToast('Error al crear: ' + error.message);
      } else if (!data || data.length === 0) {
        setToast('Error al crear: verifica las políticas de acceso.');
      } else {
        setToast('Equipo creado correctamente');
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
      setToast('Error al eliminar: ' + error.message);
    } else {
      setToast('Equipo eliminado');
      setDeleteConfirm(null);
      fetchTeams();
    }
  };

  const handleCrestUpload = async (e, teamId) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setToast('Formato no válido. Usa JPG, PNG, WebP o GIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast('El archivo supera los 5MB.');
      return;
    }

    const supabase = getSupabase();
    if (!supabase) return;

    const ext = file.name.split('.').pop();
    const path = `crests/${teamId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setToast('Error al subir escudo: ' + uploadError.message);
      return;
    }

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from('teams')
      .update({ crest: publicUrl })
      .eq('id', teamId);

    if (updateError) {
      setToast('Error al guardar escudo: ' + updateError.message);
    } else {
      setToast('Escudo actualizado');
      fetchTeams();
    }
  };

  const canEdit = profile?.role === 'Admin';
  const canCreate = profile?.role === 'Admin';

  const filtered = filterByText(teams, search, ['name', 'category', 'liga', 'ciudad']);
  const paged = paginate(filtered, page, PAGE_SIZE);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <Layout profile={profile}>
      <Toast message={toast} onClose={() => setToast(null)} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <h1 style={{ fontSize: 24 }}>
          {profile?.role === 'Entrenador' ? 'Mi Equipo' : 'Mis Equipos'}
        </h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <SearchBar value={search} onChange={handleSearchChange} placeholder="Buscar equipo..." />
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
                whiteSpace: 'nowrap',
              }}
            >
              {showForm ? 'Cancelar' : '+ Nuevo Equipo'}
            </button>
          )}
        </div>
      </div>

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
              value="Senior"
              disabled
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd', background: '#f5f5f5', color: '#666' }}
            />
            <select
              value={form.liga}
              onChange={(e) => setForm({ ...form, liga: e.target.value })}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
            >
              <option value="">Seleccionar liga...</option>
              {LIGAS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <select
              value={form.ciudad}
              onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
            >
              <option value="">Seleccionar ciudad...</option>
              {CIUDADES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
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
        <>
          <SkeletonList count={4} />
        </>
      ) : filtered.length === 0 ? (
        <div
          style={{
            background: '#fff',
            padding: 48,
            borderRadius: 12,
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <p style={{ color: '#666' }}>
            {search ? 'No se encontraron equipos.' : 'No tienes equipos creados aún.'}
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16,
            }}
          >
            {paged.map((team) => (
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
                    <p style={{ color: '#666', fontSize: 14 }}>
                      {team.category || 'Sin categoría'}
                    </p>
                    {team.liga && (
                      <p style={{ color: '#666', fontSize: 13, marginTop: 2 }}>Liga: {team.liga}</p>
                    )}
                    {team.ciudad && (
                      <p style={{ color: '#666', fontSize: 13, marginTop: 2 }}>
                        Ciudad: {team.ciudad}
                      </p>
                    )}
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
          <Pagination
            currentPage={page}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </Layout>
  );
}

export default withAuth(EquiposPage, ['Entrenador', 'Club', 'Admin']);
