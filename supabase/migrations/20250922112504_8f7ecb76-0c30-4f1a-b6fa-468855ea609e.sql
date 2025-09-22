-- Assign client role to existing user
INSERT INTO public.user_roles (user_id, role)
VALUES ('40096b04-dae8-4f70-a4b7-846511585cc3', 'client')
ON CONFLICT (user_id, role) DO NOTHING;