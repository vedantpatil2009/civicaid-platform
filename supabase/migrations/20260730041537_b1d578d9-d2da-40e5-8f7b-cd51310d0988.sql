CREATE POLICY "complaint_photos_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'complaint-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "complaint_photos_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'complaint-photos' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_staff(auth.uid())));
CREATE POLICY "complaint_photos_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'complaint-photos' AND (storage.foldername(name))[1] = auth.uid()::text);