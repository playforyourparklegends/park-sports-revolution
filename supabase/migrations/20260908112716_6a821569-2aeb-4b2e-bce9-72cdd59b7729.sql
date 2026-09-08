CREATE TABLE public.parks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  display_name text NOT NULL,
  mascot_name text,
  state text DEFAULT 'Nevada',
  primary_color text,
  secondary_color text,
  text_color text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','coming_soon')),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.parks TO anon;
GRANT SELECT, INSERT, UPDATE ON public.parks TO authenticated;
GRANT ALL ON public.parks TO service_role;

ALTER TABLE public.parks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view parks" ON public.parks
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can add parks" ON public.parks
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

CREATE POLICY "Admins can update parks" ON public.parks
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

INSERT INTO public.parks (slug, display_name, mascot_name, state, status) VALUES
  ('lorenzi_park_lyons', 'Legends of Lorenzi Park', 'Lyons', 'Nevada', 'active'),
  ('paseo_verde_park_panthers', 'Paseo Verde Park Panthers', 'Panthers', 'Nevada', 'coming_soon');

ALTER TABLE public.ambassador_applications
  ADD COLUMN park_id uuid REFERENCES public.parks(id),
  ADD COLUMN apparel_photo_url text;

UPDATE public.ambassador_applications a
SET park_id = p.id
FROM public.parks p
WHERE a.park_id IS NULL
  AND (
    a.park = p.slug
    OR lower(a.park) = lower(p.display_name)
    OR (lower(a.park) LIKE '%lorenzi%' AND p.slug = 'lorenzi_park_lyons')
    OR (lower(a.park) LIKE '%paseo%' AND p.slug = 'paseo_verde_park_panthers')
  );