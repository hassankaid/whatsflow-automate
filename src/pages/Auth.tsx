import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Shield, Users } from 'lucide-react';

export default function Auth() {
  const { user, role, signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  const [isSignInLoading, setIsSignInLoading] = useState(false);
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);

  // Redirect authenticated users with roles to their dashboard
  // Wait for role to be fetched before redirecting
  if (!loading && user && role !== null) {
    return <Navigate to={role === 'admin' ? '/admin' : '/client'} replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSignInLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message
      });
    } else {
      toast({
        title: "Connexion réussie",
        description: "Redirection en cours..."
      });
    }

    setIsSignInLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSignUpLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const phoneNumber = formData.get('phoneNumber') as string;

    const { error } = await signUp(email, password, {
      full_name: fullName,
      phone_number: phoneNumber
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: error.message
      });
    } else {
      toast({
        title: "Inscription réussie",
        description: "Vérifiez votre email pour confirmer votre compte."
      });
    }

    setIsSignUpLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full glass">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FlowMessage
            </h1>
            <p className="text-muted-foreground mt-2">
              Plateforme de messagerie WhatsApp professionnelle
            </p>
          </div>
        </div>

        {/* Auth Forms */}
        <Card className="glass">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Authentification</CardTitle>
            <CardDescription className="text-center">
              Connectez-vous à votre compte FlowMessage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="admin@flowmessage.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSignInLoading}
                  >
                    {isSignInLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nom complet</Label>
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Numéro de téléphone</Label>
                    <Input
                      id="signup-phone"
                      name="phoneNumber"
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSignUpLoading}
                  >
                    {isSignUpLoading ? "Inscription..." : "S'inscrire"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
              <h3 className="font-medium">Sécurisé</h3>
              <p className="text-xs text-muted-foreground">Données protégées</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-accent mx-auto mb-2" />
              <h3 className="font-medium">Multi-clients</h3>
              <p className="text-xs text-muted-foreground">Gestion centralisée</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}