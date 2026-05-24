# Sprint 1 - Setup y autenticación

Objetivo: preparar el entorno frontend y la base de datos para implementar autenticación.

Pasos rápidos para empezar localmente:

1. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

2. Supabase
- Crear un proyecto en https://app.supabase.com
- Crear una base de datos y ejecutar `supabase/schema.sql` desde la sección SQL editor (o usar psql)

3. Conexión
- Añadir variables de entorno en `frontend/.env.local` con la URL y la KEY de Supabase.
- Implementar autenticación con Supabase Auth (register/login) usando la SDK de Supabase.

Próximos pasos programables (yo puedo implementarlos si confirmas):
- Añadir páginas `auth/login` y `auth/register` en `frontend`.
- Conectar Supabase Auth y proteger rutas.
- Crear API routes para sincronizar datos si es necesario.
