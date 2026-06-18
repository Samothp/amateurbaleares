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
  Scout: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Scouting', href: '/scouting' },
    { label: 'Jugadores', href: '/jugadores' },
    { label: 'Dash. Jugador', href: '/dashboard-jugador' },
    { label: 'Comparativa', href: '/comparativa' },
    { label: 'Ranking', href: '/ranking' },
    { label: 'Mi Perfil', href: '/perfil' },
  ],
  Admin: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Usuarios', href: '/admin' },
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

export function isRole(role) {
  return Object.values(ROLES).includes(role);
}
