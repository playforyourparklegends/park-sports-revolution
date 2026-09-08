ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND is_admin);
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

UPDATE public.profiles p SET is_admin = true
FROM auth.users u
WHERE u.id = p.id AND u.email = 'dev@legendsofthepark.test';

CREATE TABLE public.ambassador_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  park text NOT NULL,
  day_job_title text NOT NULL,
  day_job_photo_url text,
  why_trust_me_video_url text NOT NULL,
  why_trust_me_text text,
  status text NOT NULL DEFAULT 'pending',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewer_note text,
  CONSTRAINT ambassador_applications_status_check CHECK (status IN ('pending','approved','rejected'))
);

CREATE INDEX ambassador_applications_user_id_idx ON public.ambassador_applications (user_id);
CREATE INDEX ambassador_applications_status_idx ON public.ambassador_applications (status);

GRANT SELECT, INSERT ON public.ambassador_applications TO authenticated;
GRANT UPDATE ON public.ambassador_applications TO authenticated;
GRANT ALL ON public.ambassador_applications TO service_role;

ALTER TABLE public.ambassador_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Applicants can insert their own application"
ON public.ambassador_applications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Applicants can view their own application"
ON public.ambassador_applications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
ON public.ambassador_applications FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can review applications"
ON public.ambassador_applications FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Members upload into their own ambassador folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'ambassador-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Members read their own ambassador files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'ambassador-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Members delete their own ambassador files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'ambassador-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins read all ambassador files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'ambassador-videos' AND public.is_admin(auth.uid()));