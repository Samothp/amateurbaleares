# Plan de Mejoras del Producto

> Priorizado por impacto y esfuerzo. Para atacar después del sistema de roles con aprobación Admin.

---

## Estado actual del producto

**Fortalezas:**
- ✅ MVP completo con 104 tests pasando
- ✅ Auth + Roles (Aficionado/Club/Entrenador/Ojeador/Jugador/Admin) con RLS
- ✅ CRUD equipos (solo edición), jugadores, partidos + eventos en vivo
- ✅ Dashboards (jugador, equipo) con Recharts
- ✅ Scouting + comparativa + ranking
- ✅ Deploy Vercel + Analytics + Speed Insights
- ✅ CI/CD completo (lint, format, test, build)
- ✅ Importación de 132 jugadores + 306 partidos
- ✅ Sistema de solicitud de rol con aprobación Admin

**Gaps:**
- ❌ Sin backend Python (planificado pero no implementado)
- ❌ Onboarding pasivo (checklist sin guidance real)
- ❌ Mobile UX mejorable (sidebar colapsable subóptimo)
- ❌ Sin notificaciones push/email
- ❌ Sin export PDF/Excel
- ❌ Sin análisis de video/scouting inteligente
- ❌ Sin planes de suscripción/monetización

---

## 🔥 PRIORIDAD 1 - ALTO IMPACTO / BAJO ESFUERZO (1-2 sprints)

### 1.1 Onboarding interactivo real
- **Impacto:** ⭐⭐⭐⭐⭐
- **Esfuerzo:** Bajo
- **Descripción:** El checklist actual es pasivo. Implementar guía paso a paso con tooltips, empty states con CTA directos ("Crear tu primer equipo →"), progress bar visual, video tutorial
- **Archivos:** `pages/dashboard.js`, nuevo componente `OnboardingGuide.js`

### 1.2 Export PDF/Excel reportes
- **Impacto:** ⭐⭐⭐⭐
- **Esfuerzo:** Bajo
- **Descripción:** Entrenadores necesitan llevar informes a reuniones. Botón "Exportar" en dashboard-equipo y dashboard-jugador (librerías: jsPDF + SheetJS/xlsx)
- **Archivos:** `pages/dashboard-equipo.js`, `pages/dashboard-jugador.js`, nuevo `lib/export.js`

### 1.3 Centro de notificaciones in-app
- **Impacto:** ⭐⭐⭐⭐
- **Esfuerzo:** Bajo
- **Descripción:** Campana de notificaciones + persistencia en BD (`notifications` table). Alertas: "Partido mañana", "Jugador cumple años", "Nueva jornada", "Rol aprobado/rechazado"
- **Archivos:** Nuevo componente `NotificationBell.js`, `lib/notifications.js`, migración SQL

### 1.4 Bottom navigation en móvil
- **Impacto:** ⭐⭐⭐⭐
- **Esfuerzo:** Medio
- **Descripción:** Reemplazar sidebar colapsable por bottom navigation (5 tabs: Dashboard, Equipos, Partidos, Jugadores, Perfil) en viewport < 768px
- **Archivos:** `components/Layout.js`

### 1.5 PWA (Service Worker + Manifest)
- **Impacto:** ⭐⭐⭐⭐
- **Esfuerzo:** Bajo
- **Descripción:** `next-pwa` para app installable, offline cache de dashboards, push notifications
- **Archivos:** `next.config.js`, nuevo `public/manifest.json`, `public/sw.js`

---

## 🚀 PRIORIDAD 2 - ALTO IMPACTO / MEDIO ESFUERZO (2-4 sprints)

### 2.1 Backend Python (FastAPI) - Motor stats/IA
- **Impacto:** ⭐⭐⭐⭐⭐
- **Esfuerzo:** Alto
- **Descripción:** Migrar lógica `stats.js` a Python. Endpoints: `/stats/team/{id}`, `/stats/player/{id}`, `/ai/insights`, `/ai/predictions`. Desacoplar frontend de lógica pesada
- **Archivos:** `src/` (FastAPI), nuevo `frontend/lib/api.js`, Dockerfile, vercel.json backend

### 2.2 Análisis táctico con video
- **Impacto:** ⭐⭐⭐⭐⭐
- **Esfuerzo:** Alto
- **Descripción:** Subida de video → timestamps de eventos → dibujo táctico sobre canvas. Diferenciador clave vs competencia. Librerías: `react-player` + `fabric.js`
- **Archivos:** Nueva página `pages/analisis-video.js`, `components/VideoEditor.js`

### 2.3 Módulo de entrenamientos / sesiones
- **Impacto:** ⭐⭐⭐⭐
- **Esfuerzo:** Medio
- **Descripción:** Nueva entidad `training_sessions`. Crear sesiones, ejercicios, asistencia, carga (RPE). Dashboard carga semanal (ACWR)
- **Archivos:** Migración SQL, `pages/entrenamientos.js`, `components/TrainingForm.js`

### 2.4 Scouting avanzado
- **Impacto:** ⭐⭐⭐⭐
- **Esfuerzo:** Medio
- **Descripción:** Filtros combinados (posición + edad + stats), guardar búsquedas, alertas "nuevo jugador que encaja", comparar 3-4 jugadores
- **Archivos:** `pages/scouting.js`, `pages/comparativa.js`

### 2.5 Calendario visual + Drag&Drop
- **Impacto:** ⭐⭐⭐
- **Esfuerzo:** Medio
- **Descripción:** Vista mensual calendario, arrastrar partidos, crear desde calendario, sync Google/Outlook (.ics)
- **Archivos:** Nueva página `pages/calendario.js`, `components/CalendarView.js`, `lib/ical.js`

---

## 💡 PRIORIDAD 3 - DIFERENCIADORES / RETENCIÓN (4+ sprints)

### 3.1 IA Insights automáticos
- **Impacto:** ⭐⭐⭐⭐⭐
- **Esfuerzo:** Alto
- **Descripción:** "Tu equipo concede goles en min 75-90", "Jugador X rinde mejor de lateral", "Rival próximo: fuerte en balón parado". GPT-4 + stats locales + historial
- **Dependencia:** Requiere Backend Python (2.1)

### 3.2 Marketplace scouting (multi-club)
- **Impacto:** ⭐⭐⭐⭐
- **Esfuerzo:** Muy Alto
- **Descripción:** Red de clubs compartiendo jugadores anonimizados. Revenue share. Plan B2B
- **Dependencia:** Modelo de negocio definido

### 3.3 Integración wearables / GPS
- **Impacto:** ⭐⭐⭐
- **Esfuerzo:** Alto
- **Descripción:** Import .fit/.gpx, heatmaps, distancia, sprints, carga aguda/crónica. Estadísticas avanzadas
- **Archivos:** `lib/parsers.js`, `pages/dashboard-equipo.js` (nuevas métricas)

### 3.4 Comunicación equipo (chat/anuncios)
- **Impacto:** ⭐⭐⭐
- **Esfuerzo:** Medio
- **Descripción:** Canal por equipo, anuncios entrenador, confirmaciones asistencia, notificaciones push
- **Archivos:** `pages/chat.js`, `components/ChatWidget.js`, migración SQL `messages` table

### 3.5 Multitenancy / White-label
- **Impacto:** ⭐⭐⭐⭐
- **Esfuerzo:** Muy Alto
- **Descripción:** Federación/liga gestiona todos sus clubs. Facturación SaaS. Dominios personalizados
- **Dependencia:** Arquitectura multiinquilino en BD

---

## 🔧 PRIORIDAD 4 - TECH DEBT / CALIDAD (continuo)

| # | Mejora | Impacto | Esfuerzo |
|---|--------|---------|----------|
| 4.1 | Migrar a App Router (Next.js 14+) | Medio | Alto |
| 4.2 | React Query / SWR para cache + invalidation | Alto | Medio |
| 4.3 | Storybook para componentes | Medio | Bajo |
| 4.4 | E2E tests (Playwright) | Alto | Medio |
| 4.5 | i18n (ES/CA/EN) | Medio | Medio |

---

## 🗓 ROADMAP SUGERIDO (6 MESES)

| Sprint | Foco | Entregables |
|--------|------|-------------|
| **S1-2** | Prioridad 1 | Onboarding real, Export PDF, Notificaciones, PWA, Bottom nav móvil |
| **S3-4** | Prioridad 2.1-2.2 | Backend Python (FastAPI) + Stats API, Video analysis MVP |
| **S5-6** | Prioridad 2.3-2.4 | Entrenamientos, Scouting avanzado, Calendario visual |
| **S7+** | Prioridad 3 | IA Insights, Marketplace, Wearables |

---

## ⚡ QUICK WINS INMEDIATOS (esta semana)

1. **Botón "Exportar PDF"** en dashboard-equipo.js → 2h, valor inmediato para entrenadores
2. **Bottom navigation móvil** → 4h, mejora UX drástica
3. **PWA manifest + service worker** → 1h, instalable en home screen
4. **Empty states con CTA** → ya existe el componente, solo conectar en páginas vacías

---

## ❓ PREGUNTAS PARA DEFINIR PRIORIDAD

1. **¿Objetivo a 3 meses?** A) Retención (más entrenadores) B) Venta B2B (clubs/federaciones) C) Producto premium (IA/Video)
2. **¿Capacidad para mantener backend Python?** (hosting, deploys, monitoring)
3. **¿Feedback real de entrenadores?** ¿Qué piden MÁS?
4. **¿Presupuesto para servicios externos?** (OpenAI, Mux, SendGrid)
