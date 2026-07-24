
REVOKE ALL ON FUNCTION public.has_friendship(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.find_user_by_handle(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.find_user_by_handle(text) TO authenticated;
-- has_friendship is only used inside RLS policies (runs as definer); no direct grant needed.
