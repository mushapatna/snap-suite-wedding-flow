-- Create event_checklists table for dynamic checklist management
CREATE TABLE public.event_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'equipment', 'pre-event', 'shot-list', etc.
  assigned_role TEXT, -- 'photographer', 'cinematographer', 'drone_operator', etc.
  is_completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create file_submissions table for team member uploads
CREATE TABLE public.file_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  team_member_name TEXT NOT NULL,
  team_member_role TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image', 'video', 'document', etc.
  submission_type TEXT NOT NULL, -- 'raw', 'edited', 'final', 'reference', etc.
  review_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'needs_revision'
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT
);

-- Create team_member_contacts table for communication
CREATE TABLE public.team_member_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  phone_number TEXT,
  whatsapp_number TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.event_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_member_contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_checklists
CREATE POLICY "Users can view checklists for their events"
ON public.event_checklists
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.events e
  INNER JOIN public.wedding_projects wp ON e.project_id = wp.id
  WHERE e.id = event_checklists.event_id AND wp.user_id = auth.uid()
));

CREATE POLICY "Users can create checklists for their events"
ON public.event_checklists
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.events e
  INNER JOIN public.wedding_projects wp ON e.project_id = wp.id
  WHERE e.id = event_checklists.event_id AND wp.user_id = auth.uid()
));

CREATE POLICY "Users can update checklists for their events"
ON public.event_checklists
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.events e
  INNER JOIN public.wedding_projects wp ON e.project_id = wp.id
  WHERE e.id = event_checklists.event_id AND wp.user_id = auth.uid()
));

CREATE POLICY "Users can delete checklists for their events"
ON public.event_checklists
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.events e
  INNER JOIN public.wedding_projects wp ON e.project_id = wp.id
  WHERE e.id = event_checklists.event_id AND wp.user_id = auth.uid()
));

-- RLS policies for file_submissions
CREATE POLICY "Users can view submissions for their events"
ON public.file_submissions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.events e
  INNER JOIN public.wedding_projects wp ON e.project_id = wp.id
  WHERE e.id = file_submissions.event_id AND wp.user_id = auth.uid()
));

CREATE POLICY "Users can create submissions for their events"
ON public.file_submissions
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.events e
  INNER JOIN public.wedding_projects wp ON e.project_id = wp.id
  WHERE e.id = file_submissions.event_id AND wp.user_id = auth.uid()
));

CREATE POLICY "Users can update submissions for their events"
ON public.file_submissions
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.events e
  INNER JOIN public.wedding_projects wp ON e.project_id = wp.id
  WHERE e.id = file_submissions.event_id AND wp.user_id = auth.uid()
));

CREATE POLICY "Users can delete submissions for their events"
ON public.file_submissions
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.events e
  INNER JOIN public.wedding_projects wp ON e.project_id = wp.id
  WHERE e.id = file_submissions.event_id AND wp.user_id = auth.uid()
));

-- RLS policies for team_member_contacts (user-specific)
CREATE POLICY "Users can view their team contacts"
ON public.team_member_contacts
FOR SELECT
USING (true); -- Allow all authenticated users to see team contacts

CREATE POLICY "Users can create team contacts"
ON public.team_member_contacts
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update team contacts"
ON public.team_member_contacts
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete team contacts"
ON public.team_member_contacts
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create triggers for timestamp updates
CREATE TRIGGER update_event_checklists_updated_at
BEFORE UPDATE ON public.event_checklists
FOR EACH ROW
EXECUTE FUNCTION public.update_wedding_projects_updated_at();

CREATE TRIGGER update_team_member_contacts_updated_at
BEFORE UPDATE ON public.team_member_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_wedding_projects_updated_at();

-- Insert some default team member contacts
INSERT INTO public.team_member_contacts (name, role, phone_number, whatsapp_number, email) VALUES
('John Doe', 'photographer', '+1234567890', '+1234567890', 'john@example.com'),
('Jane Smith', 'photographer', '+1234567891', '+1234567891', 'jane@example.com'),
('Mike Johnson', 'photographer', '+1234567892', '+1234567892', 'mike@example.com'),
('Alex Brown', 'cinematographer', '+1234567893', '+1234567893', 'alex@example.com'),
('Sarah Wilson', 'cinematographer', '+1234567894', '+1234567894', 'sarah@example.com'),
('Tom Clark', 'drone_operator', '+1234567895', '+1234567895', 'tom@example.com'),
('Lisa Taylor', 'drone_operator', '+1234567896', '+1234567896', 'lisa@example.com'),
('Ryan Garcia', 'site_manager', '+1234567897', '+1234567897', 'ryan@example.com'),
('Amy White', 'assistant', '+1234567898', '+1234567898', 'amy@example.com');