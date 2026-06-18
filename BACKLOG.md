# Backlog Inicial

## Objetivo
Crear el MVP básico de la plataforma de estadísticas y scouting de fútbol amateur, con foco en mínimo esfuerzo, validación temprana y experiencia móvil.

---

## Sprint 1: Setup y autenticación ✅ COMPLETADO

1. ✅ Configurar el entorno de desarrollo frontend con Next.js.
2. ✅ Configurar Supabase y conectar la base de datos PostgreSQL.
3. ✅ Definir el esquema inicial de usuarios en Supabase.
4. ✅ Implementar registro y login con roles: entrenador, club, scout, admin.
5. ✅ Crear la página de inicio de sesión y registro.
6. ✅ Protección de rutas por rol (withAuth HOC).
7. ✅ Layout con sidebar y navegación condicional.
8. ✅ Recuperación de contraseña (forgot/reset password).
9. ✅ Políticas RLS para todas las tablas.
10. ✅ Páginas: dashboard, equipos, jugadores, scouting, admin.

---

## Sprint 2: Gestión de equipos y jugadores ✅ COMPLETADO

1. ✅ Crear la página de equipos.
2. ✅ Implementar edición de equipos (nombre, categoría).
3. ✅ Implementar eliminación de equipos con confirmación.
4. ✅ Crear la página de jugadores.
5. ✅ Implementar edición de jugadores (nombre, edad, posición, altura, pierna dominante, dorsal).
6. ✅ Implementar eliminación de jugadores con confirmación.
7. ✅ Vincular jugadores a equipos (select de team_id en formulario).
8. ✅ Subir fotos de escudo y jugador (Supabase Storage bucket "media").
9. ✅ SQL de storage: `supabase/storage_setup.sql`.

---

## Sprint 3: Gestión de partidos y eventos ✅ COMPLETADO

1. ✅ Crear el modelo de partidos en la base de datos.
2. ✅ Implementar creación de un partido (equipo, rival, fecha, resultado).
3. ✅ Crear detalle de partido con eventos.
4. ✅ Implementar registro de eventos en vivo (11 tipos de eventos).
5. ✅ Diseño optimizado para registrar eventos rápido (formulario compacto).
6. ✅ Navegación "Partidos" añadida al sidebar.

---

## Sprint 4: Estadísticas y dashboards ✅ COMPLETADO

1. ✅ Calcular estadísticas básicas a partir de eventos (goles, asistencias, minutos, tiros, faltas, tarjetas, etc).
2. ✅ Crear un dashboard de jugador con gráficos de evolución por minuto.
3. ✅ Crear un dashboard de equipo con gráficos de eventos por tipo, por tramo temporal, goleadores y asistentes.
4. ✅ Añadir visualización de evolución temporal y comparativas simples.
5. ✅ Instalada librería Recharts para gráficos.
6. ✅ Navegación "Dash. Jugador" y "Dash. Equipo" en sidebar.

---

## Sprint 5: Perfil scouting y validación ✅ COMPLETADO

1. ✅ Crear páginas de perfil de jugador con fortalezas y debilidades (análisis automático).
2. ✅ Añadir historial de rendimiento y estadísticas acumuladas.
3. ✅ Gráfico radar de rendimiento del jugador.
4. ✅ Enlace desde scouting a perfil de jugador.
5. ✅ Función `analyzeStrengthsWeaknesses` en stats.js.
6. ✅ Funcionalidad de demo lista para mostrar a entrenadores.

---

## Tareas de infraestructura y documentación

- ✅ `README.md` con instrucciones de desarrollo local.
- ✅ Documentar el esquema de base de datos (schema.sql + rls_policies.sql).
- ✅ Configurar `next.config.js` con headers de seguridad y dominios de imágenes.
- ✅ Crear `_app.js` con error boundary y font loading.
- ✅ Crear páginas 404 y 500 personalizadas.
- ✅ Librería de componentes reutilizables (Card, Button, StatCard, etc).
- ✅ Layout responsive con sidebar colapsable en móvil.
- ✅ Seguridad: quitar auto-selección de rol Admin en registro.
- ✅ Corregir RLS: INSERT policy para users, storage ownership.
- Configurar despliegue en Vercel.
- Configurar GitHub Actions para pruebas básicas si es necesario.

---

## Mejoras implementadas (post-MVP)

### Seguridad
- ✅ Rol Admin no seleccionable en registro público
- ✅ RLS: INSERT policy para tabla users
- ✅ Storage policies corregidas
- ✅ Headers de seguridad (X-Frame-Options, X-Content-Type-Options)

### Componentes y UX
- ✅ Librería de componentes: Card, Button, StatCard, MessageBanner, DeleteConfirm
- ✅ Layout responsive con sidebar colapsable en móvil
- ✅ Error Boundary global, páginas 404 y 500
- ✅ Font Inter cargada correctamente
- ✅ `_app.js` con providers y metadata

### Rendimiento
- ✅ Dynamic imports para Recharts (code splitting)
- ✅ Debouncing en búsquedas (300ms)
- ✅ `next.config.js` con dominios de imágenes Supabase

### Funcionalidad
- ✅ Página de perfil de usuario (editar nombre, cambiar contraseña)
- ✅ Gestión de clubs con CRUD
- ✅ Supabase Realtime para eventos en vivo
- ✅ Navegación actualizada con todas las páginas

### Fase E: Infraestructura
- ✅ ESLint 8 + next/core-web-vitals (0 errores, warnings informativos)
- ✅ Prettier: formato consistente en 32 archivos
- ✅ Jest 29 + React Testing Library: 25 tests (stats, components, roles)
- ✅ GitHub Actions CI: lint, format, test, build en push/PR a master
- ✅ Scripts npm: lint, format, format:check, test, test:coverage

### Fase 1-3: Bugs, Seguridad, UX
- ✅ 6 bugs críticos corregidos (setTimeline, Button spread, doble navegación, registro redirect, MessageBanner case-sensitive, forgot-password errors)
- ✅ 6 mejoras de seguridad (Admin solo por admin, confirmación cambio rol, select explícito jugador/[id], validación token reset, validación uploads MIME+5MB)
- ✅ 10 mejoras UX (dynamic import dashboard-equipo, landing page real, edición partidos, búsqueda+paginación, hook useMessage, perfil responsive, admin error handling)

### Fase 4: Accesibilidad ✅ COMPLETADO
- ✅ Focus ring global (`_app.js`) para inputs, selects y botones con `:focus-visible`
- ✅ FormField: focus ring con box-shadow (2px → 3px via global)
- ✅ SearchBar: `aria-label` en input y botón borrar
- ✅ Pagination: `aria-label` en cada botón, `aria-current="page"` en página activa, `<nav aria-label="Paginación">`
- ✅ Layout: `role="dialog"`, `aria-modal`, `aria-labelledby` en modal logout; `aria-label` + `aria-expanded` en hamburger; `<nav aria-label="Menú principal">`
- ✅ MessageBanner: `role="alert"` para anuncios dinámicos
- ✅ PasswordStrength: `role="progressbar"` con `aria-valuenow/min/max`
- ✅ Skeleton: `aria-hidden="true"` en shimmer; `aria-busy="true"` + `aria-label="Cargando..."` en SkeletonCard

### Fase 5: Performance ✅ COMPLETADO
- ✅ `charts.js`: Punto de entrada único para todos los componentes Recharts (dynamic imports consolidados)
- ✅ `dashboard-equipo.js`: Importa desde `charts.js` en lugar de recharts directamente (eliminados 11 dynamic imports individuales)
- ✅ `jugador/[id].js`: Convertido de import estático de recharts a dynamic import → **96.8 kB → 2.69 kB** First Load JS
- ✅ `stats.js`: `calculatePlayerStats` y `calculateTeamStats` optimizados con un solo loop en lugar de N filters
- ✅ Skeleton keyframes movidos a CSS global en `_app.js` (eliminado `<SkeletonStyles />` de 10 páginas)
- ✅ `GoogleLogo.js`: Componente compartido para el logo SVG de Google (usado en login y register)

### Fase 6: Infrastructure ✅ COMPLETADO
- ✅ CI workflow: Node 18 → 20
- ✅ `.nvmrc` creado con Node 20
- ✅ `public/`: favicon.svg + robots.txt
- ✅ `.gitignore` actualizado (OS files, build artifacts, .ico)
- ✅ PasswordStrength: check de minúsculas añadido (5 niveles: Muy débil → Fuerte)
- ✅ `DEV_SETUP.md` reescrito con estado actual completo
- ✅ Tests: 78 → 97 (8 suites: auth, components, stats, roles, hooks, formfield, deleteconfirm, a11y)
- ✅ Tests a11y: GoogleLogo, SearchBar, Pagination, Skeleton
- ✅ Auth tests actualizados para nuevo scoring de PasswordStrength

### Fase 7: Completar Roadmap ✅ COMPLETADO
- ✅ Equipos: campos `liga` y `ciudad` añadidos (formulario, display, búsqueda)
- ✅ Partidos: alineación con checkboxes de jugadores (usa columna `lineup jsonb` existente)
- ✅ `/comparativa`: Comparativa side-by-side de dos jugadores (radar + bar chart + tabla)
- ✅ `/ranking`: Ranking global con filtros por equipo y tipo de estadística
- ✅ Navegación actualizada para todos los roles (Comparativa + Ranking)

### Fase 8: UX Pre-lanzamiento ✅ COMPLETADO
- ✅ Onboarding: Checklist de 3 pasos en dashboard para nuevos usuarios (crear equipo → jugadores → partido)
- ✅ Toast: Componente de notificación temporal con auto-dismiss (3s), animación slide-in, variantes success/error/info
- ✅ Empty states: Botones de acción en páginas vacías (jugadores, partidos, scouting)
- ✅ Dashboard mejorado: Stats rápidos (equipos/jugadores/partidos), botones por rol, siguiente paso contextual
- ✅ Mobile: CSS `.mobile-fullscreen-form` para forms a pantalla completa en móvil
- ✅ Toast integrado en: equipos, jugadores, partidos, clubs, admin (reemplaza mensajes estáticos)

### Fase 8b: Dashboard Rediseñado ✅ COMPLETADO
- ✅ Eliminada tarjeta Email/Rol redundante
- ✅ Sección "Últimos resultados" con 3 partidos recientes (resultado + fecha)
- ✅ Sección "Próximos partidos" con 3 partidos programados
- ✅ Tarjetas "Mis Equipos" con conteo de jugadores y W/D/L
- ✅ Quick actions con iconos, descripción y estilo contextual por rol
- ✅ Build y tests pasan (97 tests)

---

### Fase 9: Importación de datos de jugadores ✅ COMPLETADO
- ✅ Scraper de resultados-futbol.com: Parser HTML con BeautifulSoup para extraer plantillas (nombre, posición, dorsal, edad, altura)
- ✅ Mapeo de 17 equipos de Tercera Federación Grupo 11 a slugs de resultados-futbol.com
- ✅ Importación de 132 jugadores para 4 equipos: RCD Mallorca B (33), Felanitx (23), Collerense (37), Alcudia (39)
- ✅ Importador Supabase con upsert (evita duplicados)
- ✅ Archivos: `src/scraper/besoccer_scraper.py`, `src/scraper/player_importer.py`, `players_seed.json`
- ⚠️ 13 equipos restantes requieren datos manuales (sitios usan JavaScript rendering)

### Fase 10: Partidos - Jornadas y Selector de Rival ✅ COMPLETADO
- ✅ Columna `jornada` en tabla matches (schema + SQL migration)
- ✅ Campo rival cambiado de texto libre a selector de equipo (FK `opponent_team_id`)
- ✅ Partidos agrupados por jornada con headers colapsables
- ✅ Tarjetas de partido muestran estadísticas calculadas (goles, asistencias, faltas, tarjetas)
- ✅ Formulario actualizado con campo jornada y selectores para local y rival
- ✅ Build y tests pasan (97 tests)

---

## Ideas futuras (post-MVP)

- Implementar resúmenes automáticos de partido con IA.
- Añadir recomendaciones tácticas.
- Crear scouting inteligente y perfiles premium.
- Añadir análisis de video y clips automáticos.
- Generar planes de monetización y modelos de suscripción.
