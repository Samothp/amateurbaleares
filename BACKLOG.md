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
- Configurar despliegue en Vercel.
- Configurar GitHub Actions para pruebas básicas si es necesario.

---

## Ideas futuras (post-MVP)

- Implementar resúmenes automáticos de partido con IA.
- Añadir recomendaciones tácticas.
- Crear scouting inteligente y perfiles premium.
- Añadir análisis de video y clips automáticos.
- Generar planes de monetización y modelos de suscripción.
