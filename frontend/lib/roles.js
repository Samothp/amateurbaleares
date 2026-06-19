export const ROLES = {
  ENTRENADOR: 'Entrenador',
  CLUB: 'Club',
  OJEADOR: 'Ojeador',
  JUGADOR: 'Jugador',
  AFICIONADO: 'Aficionado',
  ADMIN: 'Admin',
};

export const ROLE_LABELS = {
  Entrenador: 'Entrenador',
  Club: 'Club',
  Ojeador: 'Ojeador',
  Jugador: 'Jugador',
  Aficionado: 'Aficionado',
  Admin: 'Administrador',
};

export const ROLE_STATUS = {
  NONE: 'none',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const NAV_ITEMS = {
  Aficionado: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Ranking', href: '/ranking' },
    { label: 'Comparativa', href: '/comparativa' },
    { label: 'Scouting', href: '/scouting' },
    { label: 'Partidos', href: '/partidos' },
    { label: 'Equipos', href: '/equipos' },
    { label: 'Jugadores', href: '/jugadores' },
    { label: 'Mi Perfil', href: '/perfil' },
  ],
  Entrenador: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Mi Equipo', href: '/equipos' },
    { label: 'Jugadores', href: '/jugadores' },
    { label: 'Partidos', href: '/partidos' },
    { label: 'Dash. Jugador', href: '/dashboard-jugador' },
    { label: 'Dash. Equipo', href: '/dashboard-equipo' },
    { label: 'Comparativa', href: '/comparativa' },
    { label: 'Ranking', href: '/ranking' },
    { label: 'Mi Perfil', href: '/perfil' },
  ],
  Club: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Mi Club', href: '/clubs' },
    { label: 'Equipos', href: '/equipos' },
    { label: 'Jugadores', href: '/jugadores' },
    { label: 'Partidos', href: '/partidos' },
    { label: 'Dash. Jugador', href: '/dashboard-jugador' },
    { label: 'Dash. Equipo', href: '/dashboard-equipo' },
    { label: 'Comparativa', href: '/comparativa' },
    { label: 'Ranking', href: '/ranking' },
    { label: 'Mi Perfil', href: '/perfil' },
  ],
  Ojeador: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Scouting', href: '/scouting' },
    { label: 'Jugadores', href: '/jugadores' },
    { label: 'Dash. Jugador', href: '/dashboard-jugador' },
    { label: 'Comparativa', href: '/comparativa' },
    { label: 'Ranking', href: '/ranking' },
    { label: 'Mi Perfil', href: '/perfil' },
  ],
  Jugador: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Mi Ficha', href: '/dashboard-jugador' },
    { label: 'Partidos', href: '/partidos' },
    { label: 'Comparativa', href: '/comparativa' },
    { label: 'Ranking', href: '/ranking' },
    { label: 'Mi Perfil', href: '/perfil' },
  ],
  Admin: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Usuarios', href: '/admin' },
    { label: 'Solicitudes', href: '/admin?tab=solicitudes' },
    { label: 'Clubs', href: '/clubs' },
    { label: 'Equipos', href: '/equipos' },
    { label: 'Jugadores', href: '/jugadores' },
    { label: 'Partidos', href: '/partidos' },
    { label: 'Dash. Jugador', href: '/dashboard-jugador' },
    { label: 'Dash. Equipo', href: '/dashboard-equipo' },
    { label: 'Comparativa', href: '/comparativa' },
    { label: 'Ranking', href: '/ranking' },
    { label: 'Mi Perfil', href: '/perfil' },
  ],
};

export const SUBSCRIPTION_ROLES = ['Entrenador', 'Club', 'Ojeador', 'Jugador'];

export const ROLE_EXTRA_FIELDS = {
  Entrenador: ['license', 'experience_years', 'preferred_formation'],
  Club: ['club_name', 'position_in_club'],
  Ojeador: ['scout_zone', 'preferred_categories', 'scout_experience'],
  Jugador: ['current_team_id', 'position', 'birth_year', 'dominant_foot', 'height', 'weight'],
  Aficionado: [],
  Admin: [],
};

export function isSubscriptionRole(role) {
  return SUBSCRIPTION_ROLES.includes(role);
}

export function isRole(role) {
  return Object.values(ROLES).includes(role);
}

export function getNavItems(role) {
  return NAV_ITEMS[role] || NAV_ITEMS.Aficionado;
}

export function getExtraFields(role) {
  return ROLE_EXTRA_FIELDS[role] || [];
}
