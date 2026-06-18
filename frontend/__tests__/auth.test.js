import { mapAuthError, getPasswordStrength } from '../lib/auth';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';
import { PasswordStrength } from '../components/PasswordStrength';

describe('mapAuthError', () => {
  it('maps Invalid login credentials', () => {
    expect(mapAuthError({ message: 'Invalid login credentials' })).toBe('Email o contraseña incorrectos');
  });

  it('maps Email not confirmed', () => {
    expect(mapAuthError({ message: 'Email not confirmed' })).toBe('Confirma tu email antes de iniciar sesión');
  });

  it('maps Too many requests', () => {
    expect(mapAuthError({ message: 'Too many requests' })).toBe('Demasiados intentos. Espera un momento.');
  });

  it('maps User not found', () => {
    expect(mapAuthError({ message: 'User not found' })).toBe('No existe una cuenta con este email');
  });

  it('maps signup_disabled', () => {
    expect(mapAuthError({ message: 'signup_disabled' })).toBe('El registro está deshabilitado temporalmente');
  });

  it('maps User already registered', () => {
    expect(mapAuthError({ message: 'User already registered' })).toBe('Ya existe una cuenta con este email');
  });

  it('returns original message for unknown errors', () => {
    expect(mapAuthError({ message: 'Something weird' })).toBe('Something weird');
  });

  it('handles null error', () => {
    expect(mapAuthError(null)).toBe('Error desconocido');
  });

  it('handles undefined error', () => {
    expect(mapAuthError(undefined)).toBe('Error desconocido');
  });

  it('passes through unknown string errors', () => {
    expect(mapAuthError('string error')).toBe('string error');
  });
});

describe('getPasswordStrength', () => {
  it('returns score 0 for empty password', () => {
    const result = getPasswordStrength('');
    expect(result.score).toBe(0);
  });

  it('returns score 0 for null', () => {
    const result = getPasswordStrength(null);
    expect(result.score).toBe(0);
  });

  it('scores 1 for short lowercase password', () => {
    const result = getPasswordStrength('abc');
    expect(result.score).toBe(1);
  });

  it('scores 1 for 6+ character lowercase', () => {
    const result = getPasswordStrength('abcdef');
    expect(result.score).toBe(2);
  });

  it('scores 2 for 8+ character lowercase', () => {
    const result = getPasswordStrength('abcdefgh');
    expect(result.score).toBe(3);
  });

  it('scores 3 for 8+ with uppercase', () => {
    const result = getPasswordStrength('Abcdefgh');
    expect(result.score).toBe(4);
  });

  it('scores 4 for 8+ with uppercase and number', () => {
    const result = getPasswordStrength('Abcdef1g');
    expect(result.score).toBe(5);
  });

  it('includes label and color', () => {
    const result = getPasswordStrength('Abc1');
    expect(result).toHaveProperty('label');
    expect(result).toHaveProperty('color');
  });

  it('returns Débil for short lowercase password', () => {
    const result = getPasswordStrength('a');
    expect(result.label).toBe('Débil');
    expect(result.color).toBe('#ed8936');
  });

  it('returns Fuerte for strong password', () => {
    const result = getPasswordStrength('Abcdef1g!');
    expect(result.label).toBe('Fuerte');
    expect(result.color).toBe('#2f855a');
  });
});

describe('PasswordStrength component', () => {
  it('renders nothing for empty password', () => {
    const { container } = render(<PasswordStrength password="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders strength bar for non-empty password', () => {
    render(<PasswordStrength password="abc" />);
    expect(screen.getByText('Débil')).toBeInTheDocument();
  });

  it('shows Fuerte for strong password', () => {
    render(<PasswordStrength password="Abcdef1g!" />);
    expect(screen.getByText('Fuerte')).toBeInTheDocument();
  });

  it('renders 5 segments', () => {
    const { container } = render(<PasswordStrength password="test" />);
    const segments = container.querySelectorAll('[style*="height: 4px"]');
    expect(segments.length).toBe(5);
  });
});
