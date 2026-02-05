-- Assign photographer role to current user for testing
INSERT INTO user_roles (user_id, role) 
VALUES (auth.uid(), 'photographer')
ON CONFLICT (user_id, role) DO NOTHING;