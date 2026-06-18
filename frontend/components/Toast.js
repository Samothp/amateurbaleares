import { useEffect, useState } from 'react';

export function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const colors = {
    success: { bg: '#e0ffe0', color: '#1a7a1a', border: '#b3e6b3' },
    error: { bg: '#ffe0e0', color: '#c1121f', border: '#ffb3b3' },
    info: { bg: '#e0f0ff', color: '#1a5276', border: '#b3d9f2' },
  };

  const style = colors[type] || colors.success;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 1000,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        borderRadius: 10,
        padding: '12px 40px 12px 16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        fontSize: 14,
        fontWeight: 500,
        maxWidth: 360,
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
      }}
    >
      {message}
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onClose?.(), 300);
        }}
        aria-label="Cerrar notificación"
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'none',
          border: 'none',
          color: style.color,
          cursor: 'pointer',
          fontSize: 16,
          padding: '2px 4px',
          opacity: 0.7,
        }}
      >
        ×
      </button>
    </div>
  );
}
