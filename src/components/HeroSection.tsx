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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-flowmessage/20 to-flowmessage-light/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-flowmessage-light/20 to-flowmessage/20 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-24 pb-20 relative z-10">
        <div className="text-center mb-20">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 glass px-6 py-3 rounded-full text-sm font-medium text-flowmessage mb-8 animate-float">
              <Zap className="h-5 w-5" />
              Automatisation FlowMessage Professional
              <div className="w-2 h-2 bg-flowmessage rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Automatisez votre
              </span>
              <br />
              <span className="bg-gradient-to-r from-flowmessage via-flowmessage-light to-flowmessage bg-clip-text text-transparent animate-glow">
                communication WhatsApp
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
              Connectez votre compte WhatsApp et automatisez l'envoi de messages, médias et 
              sondages à vos contacts et groupes. Interface moderne, API puissante, résultats garantis.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Button size="lg" className="bg-gradient-to-r from-flowmessage to-flowmessage-light hover:from-flowmessage/90 hover:to-flowmessage-light/90 text-white px-10 py-7 text-lg font-semibold shadow-2xl hover:shadow-flowmessage/25 transition-all duration-300 animate-glow">
              Commencer gratuitement
              <div className="absolute inset-0 bg-gradient-to-r from-flowmessage to-flowmessage-light rounded-lg blur-lg opacity-30 -z-10"></div>
            </Button>
            <Button variant="outline" size="lg" className="px-10 py-7 text-lg border-flowmessage/30 text-flowmessage hover:glass hover:border-flowmessage/50 transition-all duration-300">
              Voir la démonstration
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="glass-card p-8 rounded-2xl hover:shadow-2xl hover:shadow-flowmessage/10 transition-all duration-500 group hover:-translate-y-2"
              style={{animationDelay: `${index * 100}ms`}}
            >
              <div className="flex items-start gap-6">
                <div className="p-4 bg-gradient-to-r from-flowmessage/20 to-flowmessage-light/20 rounded-2xl text-flowmessage group-hover:from-flowmessage/30 group-hover:to-flowmessage-light/30 transition-all duration-300 group-hover:scale-110">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-3 text-white group-hover:text-flowmessage transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="glass-card max-w-5xl mx-auto p-12 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-flowmessage/5 to-flowmessage-light/5 rounded-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Prêt à révolutionner votre communication ?
              </h2>
              <p className="text-gray-400 mb-8 text-xl max-w-2xl mx-auto">
                Rejoignez des milliers d'entrepreneurs qui font confiance à FlowMessage
              </p>
              <Button size="lg" className="bg-gradient-to-r from-flowmessage to-flowmessage-light hover:from-flowmessage/90 hover:to-flowmessage-light/90 text-white px-12 py-6 text-xl font-semibold shadow-2xl hover:shadow-flowmessage/25 transition-all duration-300 animate-glow">
                Démarrer maintenant
                <div className="absolute inset-0 bg-gradient-to-r from-flowmessage to-flowmessage-light rounded-lg blur-lg opacity-40 -z-10"></div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;