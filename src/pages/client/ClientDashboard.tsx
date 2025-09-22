import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  TrendingUp, 
  Phone,
  Eye,
  Calendar,
  LogOut,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function ClientDashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt!"
    });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Mon Dashboard
            </h1>
            <p className="text-muted-foreground">
              Bienvenue, {user?.user_metadata?.full_name || user?.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-accent border-accent">
              Client
            </Badge>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <Card className="glass border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <CardTitle>Statut WhatsApp</CardTitle>
              </div>
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                En attente
              </Badge>
            </div>
            <CardDescription>
              Votre connexion WhatsApp n'est pas encore configurée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Contactez votre administrateur pour configurer votre connexion WhatsApp et commencer à recevoir des messages.
            </p>
            <Button variant="outline" disabled>
              Configuration en attente
            </Button>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Reçus</CardTitle>
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
              <CardTitle className="text-sm font-medium">Messages Lus</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Taux de lecture: 0%
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">
                Ce mois-ci
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Message History */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Historique des Messages
            </CardTitle>
            <CardDescription>
              Les messages que vous avez reçus récemment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">Aucun message reçu</h3>
              <p className="text-sm max-w-sm mx-auto">
                Vos messages apparaîtront ici une fois que votre administrateur
                aura configuré votre connexion WhatsApp et envoyé des messages.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Timeline */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Activité Récente
            </CardTitle>
            <CardDescription>
              Chronologie de vos interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="p-2 rounded-full bg-primary/10">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Compte créé</p>
                  <p className="text-xs text-muted-foreground">
                    Votre compte FlowMessage a été créé avec succès
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  Aujourd'hui
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Informations du Profil</CardTitle>
            <CardDescription>
              Vos informations personnelles (lecture seule)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nom complet</Label>
                <p className="mt-1">{user?.user_metadata?.full_name || 'Non renseigné'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="mt-1">{user?.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Téléphone</Label>
                <p className="mt-1">{user?.user_metadata?.phone_number || 'Non renseigné'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Statut</Label>
                <Badge variant="outline" className="mt-1">Client Actif</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}