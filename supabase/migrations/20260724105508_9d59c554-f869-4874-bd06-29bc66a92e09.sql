
-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle text UNIQUE NOT NULL,
  public_key text NOT NULL,
  encrypted_private_key text NOT NULL,
  pk_salt text NOT NULL,
  pk_iv text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- friendships enum
CREATE TYPE public.friendship_status AS ENUM ('pending','accepted');

CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.friendship_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);
CREATE INDEX friendships_addressee_idx ON public.friendships(addressee_id);
CREATE INDEX friendships_requester_idx ON public.friendships(requester_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- has_friendship helper (accepted only)
CREATE OR REPLACE FUNCTION public.has_friendship(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
      AND ((requester_id = _a AND addressee_id = _b)
        OR (requester_id = _b AND addressee_id = _a))
  );
$$;

-- pending encrypted keys (server relay)
CREATE TABLE public.pending_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id text UNIQUE NOT NULL,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wrapped_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX pending_keys_recipient_idx ON public.pending_keys(recipient_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pending_keys TO authenticated;
GRANT ALL ON public.pending_keys TO service_role;
ALTER TABLE public.pending_keys ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
-- Read own profile
CREATE POLICY "profiles self select" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);
-- Read accepted friends' profiles (needed for public_key + handle)
CREATE POLICY "profiles friend select" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_friendship(auth.uid(), id));
-- Insert own profile on signup
CREATE POLICY "profiles self insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
-- Update own profile
CREATE POLICY "profiles self update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- FRIENDSHIPS policies
CREATE POLICY "friendships involved select" ON public.friendships
  FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "friendships requester insert" ON public.friendships
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id AND status = 'pending');
-- Addressee can accept (update status)
CREATE POLICY "friendships addressee update" ON public.friendships
  FOR UPDATE TO authenticated
  USING (auth.uid() = addressee_id)
  WITH CHECK (auth.uid() = addressee_id);
-- Either party can delete (unfriend / decline)
CREATE POLICY "friendships involved delete" ON public.friendships
  FOR DELETE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- PENDING_KEYS policies
-- Sender can insert if they're friends with recipient
CREATE POLICY "pending_keys sender insert" ON public.pending_keys
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND public.has_friendship(auth.uid(), recipient_id)
  );
-- Recipient (or sender) can view. Recipient reads then deletes.
CREATE POLICY "pending_keys recipient select" ON public.pending_keys
  FOR SELECT TO authenticated
  USING (auth.uid() = recipient_id OR auth.uid() = sender_id);
-- Recipient can delete after fetching
CREATE POLICY "pending_keys recipient delete" ON public.pending_keys
  FOR DELETE TO authenticated
  USING (auth.uid() = recipient_id OR auth.uid() = sender_id);

-- Handle search helper: returns id, handle, public_key for a profile by handle,
-- only if the caller and target are friends OR it's the caller themselves.
-- For adding friends we need to look up a stranger by handle without leaking their public key.
-- Provide a limited search function.
CREATE OR REPLACE FUNCTION public.find_user_by_handle(_handle text)
RETURNS TABLE(id uuid, handle text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.handle FROM public.profiles p WHERE p.handle = _handle LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.find_user_by_handle(text) TO authenticated;
