-- Create admin user account
-- Note: This creates the user directly in the auth schema
-- The password will be hashed automatically by Supabase

-- First, let's insert the user into auth.users
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
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
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"email": "contact@hassankaid.com", "full_name": "Admin Hassan Kaid", "email_verified": true}'
);

-- Get the user ID for the admin user we just created
WITH admin_user AS (
    SELECT id FROM auth.users WHERE email = 'contact@hassankaid.com'
)
-- Insert profile for admin
INSERT INTO public.profiles (user_id, full_name)
SELECT id, 'Admin Hassan Kaid'
FROM admin_user;

-- Assign admin role
WITH admin_user AS (
    SELECT id FROM auth.users WHERE email = 'contact@hassankaid.com'
)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM admin_user;