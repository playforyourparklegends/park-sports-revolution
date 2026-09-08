REVOKE ALL ON FUNCTION public.prevent_self_admin_escalation() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prevent_self_admin_escalation() FROM anon;
REVOKE ALL ON FUNCTION public.prevent_self_admin_escalation() FROM authenticated;