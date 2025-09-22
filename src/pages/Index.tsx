import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import HeroSection from "@/components/HeroSection";
import Dashboard from "@/components/Dashboard";
import WhatsAppConnection from "@/components/WhatsAppConnection";
import { MessageSquare, LayoutDashboard, Smartphone, Users, Settings } from "lucide-react";

const Index = () => {
  const [currentView, setCurrentView] = useState<'hero' | 'dashboard' | 'whatsapp' | 'groups'>('hero');

  const navigation = [
    { id: 'hero', label: 'Accueil', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <Smartphone className="h-4 w-4" /> },
    { id: 'groups', label: 'Groupes', icon: <Users className="h-4 w-4" /> },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'whatsapp':
        return <WhatsAppConnection />;
      case 'groups':
        return (
          <div className="min-h-screen bg-background">
            <div className="container mx-auto px-6 py-8">
              <h1 className="text-3xl font-bold mb-8">Gestion des Groupes</h1>
              <Card className="border-border/50">
                <CardContent className="p-8 text-center">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Fonctionnalité en développement</h3>
                  <p className="text-muted-foreground">
                    Cette section permettra de gérer vos groupes WhatsApp connectés.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      default:
        return <HeroSection />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-whatsapp-light rounded-lg flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">WhatsApp Automation</span>
            </div>
            
            <div className="flex items-center gap-2">
              {navigation.map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView(item.id as any)}
                  className={`flex items-center gap-2 ${
                    currentView === item.id 
                      ? "bg-gradient-to-r from-primary to-whatsapp-light text-white" 
                      : ""
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-16">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;