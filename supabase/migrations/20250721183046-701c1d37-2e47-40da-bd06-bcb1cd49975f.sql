-- Function to create default checklist items for new events
CREATE OR REPLACE FUNCTION public.create_default_event_checklist(event_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Equipment checklist items
  INSERT INTO public.event_checklists (event_id, item_name, category, assigned_role) VALUES
  (event_id, 'Camera bodies charged and tested', 'equipment', 'photographer'),
  (event_id, 'Backup camera ready', 'equipment', 'photographer'),
  (event_id, 'Memory cards formatted', 'equipment', 'photographer'),
  (event_id, 'Lenses cleaned and checked', 'equipment', 'photographer'),
  (event_id, 'Video equipment setup', 'equipment', 'cinematographer'),
  (event_id, 'Audio equipment tested', 'equipment', 'cinematographer'),
  (event_id, 'Drone batteries charged', 'equipment', 'drone_operator'),
  (event_id, 'Drone flight clearance obtained', 'equipment', 'drone_operator'),
  (event_id, 'Lighting equipment prepared', 'equipment', null);

  -- Pre-event checklist items
  INSERT INTO public.event_checklists (event_id, item_name, category, assigned_role) VALUES
  (event_id, 'Venue walkthrough completed', 'pre-event', 'site_manager'),
  (event_id, 'Shot list reviewed with client', 'pre-event', 'photographer'),
  (event_id, 'Timeline confirmed', 'pre-event', 'site_manager'),
  (event_id, 'Weather checked', 'pre-event', null),
  (event_id, 'Emergency contacts shared', 'pre-event', 'site_manager'),
  (event_id, 'Backup plans discussed', 'pre-event', 'site_manager');

  -- Shot list items
  INSERT INTO public.event_checklists (event_id, item_name, category, assigned_role) VALUES
  (event_id, 'Getting ready shots', 'shot-list', 'photographer'),
  (event_id, 'Ceremony coverage', 'shot-list', 'photographer'),
  (event_id, 'Family portraits', 'shot-list', 'photographer'),
  (event_id, 'Reception highlights', 'shot-list', 'photographer'),
  (event_id, 'Aerial shots captured', 'shot-list', 'drone_operator'),
  (event_id, 'Detail shots completed', 'shot-list', 'photographer');

  -- Post-event checklist items
  INSERT INTO public.event_checklists (event_id, item_name, category, assigned_role) VALUES
  (event_id, 'Equipment packed and secured', 'post-event', null),
  (event_id, 'Memory cards backed up', 'post-event', 'photographer'),
  (event_id, 'Client preview selection sent', 'post-event', 'photographer'),
  (event_id, 'Equipment maintenance scheduled', 'post-event', null);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create default checklist when an event is created
CREATE OR REPLACE FUNCTION public.handle_new_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default checklist items for the new event
  PERFORM public.create_default_event_checklist(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new events
CREATE TRIGGER on_event_created
  AFTER INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_event();