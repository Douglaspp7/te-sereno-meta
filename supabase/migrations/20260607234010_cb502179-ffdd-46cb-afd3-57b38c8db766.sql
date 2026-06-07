DROP POLICY IF EXISTS "Authenticated delete videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload videos" ON storage.objects;

CREATE POLICY "Admins can delete videos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'videos' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can update videos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'videos' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (bucket_id = 'videos' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can upload videos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'videos' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));