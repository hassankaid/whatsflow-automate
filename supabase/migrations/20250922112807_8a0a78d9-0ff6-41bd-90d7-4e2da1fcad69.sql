-- Create admin user account with simplified approach
-- Insert directly into auth.users with minimal required fields
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'contact@hassankaid.com',
    crypt('Imou18Zizou21@', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"email": "contact@hassankaid.com", "full_name": "Admin Hassan Kaid", "email_verified": true}',
    false
);

-- Get the user ID and create profile and role in one go
WITH admin_user AS (
    SELECT id FROM auth.users WHERE email = 'contact@hassankaid.com' LIMIT 1
)
INSERT INTO public.profiles (user_id, full_name)
SELECT id, 'Admin Hassan Kaid'
FROM admin_user
ON CONFLICT (user_id) DO NOTHING;

-- Assign admin role
WITH admin_user AS (
    SELECT id FROM auth.users WHERE email = 'contact@hassankaid.com' LIMIT 1
)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM admin_user
ON CONFLICT (user_id, role) DO NOTHING;