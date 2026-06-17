# Guía de desarrollo

## Estado actual: MVP completo + Infraestructura ✅

Todos los sprints completados. La plataforma incluye auth, CRUD de equipos/jugadores, partidos con eventos en vivo, dashboards estadísticos y perfiles de scouting. Infraestructura: ESLint, Prettier, Jest, GitHub Actions CI.

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
| `/partidos` | Lista de partidos | Entrenador, Club, Scout, Admin |
| `/partidos/[id]` | Detalle + eventos en vivo | Entrenador, Club, Scout, Admin |
| `/dashboard-jugador` | Estadísticas de jugador | Todos |
| `/dashboard-equipo` | Estadísticas de equipo | Entrenador, Club, Admin |
| `/jugador/[id]` | Perfil scouting del jugador | Todos |
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

---

## Comandos de desarrollo

```bash
npm run dev          # Servidor de desarrollo (puerto 3000)
npm run build        # Build de producción
npm run lint         # Verificar linting (ESLint)
npm run format       # Formatear código (Prettier)
npm run format:check # Verificar formato sin cambiar
npm test             # Ejecutar tests (Jest)
npm run test:coverage # Tests con cobertura
```

## GitHub Actions CI

El workflow `.github/workflows/ci.yml` ejecuta 4 jobs en push/PR a master:

1. **Lint**: `npm run lint`
2. **Format**: `npm run format:check`
3. **Tests**: `npm test`
4. **Build**: `npm run build`

### Secrets requeridos en GitHub

Para que el build funcione en CI, añade estos secrets en Settings > Secrets:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```
