-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM (
  'studio_owner',
  'project_manager', 
  'photographer',
  'cinematographer',
  'drone_operator',
  'assistant',
  'client'
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS TABLE(role app_role)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Studio owners can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'studio_owner'));

CREATE POLICY "Project managers can view team roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'project_manager') OR
  public.has_role(auth.uid(), 'studio_owner')
);

-- Update profiles table to include portal preferences
ALTER TABLE public.profiles ADD COLUMN default_portal TEXT DEFAULT 'dashboard';
ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;

-- Create team invitations table
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role app_role NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked'))
);

-- Enable RLS on team_invitations
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for team_invitations
CREATE POLICY "Studio owners can manage invitations"
ON public.team_invitations
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'studio_owner'));

CREATE POLICY "Project managers can view invitations"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'project_manager') OR
  public.has_role(auth.uid(), 'studio_owner')
);

-- Update handle_new_user function to assign default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert into profiles
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

  -- Check if this is an invited user
  IF EXISTS (
    SELECT 1 FROM public.team_invitations 
    WHERE email = NEW.email AND status = 'pending' AND expires_at > now()
  ) THEN
    -- Get the role from invitation
    INSERT INTO public.user_roles (user_id, role)
    SELECT NEW.id, ti.role
    FROM public.team_invitations ti
    WHERE ti.email = NEW.email AND ti.status = 'pending' AND ti.expires_at > now()
    LIMIT 1;
    
    -- Mark invitation as accepted
    UPDATE public.team_invitations
    SET status = 'accepted', accepted_at = now()
    WHERE email = NEW.email AND status = 'pending';
  ELSE
    -- Assign default role based on signup type
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'studio_owner'::app_role);
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for new users (replace existing)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();