
CREATE OR REPLACE FUNCTION public.has_friendship(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
      AND ((requester_id = _a AND addressee_id = _b)
        OR (requester_id = _b AND addressee_id = _a))
  );
$$;

REVOKE ALL ON FUNCTION public.find_user_by_handle(text) FROM PUBLIC, anon, authenticated;
DROP FUNCTION IF EXISTS public.find_user_by_handle(text);
