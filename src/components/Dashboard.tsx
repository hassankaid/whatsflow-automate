import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  Send, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Plus,
  BarChart3
} from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Messages Envoyés",
      value: "2,547",
      change: "+12%",
      icon: <Send className="h-5 w-5" />,
      color: "text-primary"
    },
    {
      title: "Messages Programmés",
      value: "18",
      change: "+5",
      icon: <Clock className="h-5 w-5" />,
      color: "text-blue-500"
    },
    {
      title: "Groupes Connectés",
      value: "12",
      change: "+2",
      icon: <Users className="h-5 w-5" />,
      color: "text-green-500"
    },
    {
      title: "Taux de Livraison",
      value: "98.2%",
      change: "+0.3%",
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-emerald-500"
    }
  ];

  const recentMessages = [
    {
      id: 1,
      type: "Texte",
      recipient: "Groupe Formation",
      status: "Livré",
      date: "Il y a 2h",
      preview: "Rappel : Formation demain à 14h..."
    },
    {
      id: 2,
      type: "Image",
      recipient: "Prospects Webinaire",
      status: "Programmé",
      date: "Dans 1h",
      preview: "Invitation webinaire + image promo"
    },
    {
      id: 3,
      type: "Document",
      recipient: "Clients Premium",
      status: "Livré",
      date: "Il y a 4h",
      preview: "Guide complet - Version 2.0"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Livré": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Programmé": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "En cours": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tableau de Bord</h1>
            <p className="text-muted-foreground">Gérez vos automatisations WhatsApp</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="lg">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button size="lg" className="bg-gradient-to-r from-primary to-whatsapp-light">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Message
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-green-500 font-medium">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-primary/10 ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Messages Récents */}
          <div className="lg:col-span-2">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages Récents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMessages.map((message) => (
                    <div key={message.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:border-primary/20 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline">{message.type}</Badge>
                          <Badge className={getStatusColor(message.status)}>
                            {message.status}
                          </Badge>
                        </div>
                        <p className="font-medium mb-1">{message.recipient}</p>
                        <p className="text-sm text-muted-foreground">{message.preview}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{message.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Rapides */}
          <div>
            <Card className="border-border/50 mb-6">
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="ghost">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Créer un message
                </Button>
                <Button className="w-full justify-start" variant="ghost">
                  <Users className="h-4 w-4 mr-2" />
                  Gérer les groupes
                </Button>
                <Button className="w-full justify-start" variant="ghost">
                  <Calendar className="h-4 w-4 mr-2" />
                  Programmer un envoi
                </Button>
                <Button className="w-full justify-start" variant="ghost">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Voir les stats
                </Button>
              </CardContent>
            </Card>

            {/* Status WhatsApp */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  WhatsApp Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Connexion</span>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      Connecté
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Dernière sync</span>
                    <span className="text-xs text-muted-foreground">Il y a 2 min</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Reconnecter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;