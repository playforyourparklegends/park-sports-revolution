ALTER TABLE public.parks ADD COLUMN IF NOT EXISTS crest_image_url text;

ALTER TABLE public.ambassador_applications
  ADD COLUMN IF NOT EXISTS is_fictional boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_name text,
  ALTER COLUMN why_trust_me_video_url DROP NOT NULL,
  ALTER COLUMN user_id DROP NOT NULL;

CREATE POLICY "Members can view approved fictional ambassadors"
  ON public.ambassador_applications FOR SELECT TO authenticated
  USING (is_fictional = true AND status = 'approved');

CREATE TABLE public.roster_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  park_id uuid NOT NULL REFERENCES public.parks(id) ON DELETE CASCADE,
  name text NOT NULL,
  position text NOT NULL,
  jersey_number integer,
  portrait_image_url text,
  is_fictional boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.roster_players TO anon, authenticated;
GRANT INSERT, UPDATE ON public.roster_players TO authenticated;
GRANT ALL ON public.roster_players TO service_role;
ALTER TABLE public.roster_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view roster players" ON public.roster_players FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can add roster players" ON public.roster_players FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));
CREATE POLICY "Admins can update roster players" ON public.roster_players FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

CREATE TABLE public.legends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  park_id uuid NOT NULL REFERENCES public.parks(id) ON DELETE CASCADE,
  name text NOT NULL,
  position text NOT NULL,
  monument_image_url text,
  achievement_text text,
  is_fictional boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.legends TO anon, authenticated;
GRANT INSERT, UPDATE ON public.legends TO authenticated;
GRANT ALL ON public.legends TO service_role;
ALTER TABLE public.legends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view legends" ON public.legends FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can add legends" ON public.legends FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));
CREATE POLICY "Admins can update legends" ON public.legends FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

CREATE POLICY "Anyone can view park media" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'park-media');
CREATE POLICY "Admins can upload park media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'park-media' AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));
CREATE POLICY "Admins can update park media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'park-media' AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));