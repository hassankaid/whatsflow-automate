-- Créer un nouvel utilisateur admin
-- Vous devrez d'abord vous inscrire via l'interface avec contact@hassankaid.com
-- Puis exécuter cette requête pour lui assigner le rôle admin

-- Supprimer l'ancien rôle s'il existe
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'contact@hassankaid.com'
);

-- Note: Après l'inscription, trouvez l'ID du nouvel utilisateur et remplacez USER_ID_HERE
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('USER_ID_ICI', 'admin');