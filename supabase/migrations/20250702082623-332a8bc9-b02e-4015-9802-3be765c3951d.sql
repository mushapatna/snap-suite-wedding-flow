-- Add new fields to profiles table for enhanced onboarding
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_in_business TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weddings_per_year TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS services_offered TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_tools TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_source TEXT;

-- Update the handle_new_user function to handle new metadata
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