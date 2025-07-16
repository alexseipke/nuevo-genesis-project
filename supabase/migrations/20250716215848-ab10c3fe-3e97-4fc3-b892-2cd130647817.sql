-- First, let's drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.billing_transactions;
DROP POLICY IF EXISTS "Admins can view all usage" ON public.user_usage;

-- Create a security definer function to get user role without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Now recreate the policies using the security definer function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all projects" 
ON public.projects 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all transactions" 
ON public.billing_transactions 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all usage" 
ON public.user_usage 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');