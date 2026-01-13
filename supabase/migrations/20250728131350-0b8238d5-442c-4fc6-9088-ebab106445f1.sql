-- Add status field to track team member invitation status
ALTER TABLE public.team_member_contacts 
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';

-- Add check constraint for valid status values
ALTER TABLE public.team_member_contacts 
ADD CONSTRAINT team_member_contacts_status_check 
CHECK (status IN ('pending', 'sent', 'failed', 'joined', 'left'));

-- Add index for better performance on status queries
CREATE INDEX idx_team_member_contacts_status ON public.team_member_contacts(status);