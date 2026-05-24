# Frontend (Next.js)

Este directorio contiene la aplicación frontend del MVP.

Requisitos:
- Node.js 18+ y npm

Instalación y ejecución en local:

```bash
cd frontend
npm install
npm run dev
```

El servidor de desarrollo arranca en http://localhost:3000 por defecto.

Variables de entorno:
- Copia `frontend/.env.local.example` a `frontend/.env.local`.
- Rellena `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Siguientes pasos (Sprint 1):
- Conectar Supabase para autenticación.
- Añadir páginas de login/registro.
- Crear estructura de componentes y layouts mobile-first.
