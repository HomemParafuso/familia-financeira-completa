-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view profiles in their family" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own family" ON public.families;

-- Create helper function to get user's family_id without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_family_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id FROM public.profiles WHERE id = _user_id LIMIT 1
$$;

-- Recreate profiles policy without recursion
CREATE POLICY "Users can view profiles in their family"
ON public.profiles
FOR SELECT
USING (
  id = auth.uid()
  OR family_id = get_user_family_id(auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Recreate families policy without recursion
CREATE POLICY "Users can view their own family"
ON public.families
FOR SELECT
USING (
  id = get_user_family_id(auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);