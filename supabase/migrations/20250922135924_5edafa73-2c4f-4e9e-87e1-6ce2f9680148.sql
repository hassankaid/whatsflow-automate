-- Create onboarding tokens table
CREATE TABLE public.onboarding_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  client_data JSONB -- For storing pre-filled client data before client confirms
);

-- Enable RLS on onboarding_tokens
ALTER TABLE public.onboarding_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for onboarding_tokens
CREATE POLICY "Admins can manage all onboarding tokens" 
ON public.onboarding_tokens 
FOR ALL 
USING (is_admin());

CREATE POLICY "Public can read valid unused tokens" 
ON public.onboarding_tokens 
FOR SELECT 
USING (
  expires_at > now() 
  AND used_at IS NULL
);

-- Add onboarding status to clients table
ALTER TABLE public.clients 
ADD COLUMN onboarding_status TEXT DEFAULT 'pending',
ADD COLUMN onboarded_at TIMESTAMP WITH TIME ZONE;

-- Create trigger for timestamps on onboarding_tokens
CREATE TRIGGER update_onboarding_tokens_updated_at
BEFORE UPDATE ON public.onboarding_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate secure tokens
CREATE OR REPLACE FUNCTION public.generate_onboarding_token()
RETURNS TEXT
LANGUAGE SQL
AS $$
  SELECT encode(gen_random_bytes(32), 'base64url');
$$;

-- Create function to validate and use onboarding token
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