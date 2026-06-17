# AmateurBaleares

Plataforma web de estadísticas y scouting de fútbol amateur para clubes, entrenadores y scouts en Baleares.

## Stack tecnológico

- **Frontend**: Next.js 13 (Pages Router) + React 18
- **Backend**: Python 3.10+ (FastAPI — en desarrollo)
- **Base de datos**: PostgreSQL vía Supabase
- **Auth**: Supabase Auth
- **Deploy**: Vercel (planeado)

## Estructura del proyecto

```
AmateurBaleares/
├── frontend/                  # Aplicación Next.js
│   ├── components/            # Componentes reutilizables
│   │   └── Layout.js          # Layout con sidebar
│   ├── lib/                   # Utilidades
│   │   ├── supabaseClient.js  # Cliente Supabase
│   │   ├── roles.js           # Constantes de roles y permisos
│   │   └── withAuth.js        # HOC protección de rutas
│   ├── pages/                 # Páginas (Pages Router)
│   │   ├── index.js           # Landing page
│   │   ├── login.js           # Inicio de sesión
│   │   ├── register.js        # Registro con selección de rol
│   │   ├── forgot-password.js # Recuperación de contraseña
│   │   ├── reset-password.js  # Nueva contraseña
│   │   ├── dashboard.js       # Panel principal (protegido)
│   │   ├── equipos.js         # Gestión de equipos
│   │   ├── jugadores.js       # Gestión de jugadores
│   │   ├── scouting.js        # Búsqueda de jugadores (Scout)
│   │   └── admin.js           # Administración de usuarios (Admin)
│   └── .env.local             # Variables de entorno (no commitear)
├── src/                       # Backend Python
│   └── app.py                 # CLI placeholder
├── tests/                     # Tests Python
├── supabase/
│   ├── schema.sql             # Esquema de base de datos (7 tablas)
│   └── rls_policies.sql       # Políticas Row Level Security
├── BACKLOG.md                 # Backlog por sprints
├── PRODUCT_ROADMAP.md         # Roadmap del producto
└── DEV_SETUP.md               # Guía de desarrollo
```

## Roles soportados

| Rol | Permisos |
|---|---|
| **Entrenador** | Gestionar sus equipos y jugadores, crear partidos |
| **Club** | Gestionar equipos y jugadores del club |
| **Scout** | Buscar y evaluar jugadores |
| **Admin** | Acceso completo a todas las funcionalidades |

## Desarrollo local

### Requisitos

- Node.js 18+
- Python 3.10+
- Cuenta en [Supabase](https://app.supabase.com)

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local  # Configurar credenciales de Supabase
npm run dev                        # http://localhost:3000
```

### Backend (Python)

```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt
python main.py
```

### Base de datos

1. Crear proyecto en Supabase
2. Ejecutar `supabase/schema.sql` en el SQL Editor
3. Ejecutar `supabase/rls_policies.sql` para activar RLS
4. Ejecutar `supabase/storage_setup.sql` para bucket de fotos
5. Copiar URL y anon key a `frontend/.env.local`

## Comandos útiles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en puerto 3000 |
| `npm run build` | Build de producción |
| `npm run start` | Iniciar en producción |
| `python main.py` | Ejecutar CLI Python |

## Estado del proyecto

- [x] Sprint 1: Setup y autenticación completa
- [x] Sprint 2: Gestión avanzada de equipos y jugadores
- [x] Sprint 3: Partidos y eventos en vivo
- [x] Sprint 4: Estadísticas y dashboards
- [x] Sprint 5: Perfil scouting y validación
