# Producto: Plataforma de Estadísticas y Scouting de Fútbol Amateur

## Visión general
Crear una plataforma web y móvil enfocada en fútbol amateur y semiprofesional para:
- Registrar estadísticas de partidos.
- Analizar el rendimiento de jugadores.
- Crear perfiles scouting.
- Generar informes automáticos.
- Visualizar métricas avanzadas.
- Ayudar a entrenadores, academias y scouts.

El objetivo principal es ofrecer una solución sencilla, rápida y asequible para clubes pequeños y entrenadores que no pueden pagar herramientas profesionales.

---

## Personas y usuarios
- **Entrenadores amateur**: necesitan métricas simples, control del rendimiento y comparativas.
- **Clubes regionales**: necesitan centralizar datos, generar informes y seguir a los jugadores.
- **Academias**: buscan desarrollo de jugadores y historial de rendimiento.
- **Scouts independientes**: requieren perfiles de jugadores, estadísticas y filtros de scouting.
- **Padres de jugadores**: mercado secundario potencial.

---

## Epics principales

### Epic 1: Autenticación y gestión de usuarios
- Registro de usuario.
- Login.
- Recuperación de contraseña.
- Gestión de roles: entrenador, club, scout, admin.
- Perfil de usuario básico.

### Epic 2: Gestión de equipos
- Crear y editar equipos.
- Definir plantilla y asignar entrenadores.
- Añadir categoría, liga, ciudad y escudo.
- Ver equipos y su información.

### Epic 3: Gestión de jugadores
- Añadir y editar jugadores.
- Guardar datos personales: nombre, edad, posición, altura, pierna dominante, dorsal, foto.
- Ver historial del jugador.
- Ver estadísticas acumuladas y evolución.

### Epic 4: Gestión de partidos
- Crear partido.
- Registrar rival, fecha, resultado y alineación.
- Ver lista de partidos.
- Detalles de partido.

### Epic 5: Registro de eventos en vivo
- Registrar eventos de partido en vivo.
- Eventos soportados: gol, asistencia, tiro, pase clave, pérdida, recuperación, falta, tarjeta, parada, despeje.
- UX optimizado para registrar eventos en menos de 2 segundos.

### Epic 6: Dashboard estadístico
- Visualizar métricas básicas: goles, asistencias, minutos, precisión de pases, duelos ganados, rendimiento.
- Gráficos de evolución temporal.
- Comparativas entre jugadores/equipos.
- Rankings.

### Epic 7: Perfil scouting
- Mostrar perfil de jugador.
- Incluir fortalezas y debilidades.
- Historial de desempeño.
- Estadísticas y datos de scouting para detección de talento.

---

## Roadmap recomendado

### Semana 1: Setup inicial
- Configurar entorno de desarrollo.
- Inicializar repositorio.
- Configurar Supabase.
- Configurar proyecto Next.js (o stack elegido).
- Configurar autenticación básica.

### Semana 2: Core MVP
- Construir gestión de equipos.
- Implementar gestión de jugadores.
- Activar creación y visualización de partidos.

### Semana 3: Registro en partido y estadísticas
- Implementar registro de eventos en vivo.
- Calcular estadísticas básicas automáticamente.
- Visualizar datos de partido y jugador.

### Semana 4: Dashboard y diseño responsive
- Añadir dashboards estadísticos.
- Crear comparativas y rankings.
- Refinar diseño mobile-first.
- Realizar deploy inicial.

### Semana 5: Validación con usuarios reales
- Presentar MVP a entrenadores.
- Recoger feedback.
- Ajustar prioridades y simplificar según uso real.

---

## Historias de usuario clave

### Autenticación
- Como entrenador, quiero registrarme y acceder con mi cuenta para usar la plataforma.
- Como usuario olvidadizo, quiero recuperar mi contraseña para no perder acceso.
- Como administrador, quiero gestionar roles para controlar accesos.

### Equipos
- Como entrenador, quiero crear equipos para organizar mis plantillas.
- Como club, quiero editar la información de un equipo para mantenerlo actualizado.

### Jugadores
- Como entrenador, quiero añadir jugadores con sus datos básicos para tener su perfil.
- Como scout, quiero ver el historial y las estadísticas de un jugador para evaluarlo.

### Partidos
- Como entrenador, quiero crear un partido con rival, fecha y resultado para registrar la jornada.
- Como entrenador, quiero visualizar los detalles de un partido para analizar lo ocurrido.

### Eventos en vivo
- Como entrenador, quiero registrar goles, asistencias y eventos clave en vivo para tener datos exactos.
- Como usuario móvil, quiero hacerlo rápido para no perder ritmo durante el partido.

### Dashboards
- Como entrenador, quiero ver gráficos de rendimiento para comparar jugadores y fechas.
- Como club, quiero analizar tendencias de rendimiento para tomar decisiones.

### Scouting
- Como scout, quiero un perfil de jugador con fortalezas y debilidades para identificar talento.
- Como entrenador, quiero ver recomendaciones de scouting para buscar jugadores con patrones similares.

---

## Funciones avanzadas futuras
- Resumen automático de partidos con IA.
- Insights sobre bajadas de rendimiento, consistencia y patrones.
- Recomendaciones tácticas automáticas.
- Scouting inteligente y detección de talento.
- Análisis de vídeo y clips automáticos.

---

## Stack tecnológico recomendado
- Frontend: Next.js + React + TailwindCSS.
- Backend: Supabase + PostgreSQL.
- Hosting: Vercel.
- IA: OpenAI API.
- Visualización: Recharts.

---

## Métricas y monetización
- Métricas clave: usuarios activos, partidos registrados, tiempo de uso, retención, MRR, CAC, churn, LTV.
- Modelo inicial: plan gratuito limitado + Plan Pro con dashboards e IA.
- Futuro: licencias de clubes y marketplace scouting.

---

## Prioridades del MVP
1. Simplicidad
2. Velocidad
3. Mobile First
4. Validación temprana con entrenadores
5. Evitar construir demasiado antes de validar
