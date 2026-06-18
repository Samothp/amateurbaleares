# Guía de desarrollo

## Estado actual: Fase 6 - Infrastructure ✅

Plataforma completa: auth, CRUD equipos/jugadores, partidos con eventos en vivo, dashboards, perfiles scouting, componentes reutilizables, tests, CI/CD.

## Requisitos previos

- Node.js 20+ (verificar con `node -v`)
- npm 9+
- Cuenta de Supabase (https://app.supabase.com)

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

### 3. Google OAuth (opcional)

1. Configurar proveedor Google en Supabase Dashboard → Authentication → Providers → Google
2. Añadir Client ID y Client Secret
3. Añadir URI de redirección: `https://tu-proyecto.supabase.co/auth/v1/callback`

### 4. Backend Python (opcional, en desarrollo)

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
| `/login` | Inicio de sesión (Google OAuth + email) | Público |
| `/register` | Registro (Google OAuth + email) | Público |
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
| `/clubs` | Gestión de clubs | Admin |
| `/perfil` | Editar perfil | Autenticados |
| `/admin` | Gestión de usuarios | Admin |

## Estructura de permisos (RLS)

Las políticas de Supabase controlan el acceso a la base de datos:

- **users**: Cada usuario ve/edita su propio perfil. Admin puede gestionar todos.
- **clubs/teams**: Entrenadores y clubs crean. Solo el propietario o admin edita.
- **players**: Entrenadores y clubs crean. Entrenador del equipo o admin edita.
- **matches/events**: Entrenadores y clubs crean. Entrenador del equipo o admin edita.
- **player_stats**: Solo lectura para todos. Admin puede modificar.

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

## Arquitectura

### Componentes reutilizables (`components/`)
- `Layout.js` — Sidebar + responsive con hamburger menu
- `FormField.js` — Campo de formulario con validación
- `Button.js` — Botón con variantes
- `Card.js` — Tarjeta contenedora
- `StatCard.js` — Tarjeta de estadística
- `MessageBanner.js` — Banner de éxito/error
- `DeleteConfirm.js` — Modal de confirmación
- `SearchBar.js` — Búsqueda con debounce
- `Pagination.js` — Paginación
- `Skeleton.js` — Skeleton loading
- `PasswordStrength.js` — Indicador de fortaleza
- `GoogleLogo.js` — Logo SVG de Google

### Lib (`lib/`)
- `auth.js` — mapAuthError, getPasswordStrength
- `charts.js` — Dynamic imports de Recharts
- `stats.js` — Cálculos de estadísticas
- `roles.js` — Constantes de roles y navegación
- `useMessage.js` — Hook de mensajes auto-dismiss
- `hooks.js` — useDebounce
- `supabaseClient.js` — Cliente Supabase
- `withAuth.js` — HOC de autenticación

### Tests (`__tests__/`)
- 7 suites de test, 90+ tests
- Cobertura: auth, components, stats, roles, hooks, formfield, a11y

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
