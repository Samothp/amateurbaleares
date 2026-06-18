export function SearchBar({ value, onChange, placeholder = 'Buscar...' }) {
  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
  };

  return (
    <div style={{ position: 'relative', maxWidth: 400 }}>
      <span
        style={{
          position: 'absolute',
          left: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#999',
          fontSize: 14,
          pointerEvents: 'none',
        }}
      >
        &#128269;
      </span>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 12px 10px 36px',
          borderRadius: 8,
          border: '1px solid #ddd',
          fontSize: 14,
          outline: 'none',
          transition: 'border-color 0.2s',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#1a1a2e';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#ddd';
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            fontSize: 16,
            padding: '2px 4px',
          }}
        >
          x
        </button>
      )}
    </div>
  );
}

export function filterByText(items, text, fields) {
  if (!text || !text.trim()) return items;
  const lower = text.toLowerCase().trim();
  return items.filter((item) =>
    fields.some((f) => {
      const val = item[f];
      return val && String(val).toLowerCase().includes(lower);
    })
  );
}
