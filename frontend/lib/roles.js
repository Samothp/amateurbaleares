export const ROLES = {
  ENTRENADOR: 'Entrenador',
  CLUB: 'Club',
  SCOUT: 'Scout',
  ADMIN: 'Admin',
};

export const ROLE_LABELS = {
  Entrenador: 'Entrenador',
  Club: 'Club',
  Scout: 'Scout',
  Admin: 'Administrador',
};

export const NAV_ITEMS = {
  Entrenador: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Mis Equipos', href: '/equipos' },
    { label: 'Jugadores', href: '/jugadores' },
    { label: 'Partidos', href: '/partidos' },
    { label: 'Dash. Jugador', href: '/dashboard-jugador' },
    { label: 'Dash. Equipo', href: '/dashboard-equipo' },
  ],
  Club: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Equipos', href: '/equipos' },
    { label: 'Jugadores', href: '/jugadores' },
    { label: 'Partidos', href: '/partidos' },
    { label: 'Dash. Jugador', href: '/dashboard-jugador' },
    { label: 'Dash. Equipo', href: '/dashboard-equipo' },
  ],
  Scout: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Scouting', href: '/scouting' },
    { label: 'Jugadores', href: '/jugadores' },
    { label: 'Dash. Jugador', href: '/dashboard-jugador' },
  ],
  Admin: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Usuarios', href: '/admin' },
    { label: 'Equipos', href: '/equipos' },
    { label: 'Jugadores', href: '/jugadores' },
    { label: 'Partidos', href: '/partidos' },
    { label: 'Dash. Jugador', href: '/dashboard-jugador' },
    { label: 'Dash. Equipo', href: '/dashboard-equipo' },
  ],
};

export function isRole(role) {
  return Object.values(ROLES).includes(role);
}
