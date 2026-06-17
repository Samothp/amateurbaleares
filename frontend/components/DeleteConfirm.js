import { Button } from './Button';

export function DeleteConfirm({ name, onConfirm, onCancel }) {
  return (
    <div style={{ marginTop: 12, padding: 12, background: '#fff5f5', borderRadius: 8, border: '1px solid #ffcccc' }}>
      <p style={{ fontSize: 13, marginBottom: 8 }}>¿Eliminar "{name}"? Esta acción no se puede deshacer.</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="danger" onClick={onConfirm} style={{ padding: '6px 12px', fontSize: 13 }}>
          Sí, eliminar
        </Button>
        <Button variant="ghost" onClick={onCancel} style={{ padding: '6px 12px', fontSize: 13 }}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
