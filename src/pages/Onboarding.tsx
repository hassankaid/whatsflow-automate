import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import WhatsAppConnection from '@/components/WhatsAppConnection';
import { CheckCircle, AlertCircle, Loader2, Smartphone } from 'lucide-react';

const onboardingSchema = z.object({
  full_name: z.string().min(1, 'Nom complet requis'),
  phone_number: z.string().min(1, 'Numéro de téléphone requis'),
  contact_email: z.string().email('Email invalide'),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

interface TokenData {
  id: string;
  client_id: string;
  client_data: any;
  expires_at: string;
}

type OnboardingStep = 'loading' | 'invalid' | 'form' | 'whatsapp' | 'complete';

export default function Onboarding() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<OnboardingStep>('loading');
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      full_name: '',
      phone_number: '',
      contact_email: '',
    },
  });

  useEffect(() => {
    if (!token) {
      setStep('invalid');
      return;
    }
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const { data, error } = await supabase
        .from('onboarding_tokens')
        .select(`
          id,
          client_id,
          client_data,
          expires_at,
          used_at
        `)
        .eq('token', token)
        .maybeSingle();

      if (error || !data) {
        console.error('Token validation error:', error);
        setStep('invalid');
        return;
      }

      if (data.used_at) {
        toast({
          variant: "destructive",
          title: "Lien déjà utilisé",
          description: "Ce lien d'onboarding a déjà été utilisé.",
        });
        setStep('invalid');
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        toast({
          variant: "destructive",
          title: "Lien expiré",
          description: "Ce lien d'onboarding a expiré.",
        });
        setStep('invalid');
        return;
      }

      // Pre-fill form with client data
      if (data.client_data && typeof data.client_data === 'object') {
        form.setValue('full_name', (data.client_data as any).full_name || '');
        form.setValue('phone_number', (data.client_data as any).phone_number || '');
        form.setValue('contact_email', (data.client_data as any).contact_email || '');
      }

      setTokenData(data as TokenData);
      setStep('form');
    } catch (error) {
      console.error('Erreur lors de la validation du token:', error);
      setStep('invalid');
    }
  };

  const onSubmitForm = async (data: OnboardingForm) => {
    if (!tokenData) return;

    setIsLoading(true);
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.contact_email,
        password: Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12), // Generate random password
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: data.full_name,
            phone_number: data.phone_number,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update client record with user_id and form data
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            user_id: authData.user.id,
            contact_email: data.contact_email,
            onboarding_status: 'profile_completed'
          })
          .eq('id', tokenData.client_id);

        if (updateError) throw updateError;

        toast({
          title: "Compte créé!",
          description: "Votre compte a été créé. Passons maintenant à la connexion WhatsApp.",
        });

        setStep('whatsapp');
      }
    } catch (error: any) {
      console.error('Erreur lors de la création du compte:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de créer votre compte. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onWhatsAppConnected = async () => {
    if (!tokenData) return;

    try {
      // Mark token as used
      const { error: tokenError } = await supabase
        .rpc('use_onboarding_token', { token_input: token });

      if (tokenError) throw tokenError;

      // Update client status
      const { error: clientError } = await supabase
        .from('clients')
        .update({
          onboarding_status: 'completed',
          onboarded_at: new Date().toISOString()
        })
        .eq('id', tokenData.client_id);

      if (clientError) throw clientError;

      setStep('complete');

      toast({
        title: "Onboarding terminé!",
        description: "Votre compte est maintenant configuré. Redirection vers votre dashboard...",
      });

      // Redirect to client dashboard after 3 seconds
      setTimeout(() => {
        navigate('/client');
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la finalisation. Veuillez contacter le support.",
      });
    }
  };

  const getProgressValue = () => {
    switch (step) {
      case 'form': return 25;
      case 'whatsapp': return 75;
      case 'complete': return 100;
      default: return 0;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'loading': return 'Vérification...';
      case 'invalid': return 'Lien invalide';
      case 'form': return 'Vos informations';
      case 'whatsapp': return 'Connexion WhatsApp';
      case 'complete': return 'Onboarding terminé!';
      default: return '';
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p>Vérification de votre lien d'onboarding...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8 space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Lien invalide ou expiré</h2>
            <p className="text-muted-foreground">
              Ce lien d'onboarding n'est pas valide ou a expiré. 
              Veuillez contacter votre administrateur pour obtenir un nouveau lien.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Bienvenue dans WhatsApp Marketing</h1>
            <p className="text-muted-foreground">
              Configurons votre compte en quelques étapes simples
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression de l'onboarding</span>
              <span>{getProgressValue()}%</span>
            </div>
            <Progress value={getProgressValue()} className="h-2" />
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {step === 'whatsapp' && <Smartphone className="h-5 w-5" />}
                {step === 'complete' && <CheckCircle className="h-5 w-5 text-success" />}
                {getStepTitle()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === 'form' && (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet *</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nom complet" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contact_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input placeholder="votre@email.com" type="email" {...field} />
                          </FormControl>
                          <FormDescription>
                            Cet email sera utilisé pour créer votre compte
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro de téléphone *</FormLabel>
                          <FormControl>
                            <Input placeholder="+33 1 23 45 67 89" {...field} />
                          </FormControl>
                          <FormDescription>
                            Le numéro qui sera associé à votre compte WhatsApp
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Création du compte...
                        </>
                      ) : (
                        'Créer mon compte'
                      )}
                    </Button>
                  </form>
                </Form>
              )}

              {step === 'whatsapp' && (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <p>Parfait! Maintenant connectons votre WhatsApp.</p>
                    <p className="text-sm text-muted-foreground">
                      Scannez le QR code ci-dessous avec l'appareil où WhatsApp est installé.
                    </p>
                  </div>
                  <WhatsAppConnection onConnected={onWhatsAppConnected} />
                </div>
              )}

              {step === 'complete' && (
                <div className="text-center space-y-4">
                  <CheckCircle className="h-16 w-16 text-success mx-auto" />
                  <h3 className="text-xl font-semibold">Félicitations!</h3>
                  <p className="text-muted-foreground">
                    Votre compte est maintenant configuré et prêt à utiliser.
                    Vous allez être redirigé vers votre dashboard.
                  </p>
                  <div className="pt-4">
                    <Button onClick={() => navigate('/client')}>
                      Accéder au dashboard
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}