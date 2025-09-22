import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, ExternalLink, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const createClientSchema = z.object({
  contact_email: z.string().email('Email invalide'),
  company_name: z.string().min(1, 'Nom de l\'entreprise requis'),
  industry: z.string().optional(),
  notes: z.string().optional(),
  phone_number: z.string().optional(),
  full_name: z.string().min(1, 'Nom complet requis'),
});

type CreateClientForm = z.infer<typeof createClientSchema>;

interface OnboardingResult {
  client_id: string;
  token: string;
  onboarding_url: string;
  expires_at: string;
}

export const CreateClientForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingResult, setOnboardingResult] = useState<OnboardingResult | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<CreateClientForm>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      contact_email: '',
      company_name: '',
      industry: '',
      notes: '',
      phone_number: '',
      full_name: '',
    },
  });

  const onSubmit = async (data: CreateClientForm) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour créer un client.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Generate secure token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_onboarding_token');

      if (tokenError) throw tokenError;

      const token = tokenData as string;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48); // 48 heures d'expiration

      // Create client record
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          contact_email: data.contact_email,
          company_name: data.company_name,
          industry: data.industry,
          notes: data.notes,
          user_id: user.id,
          onboarding_status: 'pending'
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Create onboarding token
      const { error: onboardingError } = await supabase
        .from('onboarding_tokens')
        .insert({
          token,
          client_id: clientData.id,
          expires_at: expiresAt.toISOString(),
          created_by: user.id,
          client_data: {
            full_name: data.full_name,
            phone_number: data.phone_number,
            contact_email: data.contact_email,
            company_name: data.company_name,
            industry: data.industry
          }
        });

      if (onboardingError) throw onboardingError;

      const onboardingUrl = `${window.location.origin}/onboarding/${token}`;

      setOnboardingResult({
        client_id: clientData.id,
        token,
        onboarding_url: onboardingUrl,
        expires_at: expiresAt.toISOString()
      });

      toast({
        title: "Client créé avec succès!",
        description: "Le lien d'onboarding a été généré.",
      });

      form.reset();
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le client. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié!",
        description: "Le lien a été copié dans le presse-papiers.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de copier le lien.",
      });
    }
  };

  if (onboardingResult) {
    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-success">Client créé avec succès!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Lien d'onboarding:</label>
            <div className="flex gap-2 mt-1">
              <Input
                value={onboardingResult.onboarding_url}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(onboardingResult.onboarding_url)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(onboardingResult.onboarding_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">
              <strong>Expire le:</strong> {new Date(onboardingResult.expires_at).toLocaleString('fr-FR')}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setOnboardingResult(null)}>
              Créer un autre client
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Créer un nouveau client</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet *</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean Dupont" {...field} />
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
                      <Input placeholder="jean@entreprise.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'entreprise *</FormLabel>
                    <FormControl>
                      <Input placeholder="ACME Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input placeholder="+33 1 23 45 67 89" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secteur d'activité</FormLabel>
                  <FormControl>
                    <Input placeholder="Commerce, Technologie, Santé..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes internes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notes sur le client, besoins spécifiques..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Ces notes ne seront pas visibles par le client
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Création en cours..." : "Créer le client et générer le lien d'onboarding"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};