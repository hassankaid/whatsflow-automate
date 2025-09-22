import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CreateClientForm } from '@/components/CreateClientForm';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Settings,
  UserPlus,
  Phone,
  Send,
  BarChart3,
  LogOut,
  MessageCircle,
  Zap,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [showCreateClient, setShowCreateClient] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt!"
    });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dashboard Admin
            </h1>
            <p className="text-muted-foreground">
              Bienvenue, {user?.user_metadata?.full_name || user?.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-primary border-primary">
              Administrateur
            </Badge>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Aucun client connecté
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Envoyés</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Aujourd'hui
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connexions Actives</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                WhatsApp connecté
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-muted-foreground">
                Messages délivrés
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Création de client */}
        {showCreateClient && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Créer un nouveau client</h2>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateClient(false)}
              >
                Retour au dashboard
              </Button>
            </div>
            <CreateClientForm />
          </div>
        )}

        {!showCreateClient && (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Nouveau Client
                  </CardTitle>
                  <CardDescription>
                    Créer un client avec lien d'onboarding
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => setShowCreateClient(true)}
                  >
                    Créer Client
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Campagne de Messages
                  </CardTitle>
                  <CardDescription>
                    Envoyer des messages en masse à vos clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Créer une campagne
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Statistiques
                  </CardTitle>
                  <CardDescription>
                    Analyser les performances de vos campagnes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Voir les statistiques
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
                <CardDescription>
                  Les dernières actions sur la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune activité récente</p>
                  <p className="text-sm">Les actions des clients apparaîtront ici</p>
                </div>
              </CardContent>
            </Card>

            {/* Settings Quick Access */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration
                </CardTitle>
                <CardDescription>
                  Paramètres de la plateforme et intégrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Templates de Messages
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Zap className="mr-2 h-4 w-4" />
                    Intégrations WhatsApp
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres Généraux
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}