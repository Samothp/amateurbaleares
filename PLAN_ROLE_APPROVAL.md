# Plan: Sistema de Registro con Solicitud de Rol y Aprobación Admin

## Cambios en Roles
| Role Anterior | Role Nuevo | Descripción |
|---------------|------------|-------------|
| Entrenador | Entrenador | Requiere aprobación + suscripción |
| Club | Club | Requiere aprobación + suscripción |
| Scout | Ojeador | Requiere aprobación + suscripción |
| Admin | Admin | Solo creación manual |
| (nuevo) | Aficionado | Default, Free tier, acceso limitado |
| (nuevo) | Jugador | Requiere aprobación + suscripción, auto-vincula ficha |

## Flujo de Registro
1. Usuario se registra (email/password o Google)
2. Selecciona rol solicitado: **Club / Entrenador / Ojeador / Jugador / (ninguno = Aficionado)**
3. Si selecciona rol ≠ Aficionado → completa campos extra según rol
4. Se crea en `users` con `role = 'Aficionado'`, `requested_role = 'X'`, `role_status = 'pending'`
5. Admin recibe email notificación
6. Admin ve panel "Solicitudes pendientes" en `/admin` o `/perfil` (Admin)
7. Admin aprueba/rechaza → cambia `role = requested_role`, `role_status = 'approved'`
8. Si Entrenador: Admin asigna `coach_id` en team manualmente
9. Si Jugador: Auto-vincula a `players` por email/nombre

## Accesos por Rol

### Aficionado (Free)
- Dashboard público (ranking, comparativa, scouting readonly)
- Ver partidos, equipos, jugadores (readonly)
- NO: Crear/editar equipos, jugadores, partidos
- NO: Dashboards avanzados, eventos en vivo, scouting completo

### Roles Suscripción (Club, Entrenador, Ojeador, Jugador)
- Acceso completo según permisos actuales
- Entrenador: Mi Equipo, Dash. Equipo, Partidos (crear), Eventos en vivo
- Club: Mi Club, Equipos, Jugadores, Partidos
- Ojeador: Scouting completo, Comparativa, Ranking
- Jugador: Su ficha, stats personales, dashboard-jugador

## Campos Extra por Rol (en registro y perfil público)

| Rol | Campos |
|-----|--------|
| **Entrenador** | `license` (titulación), `experience_years`, `preferred_formation` |
| **Club** | `club_name` (existente en clubs), `position_in_club` (presidente, DD, etc) |
| **Ojeador** | `scout_zone` (zona geográfica), `preferred_categories` (array), `scout_experience` |
| **Jugador** | `current_team_id` (FK teams), `position`, `birth_year`, `dominant_foot`, `height`, `weight` |

## Tareas de Implementación

### 1. Base de Datos (Supabase)
- [ ] `supabase/add_role_approval.sql` - Migración users table
- [ ] Actualizar `rls_policies.sql` para nuevos roles y accesos

### 2. Frontend - Lib
- [ ] `lib/roles.js` - Nuevos roles, NAV_ITEMS para Aficionado, Ojeador, Jugador
- [ ] `lib/withAuth.js` - Permisos por rol (Aficionado limitado)

### 3. Frontend - Pages
- [ ] `pages/register.js` - Nuevo formulario con selector rol + campos condicionales
- [ ] `pages/perfil.js` - Botón "Solicitar cambio de rol" + campos extra
- [ ] `pages/admin.js` - Panel "Solicitudes pendientes" con approve/reject + email
- [ ] `pages/dashboard.js` - Vista Aficionado limitada

### 4. Frontend - Components
- [ ] `components/RoleRequestForm.js` - Componente reutilizable para selector rol + campos

### 5. Backend/Email (opcional, Supabase Edge Functions)
- [ ] Edge Function para enviar email a Admin en nueva solicitud

### 6. Tests
- [ ] Actualizar `roles.test.js` y `auth.test.js`

### 7. Limpieza
- [ ] Eliminar "Crear Equipo" de `pages/equipos.js` (ya no necesario)
- [ ] Eliminar "Crear Equipo" del sidebar/nav

## Orden de Ejecución
1. SQL migrations
2. lib/roles.js + withAuth.js
3. register.js + RoleRequestForm component
4. perfil.js (solicitud cambio rol)
5. admin.js (panel aprobaciones)
6. RLS policies
7. Tests
8. Limpieza UI