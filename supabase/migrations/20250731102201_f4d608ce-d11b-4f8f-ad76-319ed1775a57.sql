-- Add new roles to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'photo_editor';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'video_editor';

-- Create dashboard_preferences table for role-specific customization
CREATE TABLE public.dashboard_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dashboard_layout JSONB DEFAULT '{}',
  widget_preferences JSONB DEFAULT '{}',
  quick_actions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on dashboard_preferences
ALTER TABLE public.dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for dashboard_preferences
CREATE POLICY "Users can view their own dashboard preferences"
ON public.dashboard_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dashboard preferences"
ON public.dashboard_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard preferences"
ON public.dashboard_preferences
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboard preferences"
ON public.dashboard_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updating dashboard_preferences timestamps
CREATE TRIGGER update_dashboard_preferences_updated_at
BEFORE UPDATE ON public.dashboard_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();