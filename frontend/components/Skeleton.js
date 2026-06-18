export function Skeleton({ width = '100%', height = 16, borderRadius = 4, style = {} }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ lines = 3, height = 16, gap = 10, style = {} }) {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando..."
      style={{
        background: '#fff',
        padding: 20,
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        ...style,
      }}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={i === 0 ? height + 2 : height}
          width={i === lines - 1 ? '60%' : '100%'}
          style={{ marginBottom: i < lines - 1 ? gap : 0 }}
        />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 4, style = {} }) {
  return (
    <div style={{ display: 'grid', gap: 16, ...style }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={2} height={14} />
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div>
      <Skeleton height={28} width={200} style={{ marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} lines={2} height={20} />
        ))}
      </div>
      <SkeletonCard lines={1} height={300} />
    </div>
  );
}

export function SkeletonStyles() {
  return (
    <style>{`
      @keyframes skeleton-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  );
}
