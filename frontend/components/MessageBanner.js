export function MessageBanner({ message }) {
  if (!message) return null;
  const isError = message.toLowerCase().includes('error');
  return (
    <p
      role="alert"
      style={{
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        background: isError ? '#ffe0e0' : '#e0ffe0',
        color: isError ? 'crimson' : 'green',
        fontSize: 14,
      }}
    >
      {message}
    </p>
  );
}
