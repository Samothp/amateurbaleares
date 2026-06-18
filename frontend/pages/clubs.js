import { useEffect, useState } from 'react';
import Image from 'next/image';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { Button } from '../components/Button';
import { SkeletonList } from '../components/Skeleton';
import { Card } from '../components/Card';
import { MessageBanner } from '../components/MessageBanner';
import { DeleteConfirm } from '../components/DeleteConfirm';
import { SearchBar, filterByText } from '../components/SearchBar';
import { Pagination, paginate } from '../components/Pagination';

function ClubsPage({ user: _user, profile }) {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [form, setForm] = useState({ name: '', city: '' });
  const [message, setMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  async function fetchClubs() {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase
      .from('clubs')
      .select('id, name, city, crest, created_at')
      .order('created_at', { ascending: false });
    if (data) setClubs(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchClubs();
  }, []);

  const resetForm = () => {
    setForm({ name: '', city: '' });
    setEditingClub(null);
    setShowForm(false);
  };

  const handleEdit = (club) => {
    setEditingClub(club);
    setForm({ name: club.name || '', city: club.city || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const supabase = getSupabase();
    if (!supabase) return;

    if (editingClub) {
      const { error } = await supabase
        .from('clubs')
        .update({ name: form.name, city: form.city })
        .eq('id', editingClub.id);
      setMessage(error ? 'Error al actualizar: ' + error.message : 'Club actualizado');
    } else {
      const { error } = await supabase.from('clubs').insert({ name: form.name, city: form.city });
      setMessage(error ? 'Error al crear: ' + error.message : 'Club creado');
    }
    resetForm();
    fetchClubs();
  };

  const handleDelete = async (clubId) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('clubs').delete().eq('id', clubId);
    setMessage(error ? 'Error al eliminar: ' + error.message : 'Club eliminado');
    setDeleteConfirm(null);
    fetchClubs();
  };

  const canEdit = profile?.role === 'Admin' || profile?.role === 'Club';

  const filtered = filterByText(clubs, search, ['name', 'city']);
  const paged = paginate(filtered, page, PAGE_SIZE);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <Layout profile={profile}>
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
        <h1 style={{ fontSize: 24 }}>Clubs</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <SearchBar value={search} onChange={handleSearchChange} placeholder="Buscar club..." />
          {canEdit && (
            <Button
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setShowForm(true);
                }
              }}
            >
              {showForm ? 'Cancelar' : '+ Nuevo Club'}
            </Button>
          )}
        </div>
      </div>

      <MessageBanner message={message} />

      {showForm && (
        <Card padding={24} style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>{editingClub ? 'Editar Club' : 'Crear Club'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 400 }}>
            <input
              type="text"
              placeholder="Nombre del club"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
            />
            <input
              type="text"
              placeholder="Ciudad"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
            />
            <Button type="submit">{editingClub ? 'Guardar' : 'Crear'}</Button>
          </form>
        </Card>
      )}

      {loading ? (
        <>
          <SkeletonList count={3} />
        </>
      ) : filtered.length === 0 ? (
        <Card padding={48} style={{ textAlign: 'center' }}>
          <p style={{ color: '#666' }}>{search ? 'No se encontraron clubs.' : 'No hay clubs registrados.'}</p>
        </Card>
      ) : (
        <>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {paged.map((club) => (
            <Card key={club.id} padding={20}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                {club.crest ? (
                  <Image
                    src={club.crest}
                    alt={club.name}
                    width={48}
                    height={48}
                    style={{ borderRadius: 8, objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      background: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                    }}
                  >
                    ⚽
                  </div>
                )}
                <div>
                  <h3 style={{ margin: 0 }}>{club.name}</h3>
                  <p style={{ color: '#666', fontSize: 13, margin: 0 }}>
                    {club.city || 'Sin ciudad'}
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
                  <Button
                    variant="ghost"
                    onClick={() => handleEdit(club)}
                    style={{ flex: 1, padding: '6px 12px', fontSize: 13 }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setDeleteConfirm(club.id)}
                    style={{ flex: 1, padding: '6px 12px', fontSize: 13 }}
                  >
                    Eliminar
                  </Button>
                </div>
              )}
              {deleteConfirm === club.id && (
                <DeleteConfirm
                  name={club.name}
                  onConfirm={() => handleDelete(club.id)}
                  onCancel={() => setDeleteConfirm(null)}
                />
              )}
            </Card>
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

export default withAuth(ClubsPage, ['Club', 'Admin']);
