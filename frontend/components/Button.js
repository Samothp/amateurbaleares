const VARIANTS = {
  primary: { background: '#1a1a2e', color: '#fff' },
  danger: { background: '#ffe0e0', color: 'crimson' },
  ghost: { background: 'transparent', color: '#666', border: '1px solid #ddd' },
  success: { background: '#2d6a4f', color: '#fff' },
};

export function Button({ variant = 'primary', children, style: overrideStyle, ...props }) {
  const { style: propStyle, ...restProps } = props;
  return (
    <button
      style={{
        padding: '10px 20px',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 500,
        ...VARIANTS[variant],
        ...overrideStyle,
        ...propStyle,
      }}
      {...restProps}
    >
      {children}
    </button>
  );
}
