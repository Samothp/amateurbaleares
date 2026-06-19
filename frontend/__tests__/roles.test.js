import { ROLES, ROLE_LABELS, NAV_ITEMS, isRole, ROLE_STATUS, SUBSCRIPTION_ROLES, isSubscriptionRole, getNavItems, getExtraFields } from '../lib/roles';
import '@testing-library/jest-dom/jest-globals';

describe('roles.js', () => {
  it('exports ROLES object with all roles', () => {
    expect(ROLES.ENTRENADOR).toBe('Entrenador');
    expect(ROLES.CLUB).toBe('Club');
    expect(ROLES.OJEADOR).toBe('Ojeador');
    expect(ROLES.JUGADOR).toBe('Jugador');
    expect(ROLES.AFICIONADO).toBe('Aficionado');
    expect(ROLES.ADMIN).toBe('Admin');
  });

  it('exports ROLE_LABELS for all roles', () => {
    expect(ROLE_LABELS.Entrenador).toBe('Entrenador');
    expect(ROLE_LABELS.Ojeador).toBe('Ojeador');
    expect(ROLE_LABELS.Jugador).toBe('Jugador');
    expect(ROLE_LABELS.Aficionado).toBe('Aficionado');
    expect(ROLE_LABELS.Admin).toBe('Administrador');
  });

  it('exports ROLE_STATUS constants', () => {
    expect(ROLE_STATUS.NONE).toBe('none');
    expect(ROLE_STATUS.PENDING).toBe('pending');
    expect(ROLE_STATUS.APPROVED).toBe('approved');
    expect(ROLE_STATUS.REJECTED).toBe('rejected');
  });

  it('exports SUBSCRIPTION_ROLES', () => {
    expect(SUBSCRIPTION_ROLES).toContain('Entrenador');
    expect(SUBSCRIPTION_ROLES).toContain('Club');
    expect(SUBSCRIPTION_ROLES).toContain('Ojeador');
    expect(SUBSCRIPTION_ROLES).toContain('Jugador');
    expect(SUBSCRIPTION_ROLES).not.toContain('Aficionado');
    expect(SUBSCRIPTION_ROLES).not.toContain('Admin');
  });

  it('exports NAV_ITEMS for all roles', () => {
    expect(NAV_ITEMS.Entrenador).toBeDefined();
    expect(NAV_ITEMS.Club).toBeDefined();
    expect(NAV_ITEMS.Ojeador).toBeDefined();
    expect(NAV_ITEMS.Jugador).toBeDefined();
    expect(NAV_ITEMS.Aficionado).toBeDefined();
    expect(NAV_ITEMS.Admin).toBeDefined();
  });

  it('isRole validates correct roles', () => {
    expect(isRole('Entrenador')).toBe(true);
    expect(isRole('Club')).toBe(true);
    expect(isRole('Ojeador')).toBe(true);
    expect(isRole('Jugador')).toBe(true);
    expect(isRole('Aficionado')).toBe(true);
    expect(isRole('Admin')).toBe(true);
    expect(isRole('Invalid')).toBe(false);
  });

  it('isSubscriptionRole returns correct values', () => {
    expect(isSubscriptionRole('Entrenador')).toBe(true);
    expect(isSubscriptionRole('Club')).toBe(true);
    expect(isSubscriptionRole('Ojeador')).toBe(true);
    expect(isSubscriptionRole('Jugador')).toBe(true);
    expect(isSubscriptionRole('Aficionado')).toBe(false);
    expect(isSubscriptionRole('Admin')).toBe(false);
  });

  it('getNavItems returns correct nav for role', () => {
    expect(getNavItems('Aficionado')).toBe(NAV_ITEMS.Aficionado);
    expect(getNavItems('UnknownRole')).toBe(NAV_ITEMS.Aficionado);
  });

  it('getExtraFields returns correct fields per role', () => {
    expect(getExtraFields('Entrenador')).toEqual(['license', 'experience_years', 'preferred_formation']);
    expect(getExtraFields('Club')).toEqual(['club_name', 'position_in_club']);
    expect(getExtraFields('Ojeador')).toEqual(['scout_zone', 'preferred_categories', 'scout_experience']);
    expect(getExtraFields('Jugador')).toEqual(['current_team_id', 'position', 'birth_year', 'dominant_foot', 'height', 'weight']);
    expect(getExtraFields('Aficionado')).toEqual([]);
    expect(getExtraFields('Admin')).toEqual([]);
  });

  it('NAV_ITEMS includes Dashboard for all roles', () => {
    Object.values(NAV_ITEMS).forEach((items) => {
      expect(items.some((item) => item.href === '/dashboard')).toBe(true);
    });
  });

  it('NAV_ITEMS includes Mi Perfil for all roles', () => {
    Object.values(NAV_ITEMS).forEach((items) => {
      expect(items.some((item) => item.href === '/perfil')).toBe(true);
    });
  });

  it('NAV_ITEMS for Entrenador includes Mi Equipo', () => {
    expect(NAV_ITEMS.Entrenador.some((i) => i.href === '/equipos' && i.label === 'Mi Equipo')).toBe(true);
  });

  it('NAV_ITEMS for Ojeador includes Scouting', () => {
    expect(NAV_ITEMS.Ojeador.some((i) => i.href === '/scouting')).toBe(true);
  });

  it('NAV_ITEMS for Admin includes Solicitudes', () => {
    expect(NAV_ITEMS.Admin.some((i) => i.href.includes('solicitudes'))).toBe(true);
  });

  it('NAV_ITEMS for Club includes Mi Club', () => {
    expect(NAV_ITEMS.Club.some((i) => i.href === '/clubs')).toBe(true);
  });

  it('NAV_ITEMS for Jugador includes Mi Ficha', () => {
    expect(NAV_ITEMS.Jugador.some((i) => i.href === '/dashboard-jugador' && i.label === 'Mi Ficha')).toBe(true);
  });

  it('NAV_ITEMS for Aficionado has limited entries', () => {
    expect(NAV_ITEMS.Aficionado.length).toBeLessThanOrEqual(8);
  });

  it('isRole rejects empty string', () => {
    expect(isRole('')).toBe(false);
  });

  it('isRole rejects null', () => {
    expect(isRole(null)).toBe(false);
  });
});
