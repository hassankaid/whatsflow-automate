-- Fix security issues: set search_path for functions
CREATE OR REPLACE FUNCTION public.generate_onboarding_token()
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT encode(gen_random_bytes(32), 'base64url');
$$;

CREATE OR REPLACE FUNCTION public.use_onboarding_token(token_input TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token_record onboarding_tokens%ROWTYPE;
  client_uuid UUID;
BEGIN
  -- Find and validate token
  SELECT * INTO token_record 
  FROM onboarding_tokens 
  WHERE token = token_input 
    AND expires_at > now() 
    AND used_at IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Token invalide ou expiré';
  END IF;
  
  -- Mark token as used
  UPDATE onboarding_tokens 
  SET used_at = now() 
  WHERE id = token_record.id;
  
  RETURN token_record.client_id;
END;
$$;