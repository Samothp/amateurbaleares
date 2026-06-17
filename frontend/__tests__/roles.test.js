import { ROLES, ROLE_LABELS, NAV_ITEMS, isRole } from '../lib/roles';
import '@testing-library/jest-dom/jest-globals';

describe('roles.js', () => {
  it('exports ROLES object with all roles', () => {
    expect(ROLES.ENTRENADOR).toBe('Entrenador');
    expect(ROLES.CLUB).toBe('Club');
    expect(ROLES.SCOUT).toBe('Scout');
    expect(ROLES.ADMIN).toBe('Admin');
  });

  it('exports ROLE_LABELS for all roles', () => {
    expect(ROLE_LABELS.Entrenador).toBe('Entrenador');
    expect(ROLE_LABELS.Admin).toBe('Administrador');
  });

  it('exports NAV_ITEMS for all roles', () => {
    expect(NAV_ITEMS.Entrenador).toBeDefined();
    expect(NAV_ITEMS.Club).toBeDefined();
    expect(NAV_ITEMS.Scout).toBeDefined();
    expect(NAV_ITEMS.Admin).toBeDefined();
  });

  it('isRole validates correct roles', () => {
    expect(isRole('Entrenador')).toBe(true);
    expect(isRole('Club')).toBe(true);
    expect(isRole('Invalid')).toBe(false);
  });

  it('NAV_ITEMS includes Dashboard for all roles', () => {
    Object.values(NAV_ITEMS).forEach((items) => {
      expect(items.some((item) => item.href === '/dashboard')).toBe(true);
    });
  });
});
