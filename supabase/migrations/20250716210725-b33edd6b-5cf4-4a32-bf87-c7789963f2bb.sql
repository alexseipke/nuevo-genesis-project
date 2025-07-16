-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  mission_type TEXT NOT NULL,
  parameters JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_usage table
CREATE TABLE public.user_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  free_projects_used INTEGER NOT NULL DEFAULT 0,
  total_exports INTEGER NOT NULL DEFAULT 0,
  paid_exports INTEGER NOT NULL DEFAULT 0,
  pending_charge_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  last_export_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create billing_transactions table
CREATE TABLE public.billing_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  description TEXT,
  status TEXT NOT NULL,
  export_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create google_drive_tokens table
CREATE TABLE public.google_drive_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_drive_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Create RLS policies for projects
CREATE POLICY "Users can manage their own projects" ON public.projects
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all projects" ON public.projects
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Create RLS policies for user_usage
CREATE POLICY "Users can view their own usage" ON public.user_usage
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own usage" ON public.user_usage
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own usage" ON public.user_usage
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all usage" ON public.user_usage
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Create RLS policies for billing_transactions
CREATE POLICY "Users can view their own transactions" ON public.billing_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own transactions" ON public.billing_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions" ON public.billing_transactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Create RLS policies for google_drive_tokens
CREATE POLICY "Users can manage their own tokens" ON public.google_drive_tokens
  FOR ALL USING (user_id = auth.uid());

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  INSERT INTO public.user_usage (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_usage_updated_at
  BEFORE UPDATE ON public.user_usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_google_drive_tokens_updated_at
  BEFORE UPDATE ON public.google_drive_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();