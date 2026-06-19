import { useState, useEffect } from 'react';
import { FormField } from './FormField';
import { getSupabase } from '../lib/supabaseClient';

const ROLE_OPTIONS = [
  { value: 'Aficionado', label: 'Aficionado (Free)', description: 'Acceso básico gratuito' },
  { value: 'Entrenador', label: 'Entrenador', description: 'Gestión de equipos y jugadores' },
  { value: 'Club', label: 'Club', description: 'Gestión de clubs y equipos' },
  { value: 'Ojeador', label: 'Ojeador', description: 'Scouting y análisis de jugadores' },
  { value: 'Jugador', label: 'Jugador', description: 'Mi ficha y estadísticas' },
];

const EXTRA_FIELDS = {
  Entrenador: [
    { name: 'license', label: 'Licencia/Titulación', type: 'text', placeholder: 'Ej: UEFA B, etc.', required: true },
    { name: 'experience_years', label: 'Años de experiencia', type: 'number', placeholder: 'Ej: 5', required: false },
    { name: 'preferred_formation', label: 'Formación preferida', type: 'select', options: ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2', 'Otro'], required: false },
  ],
  Club: [
    { name: 'club_name', label: 'Nombre del club', type: 'text', placeholder: 'Ej: FC Barcelona', required: true },
    { name: 'position_in_club', label: 'Cargo en el club', type: 'select', options: ['Presidente', 'Director Deportivo', 'Entrenador Principal', 'Secretario Técnico', 'Otro'], required: false },
  ],
  Ojeador: [
    { name: 'scout_zone', label: 'Zona de scouting', type: 'text', placeholder: 'Ej: Barcelona, Girona', required: false },
    { name: 'preferred_categories', label: 'Categorías de interés', type: 'text', placeholder: 'Ej: Juvenil, Senior, Femenino', required: false },
    { name: 'scout_experience', label: 'Experiencia en scouting', type: 'textarea', placeholder: 'Describe tu experiencia', required: false },
  ],
  Jugador: [
    { name: 'current_team_id', label: 'Equipo actual', type: 'select', placeholder: 'Selecciona tu equipo', required: false },
    { name: 'position', label: 'Posición', type: 'select', options: ['Portero', 'Defensa', 'Centrocampista', 'Delantero', 'Otro'], required: true },
    { name: 'birth_year', label: 'Año de nacimiento', type: 'number', placeholder: 'Ej: 1995', required: true },
    { name: 'dominant_foot', label: 'Pie dominante', type: 'select', options: ['Derecho', 'Izquierdo', 'Ambidiestro'], required: true },
    { name: 'height', label: 'Altura (cm)', type: 'number', placeholder: 'Ej: 180', required: false },
    { name: 'weight', label: 'Peso (kg)', type: 'number', placeholder: 'Ej: 75', required: false },
  ],
  Aficionado: [],
  Admin: [],
};

export default function RoleRequestForm({
  initialRole = 'Aficionado',
  initialExtraFields = {},
  onSubmit,
  submitLabel = 'Guardar',
  isEditing = false,
}) {
  const [requestedRole, setRequestedRole] = useState(initialRole);
  const [extraFields, setExtraFields] = useState(initialExtraFields);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);

  const availableRoles = ROLE_OPTIONS.filter(role => 
    role.value === 'Aficionado' || !isEditing
  );

  const roleFields = EXTRA_FIELDS[requestedRole] || [];

  useEffect(() => {
    async function fetchTeams() {
      const supabase = getSupabase();
      if (!supabase) return;
      
      const { data } = await supabase
        .from('teams')
        .select('id, name, category')
        .order('name');
      
      if (data) setTeams(data);
    }
    
    if (requestedRole === 'Jugador') {
      fetchTeams();
    }
  }, [requestedRole]);

  const handleExtraFieldChange = (name, value) => {
    setExtraFields(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = getSupabase();
    if (!supabase) {
      setMessage('Error: Supabase no disponible');
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage('Error: Usuario no autenticado');
        setLoading(false);
        return;
      }

      const roleUpdate = {
        requested_role: requestedRole,
        role_status: isEditing ? 'pending' : 'pending',
        ...extraFields,
      };

      if (!isEditing) {
        roleUpdate.role_requested_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('users')
        .update(roleUpdate)
        .eq('id', user.id);

      if (error) {
        setMessage('Error al actualizar rol: ' + error.message);
      } else {
        setMessage(
          isEditing
            ? 'Solicitud de cambio de rol actualizada. Espera la aprobación del admin.'
            : 'Solicitud de rol enviada. El admin la revisará pronto.'
        );
        if (onSubmit) onSubmit();
      }
    } catch (err) {
      setMessage('Error inesperado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
        {!isEditing && (
          <FormField
            label="Rol solicitado"
            value={requestedRole}
            onChange={(e) => {
              setRequestedRole(e.target.value);
              setExtraFields({});
            }}
            required
          >
            <select
              value={requestedRole}
              onChange={(e) => {
                setRequestedRole(e.target.value);
                setExtraFields({});
              }}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
            >
              {availableRoles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{availableRoles.find(r => r.value === requestedRole)?.description}</p>
          </FormField>
        )}

        {roleFields.map(field => {
          const commonProps = {
            label: field.label,
            value: extraFields[field.name] || '',
            onChange: (e) => handleExtraFieldChange(field.name, e.target.value),
            required: field.required,
          };

          if (field.type === 'select' && field.options) {
            return (
              <FormField key={field.name} {...commonProps}>
                <select
                  value={extraFields[field.name] || ''}
                  onChange={(e) => handleExtraFieldChange(field.name, e.target.value)}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
                >
                  <option value="">Seleccionar...</option>
                  {field.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </FormField>
            );
          }

          if (field.type === 'textarea') {
            return (
              <FormField key={field.name} {...commonProps}>
                <textarea
                  value={extraFields[field.name] || ''}
                  onChange={(e) => handleExtraFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', minHeight: 80, resize: 'vertical' }}
                />
              </FormField>
            );
          }

          return (
            <FormField key={field.name} {...commonProps} type={field.type} placeholder={field.placeholder} />
          );
        })}

        {requestedRole === 'Jugador' && teams.length > 0 && (
          <FormField
            label="Equipo actual"
            value={extraFields.current_team_id || ''}
            onChange={(e) => handleExtraFieldChange('current_team_id', e.target.value)}
          >
            <select
              value={extraFields.current_team_id || ''}
              onChange={(e) => handleExtraFieldChange('current_team_id', e.target.value)}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
            >
              <option value="">Seleccionar equipo...</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name} ({team.category})</option>
              ))}
            </select>
          </FormField>
        )}

        {message && (
          <div style={{ 
            padding: 12, 
            borderRadius: 8, 
            background: message.includes('Error') ? '#fee' : '#efe',
            color: message.includes('Error') ? '#d00' : '#080',
            fontSize: 14
          }}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 12,
            background: '#1a1a2e',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          {loading ? 'Guardando...' : submitLabel}
        </button>
      </form>
    </div>
  );
}
