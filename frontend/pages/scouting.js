import { useEffect, useState } from 'react';
import Link from 'next/link';
import withAuth from '../lib/withAuth';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { useDebounce } from '../lib/hooks';

function ScoutingPage({ user: _user, profile }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    async function fetchPlayers() {
      const supabase = getSupabase();
      if (!supabase) return;

      let query = supabase
        .from('players')
        .select('id, name, age, position, dorsal, height, weight, dominant_foot, team_id');

      if (debouncedSearch) {
        query = query.ilike('name', `%${debouncedSearch}%`);
      }

      const { data } = await query.order('name');
      if (data) setPlayers(data);
      setLoading(false);
    }
    fetchPlayers();
  }, [debouncedSearch]);

  return (
    <Layout profile={profile}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Scouting</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Busca y evalúa jugadores para identificar talento.
      </p>

      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Buscar jugador por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 8,
            border: '1px solid #ddd',
            width: '100%',
            maxWidth: 400,
            fontSize: 14,
          }}
        />
      </div>

      {loading ? (
        <p>Cargando jugadores...</p>
      ) : players.length === 0 ? (
        <div
          style={{
            background: '#fff',
            padding: 48,
            borderRadius: 12,
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <p style={{ color: '#666' }}>No se encontraron jugadores.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {players.map((player) => (
            <Link
              key={player.id}
              href={`/jugador/${player.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  background: '#fff',
                  padding: 20,
                  borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)')
                }
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}
                >
                  <div>
                    <h3 style={{ marginBottom: 4 }}>{player.name}</h3>
                    <p style={{ color: '#666', fontSize: 14 }}>
                      {player.position || 'Sin posición'}
                    </p>
                  </div>
                  {player.dorsal && (
                    <span
                      style={{
                        background: '#1a1a2e',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 13,
                      }}
                    >
                      #{player.dorsal}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    marginTop: 12,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    fontSize: 13,
                    color: '#666',
                  }}
                >
                  {player.age && (
                    <span style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: 6 }}>
                      {player.age} años
                    </span>
                  )}
                  {player.height && (
                    <span style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: 6 }}>
                      {player.height} cm
                    </span>
                  )}
                  {player.weight && (
                    <span style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: 6 }}>
                      {player.weight} kg
                    </span>
                  )}
                  {player.dominant_foot && (
                    <span style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: 6 }}>
                      {player.dominant_foot}
                    </span>
                  )}
                </div>
                <p style={{ marginTop: 12, fontSize: 12, color: '#2d6a4f', fontWeight: 500 }}>
                  Ver perfil scouting →
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default withAuth(ScoutingPage, ['Scout', 'Admin']);
