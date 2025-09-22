-- Fix RLS policy for user_roles to allow authenticated users to read their own role
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());