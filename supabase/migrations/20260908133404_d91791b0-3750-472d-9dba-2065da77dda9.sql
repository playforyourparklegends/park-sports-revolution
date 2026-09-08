CREATE POLICY "Members can view fictional approved ambassadors"
ON public.ambassador_applications
FOR SELECT
TO authenticated
USING (is_fictional = true AND status = 'approved');

INSERT INTO public.ambassador_applications (user_id, park, park_id, display_name, day_job_title, apparel_photo_url, day_job_photo_url, why_trust_me_video_url, status, is_fictional, submitted_at, reviewed_at)
SELECT NULL, 'Lorenzi Park', p.id, v.display_name, v.day_job_title, v.apparel_photo_url, v.day_job_photo_url, NULL, 'approved', true, now(), now()
FROM (VALUES
  ('Marisol Vega', 'Pediatric Nurse', '/__l5e/assets-v1/3ca1f5c8-7f56-41c4-a702-1f216b062e28/lorenzi-amb01-front.jpg', '/__l5e/assets-v1/d6211fc4-0edd-4c01-b886-c69c853b4160/lorenzi-amb01-back.jpg'),
  ('Darnell Whitfield', 'Master Electrician', '/__l5e/assets-v1/4b74181b-eee6-4367-9181-a80705463eb4/lorenzi-amb02-front.jpg', '/__l5e/assets-v1/b7ea9479-0161-456c-832b-47e0e3d4f170/lorenzi-amb02-back.jpg'),
  ('Ruth Ann Kessler', 'High School Math Teacher', '/__l5e/assets-v1/0fa12671-5d29-4345-b2a7-f9d44311ba4d/lorenzi-amb03-front.jpg', '/__l5e/assets-v1/7e2ca75a-8a6e-4736-a4ad-41b1cc563740/lorenzi-amb03-back.jpg'),
  ('Tony Ferreira', 'Barber', '/__l5e/assets-v1/7ef3d8d1-7d74-46c2-abff-36462985379f/lorenzi-amb04-front.jpg', '/__l5e/assets-v1/8534af58-fc0c-49ec-9e90-6f48a72c1ded/lorenzi-amb04-back.jpg'),
  ('Keanu Palakiko', 'Firefighter', '/__l5e/assets-v1/e8dbb5d4-8c07-4763-81f8-17d52e2806af/lorenzi-amb05-front.jpg', '/__l5e/assets-v1/4b560f06-a246-4bf4-96a5-20c0c4691e01/lorenzi-amb05-back.jpg'),
  ('Priya Raman', 'Pharmacist', '/__l5e/assets-v1/5be1819d-da7f-434d-a608-5a380bad43fc/lorenzi-amb06-front.jpg', '/__l5e/assets-v1/96de4d3a-7b2d-4e5e-9f4d-e55234752e16/lorenzi-amb06-back.jpg'),
  ('Hector Salcido', 'Diesel Mechanic', '/__l5e/assets-v1/994efb66-0427-4b55-8cac-a3e43336b18d/lorenzi-amb07-front.jpg', '/__l5e/assets-v1/096f8ab4-6acd-4fe3-9585-fa26dc6cdebc/lorenzi-amb07-back.jpg'),
  ('Jasmine Okafor', 'Line Cook', '/__l5e/assets-v1/2074b00c-1a46-49d9-a6c5-12f1e2dae6fe/lorenzi-amb08-front.jpg', '/__l5e/assets-v1/cf8cf582-9222-4dbb-8001-7c5587eb0d42/lorenzi-amb08-back.jpg'),
  ('Walter Nguyen', 'Mail Carrier', '/__l5e/assets-v1/27958227-5e9e-4874-8d9e-188b48bc3b9c/lorenzi-amb09-front.jpg', '/__l5e/assets-v1/72fe37d8-4ce2-47c1-b36b-8acaf23ada72/lorenzi-amb09-back.jpg'),
  ('Brianna Castillo', 'City Bus Driver', '/__l5e/assets-v1/77884082-10a9-45d9-a0f1-0e1ceaa2099f/lorenzi-amb10-front.jpg', '/__l5e/assets-v1/b53a0021-dff9-4b1e-9d25-6824729289c8/lorenzi-amb10-back.jpg')
) AS v(display_name, day_job_title, apparel_photo_url, day_job_photo_url)
CROSS JOIN public.parks p
WHERE p.slug = 'lorenzi_park_lyons'
  AND NOT EXISTS (SELECT 1 FROM public.ambassador_applications a WHERE a.is_fictional AND a.display_name = v.display_name);