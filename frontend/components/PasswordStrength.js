import { getPasswordStrength } from '../lib/auth';

export function PasswordStrength({ password }) {
  const { score, label, color } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div style={{ marginTop: 6 }}>
      <div
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={5}
        aria-label={`Seguridad de la contraseña: ${label}`}
        style={{ display: 'flex', gap: 4 }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i < score ? color : '#e2e8f0',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: 12, color, marginTop: 4 }}>{label}</p>
    </div>
  );
}
