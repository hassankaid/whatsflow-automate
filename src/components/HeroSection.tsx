import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Users, Calendar, BarChart3, Shield, Zap } from "lucide-react";

const HeroSection = () => {
  const features = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Messages Automatisés",
      description: "Envoyez des messages texte, images, vidéos et documents de manière programmée"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Gestion des Groupes",
      description: "Synchronisez et gérez tous vos groupes WhatsApp depuis une interface unique"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Programmation",
      description: "Planifiez vos envois à l'avance pour toucher votre audience au bon moment"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analytics",
      description: "Suivez les performances de vos campagnes avec des statistiques détaillées"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Sécurisé",
      description: "Connexion sécurisée à votre compte WhatsApp avec monitoring en temps réel"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "API Complète",
      description: "Intégrez facilement avec vos outils existants via notre API REST"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-20 pb-16">
        <div className="text-center mb-16">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium text-primary mb-6">
              <Zap className="h-4 w-4" />
              Automatisation WhatsApp Professional
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Automatisez votre
              <span className="bg-gradient-to-r from-primary to-whatsapp-light bg-clip-text text-transparent block">
                WhatsApp Business
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Connectez votre compte WhatsApp et automatisez l'envoi de messages, médias et sondages 
              à vos contacts et groupes. Interface simple, API puissante, résultats garantis.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="bg-gradient-to-r from-primary to-whatsapp-light hover:from-primary/90 hover:to-whatsapp-light/90 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
              Commencer gratuitement
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-primary/20 hover:border-primary/40">
              Voir la démonstration
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 hover:border-primary/20 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="border-primary/20 bg-gradient-to-r from-card to-primary/5 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">Prêt à automatiser votre WhatsApp ?</h2>
              <p className="text-muted-foreground mb-6 text-lg">
                Rejoignez des milliers d'entrepreneurs qui font confiance à notre plateforme
              </p>
              <Button size="lg" className="bg-gradient-to-r from-primary to-whatsapp-light hover:from-primary/90 hover:to-whatsapp-light/90 text-white px-8 py-4 text-lg font-semibold">
                Démarrer maintenant
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;