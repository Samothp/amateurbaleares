-- Supabase Storage: bucket "media" para escudos y fotos de jugadores
-- Ejecutar en Supabase SQL Editor

-- Crear bucket "media"
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Politica: cualquier usuario autenticado puede ver archivos publicos
CREATE POLICY "media_select_auth" ON storage.objects
  FOR SELECT USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Politica: entrenadores, clubs y admin pueden subir archivos
CREATE POLICY "media_insert_entrenador_club" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('Entrenador', 'Club', 'Admin'))
  );

-- Politica: entrenadores, clubs y admin pueden actualizar archivos
CREATE POLICY "media_update_entrenador_club" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'media' AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('Entrenador', 'Club', 'Admin'))
  );

-- Politica: entrenadores, clubs y admin pueden eliminar archivos
CREATE POLICY "media_delete_entrenador_club" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media' AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('Entrenador', 'Club', 'Admin'))
  );
