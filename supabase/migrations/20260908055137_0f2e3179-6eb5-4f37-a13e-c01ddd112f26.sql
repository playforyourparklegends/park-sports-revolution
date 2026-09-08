CREATE TYPE public.member_role AS ENUM ('player', 'ambassador', 'fan');
CREATE TYPE public.park_choice AS ENUM ('lorenzi_park_lyons', 'paseo_verde_park_panthers');

ALTER TABLE public.profiles
  ADD COLUMN role public.member_role,
  ADD COLUMN chosen_park public.park_choice;