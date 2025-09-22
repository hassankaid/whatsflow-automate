-- Rs - Fix pour nettoyer complètement l'utilisateur contact@hassankaid.com
-- et résoudre les problèmes de suppression

-- D'abord, obtenir l'ID de l'utilisateur problématique
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Récupérer l'UUID de l'utilisateur
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'contact@hassankaid.com';
    
    IF user_uuid IS NOT NULL THEN
        -- Supprimer toutes les données liées dans l'ordre correct
        
        -- 1. Supprimer de user_roles
        DELETE FROM public.user_roles WHERE user_id = user_uuid;
        RAISE NOTICE 'Supprimé user_roles pour user_id: %', user_uuid;
        
        -- 2. Supprimer de profiles  
        DELETE FROM public.profiles WHERE user_id = user_uuid;
        RAISE NOTICE 'Supprimé profiles pour user_id: %', user_uuid;
        
        -- 3. Supprimer de clients si il y en a
        DELETE FROM public.clients WHERE user_id = user_uuid;
        RAISE NOTICE 'Supprimé clients pour user_id: %', user_uuid;
        
        -- 4. Supprimer de whatsapp_connections si il y en a
        DELETE FROM public.whatsapp_connections WHERE user_id = user_uuid;
        RAISE NOTICE 'Supprimé whatsapp_connections pour user_id: %', user_uuid;
        
        -- 5. Supprimer de messages (from_user_id) si il y en a
        DELETE FROM public.messages WHERE from_user_id = user_uuid;
        RAISE NOTICE 'Supprimé messages pour from_user_id: %', user_uuid;
        
        -- 6. Supprimer de campaigns (created_by) si il y en a
        DELETE FROM public.campaigns WHERE created_by = user_uuid;
        RAISE NOTICE 'Supprimé campaigns pour created_by: %', user_uuid;
        
        -- 7. Supprimer de message_templates (created_by) si il y en a
        DELETE FROM public.message_templates WHERE created_by = user_uuid;
        RAISE NOTICE 'Supprimé message_templates pour created_by: %', user_uuid;
        
        -- 8. Finalement, supprimer l'utilisateur de auth.users
        DELETE FROM auth.users WHERE id = user_uuid;
        RAISE NOTICE 'Supprimé auth.users pour id: %', user_uuid;
        
        RAISE NOTICE 'Utilisateur contact@hassankaid.com complètement supprimé';
    ELSE
        RAISE NOTICE 'Utilisateur contact@hassankaid.com non trouvé';
    END IF;
END $$;