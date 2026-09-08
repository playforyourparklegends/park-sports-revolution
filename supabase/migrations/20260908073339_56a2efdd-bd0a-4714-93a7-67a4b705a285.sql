CREATE OR REPLACE FUNCTION public.prevent_self_admin_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Authenticated end users cannot change their own admin flag.
  -- Service role and postgres can still update is_admin for trusted admin flows.
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin AND current_user = 'authenticated' THEN
    RAISE EXCEPTION 'is_admin cannot be changed through self-service profile updates';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_self_admin_escalation ON public.profiles;

CREATE TRIGGER profiles_prevent_self_admin_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_self_admin_escalation();