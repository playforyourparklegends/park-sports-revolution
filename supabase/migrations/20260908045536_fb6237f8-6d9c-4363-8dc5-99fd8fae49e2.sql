DROP POLICY "Admins can view all profiles" ON public.profiles;
DROP POLICY "Admins can view all applications" ON public.ambassador_applications;
DROP POLICY "Admins can review applications" ON public.ambassador_applications;
DROP POLICY "Admins read all ambassador files" ON storage.objects;
DROP FUNCTION public.is_admin(uuid);

CREATE POLICY "Admins can view all applications"
ON public.ambassador_applications FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

CREATE POLICY "Admins can review applications"
ON public.ambassador_applications FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

CREATE POLICY "Admins read all ambassador files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'ambassador-videos'
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin)
);