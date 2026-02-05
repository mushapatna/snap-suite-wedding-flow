-- Create events table for wedding projects
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.wedding_projects(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  time_from TIME,
  time_to TIME,
  location TEXT,
  google_map_link TEXT,
  photographer TEXT,
  cinematographer TEXT,
  drone_operator TEXT,
  site_manager TEXT,
  assistant TEXT,
  details TEXT,
  instructions TEXT,
  sample_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table for wedding projects
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.wedding_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  priority TEXT,
  due_date DATE,
  assigned_to TEXT,
  estimated_hours INTEGER,
  description TEXT,
  expected_deliverables TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for events
CREATE POLICY "Users can view events for their projects" 
ON public.events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_projects 
    WHERE wedding_projects.id = events.project_id 
    AND wedding_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create events for their projects" 
ON public.events 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wedding_projects 
    WHERE wedding_projects.id = events.project_id 
    AND wedding_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update events for their projects" 
ON public.events 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_projects 
    WHERE wedding_projects.id = events.project_id 
    AND wedding_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete events for their projects" 
ON public.events 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_projects 
    WHERE wedding_projects.id = events.project_id 
    AND wedding_projects.user_id = auth.uid()
  )
);

-- Create RLS policies for tasks
CREATE POLICY "Users can view tasks for their projects" 
ON public.tasks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_projects 
    WHERE wedding_projects.id = tasks.project_id 
    AND wedding_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create tasks for their projects" 
ON public.tasks 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wedding_projects 
    WHERE wedding_projects.id = tasks.project_id 
    AND wedding_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update tasks for their projects" 
ON public.tasks 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_projects 
    WHERE wedding_projects.id = tasks.project_id 
    AND wedding_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete tasks for their projects" 
ON public.tasks 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_projects 
    WHERE wedding_projects.id = tasks.project_id 
    AND wedding_projects.user_id = auth.uid()
  )
);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_wedding_projects_updated_at();

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_wedding_projects_updated_at();