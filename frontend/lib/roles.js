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
  ],
  Club: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Equipos', href: '/equipos' },
    { label: 'Jugadores', href: '/jugadores' },
  ],
  Scout: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Scouting', href: '/scouting' },
    { label: 'Jugadores', href: '/jugadores' },
  ],
  Admin: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Usuarios', href: '/admin' },
    { label: 'Equipos', href: '/equipos' },
    { label: 'Jugadores', href: '/jugadores' },
  ],
};

export function isRole(role) {
  return Object.values(ROLES).includes(role);
}
