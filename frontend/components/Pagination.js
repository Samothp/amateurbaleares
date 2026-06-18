export function Pagination({ currentPage, totalItems, pageSize, onPageChange }) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  const btnBase = {
    padding: '6px 12px',
    border: '1px solid #ddd',
    background: '#fff',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    minWidth: 36,
    textAlign: 'center',
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      <span style={{ fontSize: 13, color: '#666' }}>
        Mostrando {start}-{end} de {totalItems}
      </span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            ...btnBase,
            opacity: currentPage === 1 ? 0.4 : 1,
            cursor: currentPage === 1 ? 'default' : 'pointer',
          }}
        >
          &lt;
        </button>
        {pages.map((page, idx) =>
          page === '...' ? (
            <span key={`dots-${idx}`} style={{ padding: '0 4px', color: '#999' }}>
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              style={{
                ...btnBase,
                background: page === currentPage ? '#1a1a2e' : '#fff',
                color: page === currentPage ? '#fff' : '#333',
                borderColor: page === currentPage ? '#1a1a2e' : '#ddd',
                fontWeight: page === currentPage ? 600 : 400,
              }}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            ...btnBase,
            opacity: currentPage === totalPages ? 0.4 : 1,
            cursor: currentPage === totalPages ? 'default' : 'pointer',
          }}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

export function paginate(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
