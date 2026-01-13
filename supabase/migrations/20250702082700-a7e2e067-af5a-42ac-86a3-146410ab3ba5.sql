-- Create a profiles table to store additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  company_name TEXT,
  phone_number TEXT,
  location TEXT,
  role TEXT CHECK (role IN ('photographer', 'videographer', 'editor', 'admin')) DEFAULT 'photographer',
  team_size TEXT,
  plan_type TEXT CHECK (plan_type IN ('basic', 'advance', 'premium', 'unlimited')) DEFAULT 'basic',
  years_in_business TEXT,
  weddings_per_year TEXT,
  services_offered TEXT[],
  current_tools TEXT[],
  referral_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create a function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    role, 
    plan_type,
    company_name,
    phone_number,
    location,
    years_in_business,
    weddings_per_year,
    services_offered,
    current_tools,
    referral_source
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'photographer'),
    COALESCE(NEW.raw_user_meta_data->>'plan_type', 'basic'),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    COALESCE(NEW.raw_user_meta_data->>'years_in_business', ''),
    COALESCE(NEW.raw_user_meta_data->>'weddings_per_year', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'services_offered' IS NOT NULL 
      THEN string_to_array(NEW.raw_user_meta_data->>'services_offered', ',')
      ELSE '{}'::TEXT[]
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'current_tools' IS NOT NULL 
      THEN string_to_array(NEW.raw_user_meta_data->>'current_tools', ',')
      ELSE '{}'::TEXT[]
    END,
    COALESCE(NEW.raw_user_meta_data->>'referral_source', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();