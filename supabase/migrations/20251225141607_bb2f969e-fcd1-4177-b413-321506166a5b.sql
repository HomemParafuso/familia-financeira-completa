-- Create a security definer function to get user's family_id without recursion
CREATE OR REPLACE FUNCTION public.get_user_family_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id FROM public.profiles WHERE id = _user_id
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view profiles in their family" ON public.profiles;

-- Create a new policy that uses the security definer function
CREATE POLICY "Users can view profiles in their family" 
ON public.profiles 
FOR SELECT 
USING (
  (id = auth.uid()) 
  OR (family_id = get_user_family_id(auth.uid())) 
  OR has_role(auth.uid(), 'admin'::app_role)
);