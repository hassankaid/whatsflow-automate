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
import { useState, useEffect, useRef } from "react";
import QRCode from 'qrcode';
import { useToast } from "./ui/use-toast";

interface WhatsAppConnectionProps {
  onConnected?: () => void;
}

interface WhatsAppMessage {
  type: 'qr' | 'connecting' | 'connected' | 'error';
  qr?: string;
  message?: string;
  device?: {
    name: string;
    id: string;
  };
  timestamp?: number;
}

const WhatsAppConnection = ({ onConnected }: WhatsAppConnectionProps = {}) => {
  const [connectionStep, setConnectionStep] = useState<'qr' | 'connecting' | 'connected'>('qr');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<{name: string; id: string} | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      const wsUrl = `wss://xjpoivlflcvagnfyogol.functions.supabase.co/whatsapp-connection/ws`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        toast({
          title: "Service connecté",
          description: "Prêt à générer le QR code WhatsApp",
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data: WhatsAppMessage = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Erreur de connexion",
          description: "Impossible de se connecter au service WhatsApp",
          variant: "destructive",
        });
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        // Retry connection after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  };

  const handleWebSocketMessage = async (data: WhatsAppMessage) => {
    switch (data.type) {
      case 'qr':
        if (data.qr) {
          await generateQRCodeFromData(data.qr);
        }
        break;
      case 'connecting':
        setConnectionStep('connecting');
        break;
      case 'connected':
        setConnectionStep('connected');
        if (data.device) {
          setDeviceInfo(data.device);
        }
        onConnected?.();
        toast({
          title: "WhatsApp connecté",
          description: `Connecté depuis ${data.device?.name || 'votre appareil'}`,
        });
        break;
      case 'error':
        toast({
          title: "Erreur",
          description: data.message || 'Une erreur est survenue',
          variant: "destructive",
        });
        break;
    }
  };

  const generateQRCodeFromData = async (qrData: string) => {
    try {
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, qrData, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      }

      // Générer aussi une URL pour affichage alternatif
      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    }
  };

  const handleRefreshQR = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setIsRefreshing(true);
      wsRef.current.send(JSON.stringify({ type: 'refresh-qr' }));
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const mockConnect = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'mock-connect' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* QR Code Section */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Code QR de Connexion WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connectionStep === 'qr' && (
            <div className="text-center">
              <div className="bg-white p-6 rounded-xl mb-6 inline-block shadow-sm border">
                {/* Canvas pour le QR code réel */}
                <canvas 
                  ref={canvasRef} 
                  className="mx-auto block"
                  style={{ maxWidth: '200px', height: 'auto' }}
                />
                {/* Fallback si le canvas ne fonctionne pas */}
                {!canvasRef.current && qrCodeUrl && (
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code WhatsApp" 
                    className="mx-auto block"
                    style={{ maxWidth: '200px', height: 'auto' }}
                  />
                )}
                <p className="text-xs text-gray-600 mt-2">
                  Scannez avec WhatsApp
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleRefreshQR}
                  variant="outline" 
                  disabled={isRefreshing}
                  className="w-full"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Génération...' : 'Nouveau QR Code'}
                </Button>
                
                <Button 
                  onClick={mockConnect}
                  className="w-full bg-gradient-to-r from-primary to-primary/80"
                >
                  Simuler la connexion (pour test)
                </Button>
              </div>
            </div>
          )}

          {connectionStep === 'connecting' && (
            <div className="text-center py-8">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Connexion en cours...</h3>
              <p className="text-muted-foreground">Vérification de votre scan WhatsApp</p>
            </div>
          )}

          {connectionStep === 'connected' && (
            <div className="text-center py-8">
              <div className="h-12 w-12 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-success">WhatsApp connecté !</h3>
              <p className="text-muted-foreground mb-4">
                {deviceInfo ? `Connecté depuis ${deviceInfo.name}` : 'Votre compte est maintenant lié à la plateforme'}
              </p>
              <Badge className="bg-success/10 text-success border-success/20">
                Connexion active
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Comment se connecter
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
                <p className="text-sm text-muted-foreground">Assurez-vous d'avoir la dernière version installée</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Allez dans les paramètres</p>
                <p className="text-sm text-muted-foreground">
                  <strong>Android :</strong> Menu (⋮) → Appareils connectés<br/>
                  <strong>iPhone :</strong> Réglages → WhatsApp Web/Desktop
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Scannez le QR code</p>
                <p className="text-sm text-muted-foreground">
                  Appuyez sur "Connecter un appareil" puis pointez votre caméra vers le QR code ci-dessus
                </p>
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
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>Connexion chiffrée bout-à-bout (même niveau que WhatsApp)</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>Aucun accès à vos conversations personnelles</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>Vous gardez le contrôle total de votre compte</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>Déconnexion possible à tout moment depuis WhatsApp</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      {connectionStep === 'connected' && (
        <Card className="border-success/20 bg-success/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-success rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="font-medium text-success">WhatsApp connecté</p>
                <p className="text-xs text-muted-foreground">Dernière synchronisation : maintenant</p>
              </div>
              <Wifi className="h-4 w-4 text-success" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WhatsAppConnection;