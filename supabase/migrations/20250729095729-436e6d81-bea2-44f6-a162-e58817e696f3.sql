-- Add example team members
INSERT INTO public.team_member_contacts (name, role, phone_number, whatsapp_number, email, status) VALUES
('Sarah Johnson', 'photographer', '+1-555-0123', '+1-555-0123', 'sarah.johnson@example.com', 'active'),
('Mike Chen', 'cinematographer', '+1-555-0124', '+1-555-0124', 'mike.chen@example.com', 'active'),
('Emily Davis', 'drone_operator', '+1-555-0125', '+1-555-0125', 'emily.davis@example.com', 'active'),
('James Wilson', 'site_manager', '+1-555-0126', '+1-555-0126', 'james.wilson@example.com', 'inactive'),
('Lisa Garcia', 'assistant', '+1-555-0127', '+1-555-0127', 'lisa.garcia@example.com', 'pending');

-- Add example wedding projects (we'll add these to existing user or create a sample user)
-- Assuming we have at least one user in the system, we'll use a placeholder user_id
-- In real usage, this would be replaced with actual user IDs
DO $$
DECLARE
    sample_user_id uuid;
    project1_id uuid;
    project2_id uuid;
    project3_id uuid;
    event1_id uuid;
    event2_id uuid;
    event3_id uuid;
BEGIN
    -- Get or create a sample user (for demo purposes)
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    
    -- If no users exist, we'll use a fixed UUID for demo
    IF sample_user_id IS NULL THEN
        sample_user_id := '11111111-1111-1111-1111-111111111111';
    END IF;

    -- Insert sample projects
    INSERT INTO public.wedding_projects (id, user_id, couple_name, event_date, event_type, location, service_type, status, progress_percentage)
    VALUES 
        (gen_random_uuid(), sample_user_id, 'John & Emma', '2024-03-15', 'Wedding', 'Grand Hotel Ballroom', 'Full Service', 'active', 75),
        (gen_random_uuid(), sample_user_id, 'David & Maria', '2024-04-20', 'Wedding', 'Beachside Resort', 'Photography Only', 'active', 45),
        (gen_random_uuid(), sample_user_id, 'Alex & Sophie', '2024-02-10', 'Wedding', 'Garden Venue', 'Full Service', 'completed', 100)
    RETURNING id INTO project1_id;

    -- Get the project IDs for reference
    SELECT id INTO project1_id FROM public.wedding_projects WHERE couple_name = 'John & Emma';
    SELECT id INTO project2_id FROM public.wedding_projects WHERE couple_name = 'David & Maria';
    SELECT id INTO project3_id FROM public.wedding_projects WHERE couple_name = 'Alex & Sophie';

    -- Insert sample events
    INSERT INTO public.events (id, project_id, event_name, event_date, time_from, time_to, location, photographer, cinematographer, drone_operator, site_manager, assistant, details)
    VALUES 
        (gen_random_uuid(), project1_id, 'Wedding Ceremony', '2024-03-15', '14:00', '16:00', 'Grand Hotel Chapel', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'James Wilson', 'Lisa Garcia', 'Main ceremony coverage'),
        (gen_random_uuid(), project2_id, 'Beach Wedding', '2024-04-20', '16:00', '19:00', 'Sunset Beach', 'Sarah Johnson', NULL, 'Emily Davis', 'James Wilson', NULL, 'Outdoor beach ceremony'),
        (gen_random_uuid(), project3_id, 'Garden Reception', '2024-02-10', '18:00', '23:00', 'Botanical Gardens', 'Sarah Johnson', 'Mike Chen', NULL, 'James Wilson', 'Lisa Garcia', 'Evening reception')
    RETURNING id INTO event1_id;

    -- Get event IDs
    SELECT id INTO event1_id FROM public.events WHERE event_name = 'Wedding Ceremony';
    SELECT id INTO event2_id FROM public.events WHERE event_name = 'Beach Wedding';
    SELECT id INTO event3_id FROM public.events WHERE event_name = 'Garden Reception';

    -- Insert sample tasks
    INSERT INTO public.tasks (project_id, title, category, priority, assigned_to, description, due_date, estimated_hours, status, expected_deliverables)
    VALUES 
        (project1_id, 'Pre-wedding Equipment Check', 'equipment', 'high', 'Sarah Johnson', 'Check all camera equipment and batteries', '2024-03-14', 2, 'completed', 'Equipment checklist signed off'),
        (project1_id, 'Venue Site Visit', 'preparation', 'medium', 'James Wilson', 'Visit venue to plan logistics', '2024-03-13', 3, 'completed', 'Site plan and timeline'),
        (project1_id, 'Drone Flight Permission', 'equipment', 'high', 'Emily Davis', 'Obtain flight clearance for aerial shots', '2024-03-12', 1, 'pending', 'Flight clearance documentation'),
        (project2_id, 'Beach Photography Setup', 'preparation', 'medium', 'Sarah Johnson', 'Plan beach photography angles and timing', '2024-04-18', 4, 'in_progress', 'Shot list and timing schedule'),
        (project2_id, 'Weather Backup Plan', 'preparation', 'high', 'James Wilson', 'Prepare indoor backup location', '2024-04-19', 2, 'pending', 'Backup venue confirmed'),
        (project3_id, 'Final Photo Delivery', 'post-production', 'medium', 'Sarah Johnson', 'Edit and deliver final wedding photos', '2024-02-20', 16, 'completed', '200+ edited photos delivered'),
        (project3_id, 'Video Editing', 'post-production', 'medium', 'Mike Chen', 'Create wedding highlight reel', '2024-02-25', 20, 'completed', '5-minute highlight video');

    -- Insert sample file submissions
    INSERT INTO public.file_submissions (event_id, file_name, file_url, file_type, submission_type, team_member_name, team_member_role, review_status, reviewer_notes)
    VALUES 
        (event3_id, 'garden_reception_photos_batch1.zip', 'https://example.com/files/batch1.zip', 'image', 'final_delivery', 'Sarah Johnson', 'photographer', 'approved', 'Excellent quality, great composition'),
        (event3_id, 'highlight_reel_v1.mp4', 'https://example.com/files/highlight.mp4', 'video', 'draft', 'Mike Chen', 'cinematographer', 'approved', 'Perfect storytelling, ready for delivery'),
        (event1_id, 'ceremony_preview.zip', 'https://example.com/files/preview.zip', 'image', 'preview', 'Sarah Johnson', 'photographer', 'pending', NULL);
END $$;