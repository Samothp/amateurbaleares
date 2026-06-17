export function MessageBanner({ message }) {
  if (!message) return null;
  const isError = message.includes('Error');
  return (
    <p
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
