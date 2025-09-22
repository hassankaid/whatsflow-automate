import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Shield,
  Wifi
} from "lucide-react";
import { useState } from "react";

const WhatsAppConnection = () => {
  const [connectionStep, setConnectionStep] = useState<'qr' | 'connecting' | 'connected'>('qr');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshQR = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const mockConnect = () => {
    setConnectionStep('connecting');
    setTimeout(() => {
      setConnectionStep('connected');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Connexion WhatsApp</h1>
            <p className="text-muted-foreground">
              Connectez votre compte WhatsApp pour commencer l'automatisation
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* QR Code Section */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Code QR de Connexion
                </CardTitle>
              </CardHeader>
              <CardContent>
                {connectionStep === 'qr' && (
                  <div className="text-center">
                    <div className="bg-white p-8 rounded-xl mb-6 inline-block">
                      <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <QrCode className="h-32 w-32 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-600">Code QR WhatsApp</p>
                    </div>
                    
                    <Button 
                      onClick={handleRefreshQR}
                      variant="outline" 
                      disabled={isRefreshing}
                      className="mb-4"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Actualiser le QR Code
                    </Button>
                    
                    <Button 
                      onClick={mockConnect}
                      className="w-full bg-gradient-to-r from-primary to-whatsapp-light"
                    >
                      Simuler la connexion
                    </Button>
                  </div>
                )}

                {connectionStep === 'connecting' && (
                  <div className="text-center py-8">
                    <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <h3 className="text-lg font-semibold mb-2">Connexion en cours...</h3>
                    <p className="text-muted-foreground">Vérification de votre compte WhatsApp</p>
                  </div>
                )}

                {connectionStep === 'connected' && (
                  <div className="text-center py-8">
                    <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-green-500">Connecté avec succès !</h3>
                    <p className="text-muted-foreground mb-4">Votre compte WhatsApp est maintenant connecté</p>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      +33 6 12 34 56 78
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Ouvrez WhatsApp sur votre téléphone</p>
                        <p className="text-sm text-muted-foreground">Assurez-vous d'avoir la dernière version</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Allez dans Paramètres → Appareils connectés</p>
                        <p className="text-sm text-muted-foreground">Ou Menu → WhatsApp Web</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Scannez le QR code ci-contre</p>
                        <p className="text-sm text-muted-foreground">Pointez votre caméra vers l'écran</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Sécurité & Confidentialité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Connexion chiffrée de bout en bout</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Aucun accès à vos messages personnels</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Vous pouvez vous déconnecter à tout moment</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Conformité RGPD garantie</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              {connectionStep === 'connected' && (
                <Card className="border-green-500/20 bg-green-500/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="font-medium text-green-500">WhatsApp connecté</p>
                        <p className="text-xs text-muted-foreground">Dernière synchronisation : maintenant</p>
                      </div>
                      <Wifi className="h-4 w-4 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConnection;