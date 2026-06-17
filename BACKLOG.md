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

## Sprint 3: Gestión de partidos y eventos

1. Crear el modelo de partidos en la base de datos.
2. Implementar creación de un partido (equipo, rival, fecha, resultado, alineación).
3. Crear detalle de partido.
4. Implementar registro de eventos en vivo.
5. Asegurar que el diseño permite registrar eventos rápidamente en móvil.

---

## Sprint 4: Estadísticas y dashboards

1. Calcular estadísticas básicas a partir de eventos (goles, asistencias, minutos, precisión de pases, duelos ganados).
2. Crear un dashboard básico de jugador.
3. Crear un dashboard de equipo.
4. Añadir visualización de evolución temporal y comparativas simples.

---

## Sprint 5: Perfil scouting y validación

1. Crear páginas de perfil de jugador con fortalezas y debilidades.
2. Añadir historial de rendimiento y estadísticas acumuladas.
3. Preparar una demo funcional para mostrar a entrenadores.
4. Recoger feedback inicial de 2-3 usuarios reales.

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
