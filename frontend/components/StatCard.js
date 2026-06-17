export function StatCard({ label, value, color = '#1a1a2e' }) {
  return (
    <div
      style={{
        background: '#fff',
        padding: 16,
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: 28, fontWeight: 700, color, margin: 0 }}>{value}</p>
      <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{label}</p>
    </div>
  );
}
