const AUTH_ERROR_MAP = {
  'Invalid login credentials': 'Email o contraseña incorrectos',
  'Email not confirmed': 'Confirma tu email antes de iniciar sesión',
  'Too many requests': 'Demasiados intentos. Espera un momento.',
  'User not found': 'No existe una cuenta con este email',
  signup_disabled: 'El registro está deshabilitado temporalmente',
  'Invalid email': 'El formato del email no es válido',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
  'User already registered': 'Ya existe una cuenta con este email',
  'Email rate limit exceeded': 'Demasiados emails enviados. Espera unos minutos.',
};

export function mapAuthError(error) {
  if (!error) return 'Error desconocido';
  if (typeof error === 'string') return AUTH_ERROR_MAP[error] || error;
  const msg = error.message || String(error);
  return AUTH_ERROR_MAP[msg] || msg;
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '#ddd' };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  const levels = [
    { label: 'Muy débil', color: '#e53e3e' },
    { label: 'Débil', color: '#ed8936' },
    { label: 'Regular', color: '#ecc94b' },
    { label: 'Buena', color: '#48bb78' },
    { label: 'Muy buena', color: '#38a169' },
    { label: 'Fuerte', color: '#2f855a' },
  ];

  return { score, ...levels[Math.min(score, levels.length - 1)] };
}
