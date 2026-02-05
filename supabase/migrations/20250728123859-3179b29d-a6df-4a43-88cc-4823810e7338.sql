-- Fix search path for existing functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.create_default_event_checklist(uuid) SET search_path = '';
ALTER FUNCTION public.handle_new_event() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';