# Guía de desarrollo

## Estado actual: Sprint 2 completado

La autenticación, protección por roles, CRUD de equipos/jugadores y storage están implementadas.

## Setup rápido

### 1. Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.local.example .env.local  # Añadir credenciales de Supabase
npm run dev
```

El servidor de desarrollo estará en `http://localhost:3000`.

### 2. Supabase

1. Crear proyecto en https://app.supabase.com
2. Ir al SQL Editor y ejecutar en orden:
   - `supabase/schema.sql` — Crea las 7 tablas
   - `supabase/rls_policies.sql` — Activa Row Level Security
   - `supabase/storage_setup.sql` — Crea bucket "media" para fotos
3. Copiar la URL y la anon key del proyecto a `frontend/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Backend Python (opcional, en desarrollo)

```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py --nombre "Tu nombre"
```

## Páginas disponibles

| Ruta | Descripción | Roles permitidos |
|---|---|---|
| `/` | Landing page | Público |
| `/login` | Inicio de sesión | Público |
| `/register` | Registro con rol | Público |
| `/forgot-password` | Recuperar contraseña | Público |
| `/reset-password` | Nueva contraseña | Público (con token) |
| `/dashboard` | Panel principal | Autenticados |
| `/equipos` | Gestión de equipos | Entrenador, Club, Admin |
| `/jugadores` | Gestión de jugadores | Todos |
| `/scouting` | Búsqueda de jugadores | Scout, Admin |
| `/admin` | Gestión de usuarios | Admin |

## Estructura de permisos (RLS)

Las políticas de Supabase controlan el acceso a la base de datos:

- **users**: Cada usuario ve/edita su propio perfil. Admin puede gestionar todos.
- **clubs/teams**: Entrenadores y clubs crean. Solo el propietario o admin edita.
- **players**: Entrenadores y clubs crean. Entrenador del equipo o admin edita.
- **matches/events**: Entrenadores y clubs crean. Entrenador del equipo o admin edita.
- **player_stats**: Solo lectura para todos. Admin puede modificar.

## Próximos pasos (Sprint 3)

- Crear modelo de partidos
- CRUD de partidos
- Registro de eventos en vivo
