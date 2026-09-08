-- Harden self-service profile updates so members cannot grant themselves admin access.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND is_admin = (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid())
);

-- Keep the trigger as a second line of defence and make it robust for any non-privileged role.
CREATE OR REPLACE FUNCTION public.prevent_self_admin_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin
     AND current_user NOT IN ('postgres', 'service_role', 'supabase_admin') THEN
    RAISE EXCEPTION 'is_admin cannot be changed through self-service profile updates';
  END IF;
  RETURN NEW;
END;
$function$;