import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { RefreshCw, Smartphone, Shield, Lock, Users, Send, MessageCircle, CheckCircle, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface WhatsAppConnectionProps {
  onConnectionEstablished?: () => void;
  onConnected?: () => void;
}

interface MessageData {
  id: string;
  body: string;
  from: string;
  fromMe: boolean;
  timestamp: number;
  contact?: {
    name: string;
    pushname: string;
  };
}

interface WhatsAppMessage {
  type: 'qr' | 'connecting' | 'connected' | 'error' | 'initializing' | 'message_received' | 'message_sent' | 'conversations';
  qr?: string;
  message?: string;
  device?: {
    name: string;
    id: string;
    platform?: string;
  };
  timestamp?: number;
  // Direct message fields
  id?: string;
  body?: string;
  from?: string;
  fromMe?: boolean;
  contact?: {
    name: string;
    pushname: string;
  };
  // Conversations data
  data?: any[];
}

export default function WhatsAppConnection({ onConnectionEstablished, onConnected }: WhatsAppConnectionProps) {
  const [connectionStep, setConnectionStep] = useState<'qr' | 'connecting' | 'connected'>('qr');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<{ name: string; id: string; platform?: string } | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

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
      const wsUrl = `wss://xjpoivlflcvagnfyogol.functions.supabase.co/whatsapp-connection`;
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
        setTimeout(connectWebSocket, 5000);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  };

  const handleWebSocketMessage = async (data: WhatsAppMessage) => {
    console.log('Received WebSocket message:', data);
    
    switch (data.type) {
      case 'qr':
        console.log('Received QR code');
        setConnectionStep('qr');
        if (data.qr) {
          await generateQRCodeFromData(data.qr);
        }
        break;
      case 'initializing':
        console.log('WhatsApp client initializing...');
        setConnectionStep('qr');
        toast({
          title: "Initialisation",
          description: typeof data.message === 'string' ? data.message : "Initialisation du service WhatsApp...",
        });
        break;
      case 'connecting':
        console.log('WhatsApp connecting...');
        setConnectionStep('connecting');
        break;
      case 'connected':
        console.log('WhatsApp connected!');
        setConnectionStep('connected');
        if (data.device) {
          setDeviceInfo(data.device);
        }
        onConnectionEstablished?.();
        onConnected?.();
        toast({
          title: "WhatsApp connecté",
          description: `Connecté depuis ${data.device?.name || 'votre appareil'}`,
        });
        break;
      case 'error':
        console.error('WhatsApp error:', data.message);
        setConnectionStep('qr');
        toast({
          title: "Erreur",
          description: typeof data.message === 'string' ? data.message : 'Une erreur est survenue',
          variant: "destructive",
        });
        break;
      case 'message_received':
        console.log('Message reçu:', data);
        
        const newMsg: MessageData = {
          id: data.id || `msg_${Date.now()}`,
          body: data.body || 'Message reçu',
          from: data.from || 'unknown',
          fromMe: data.fromMe || false,
          timestamp: data.timestamp || Date.now(),
          contact: data.contact
        };
        
        setMessages(prev => [...prev, newMsg]);
        
        toast({
          title: "Nouveau message WhatsApp",
          description: `${newMsg.contact?.name || 'Contact'}: ${newMsg.body}`,
        });
        break;
      case 'message_sent':
        toast({
          title: "Message envoyé",
          description: "Votre message a été envoyé avec succès",
        });
        break;
      case 'conversations':
        console.log('Conversations reçues:', data.data);
        setConversations(data.data || []);
        break;
      default:
        console.log('Unknown message type:', data.type);
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
      setQrCodeData(qrData);
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    }
  };

  const refreshQRCode = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'refresh-qr' }));
      toast({
        title: "QR Code actualisé",
        description: "Un nouveau QR code va être généré",
      });
    }
  };

  const mockConnect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'mock-connect' }));
      setConnectionStep('connecting');
      toast({
        title: "Connexion en cours",
        description: "Simulation de la connexion WhatsApp...",
      });
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || !wsRef.current) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'send_message',
      to: selectedConversation,
      body: newMessage
    }));
    
    setNewMessage('');
  };

  const loadConversations = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'get_conversations' }));
    }
  };

  // Auto-load conversations when connected
  useEffect(() => {
    if (connectionStep === 'connected') {
      loadConversations();
      const interval = setInterval(loadConversations, 30000);
      return () => clearInterval(interval);
    }
  }, [connectionStep]);

  // QR Code Step
  if (connectionStep === 'qr') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Connexion WhatsApp - Simulation Ultra-Réaliste
          </CardTitle>
          <CardDescription>
            Scanner le QR code avec votre téléphone WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300">
              <canvas 
                ref={canvasRef} 
                className="mx-auto"
                style={{ maxWidth: '200px', height: 'auto' }}
              />
              {!qrCodeData && (
                <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                  <p className="text-gray-500">Génération du QR code...</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={refreshQRCode} variant="outline" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser QR
            </Button>
            <Button onClick={mockConnect} className="flex-1">
              <Smartphone className="h-4 w-4 mr-2" />
              Simuler Connexion
            </Button>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              🎯 <strong>Simulation Parfaite :</strong> Ce QR code fonctionne comme le vrai WhatsApp Web ! 
              Une fois scanné, vous aurez accès aux conversations simulées.
            </AlertDescription>
          </Alert>

          {/* Instructions */}
          <div className="space-y-4">
            <Separator />
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Comment se connecter
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>1. Ouvrez WhatsApp sur votre téléphone</p>
                <p>2. Menu (⋮) → Appareils connectés → Connecter un appareil</p>
                <p>3. Scannez le QR code ci-dessus</p>
                <p>4. Profitez de la simulation complète !</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Connecting Step
  if (connectionStep === 'connecting') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Connexion en cours
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Vérification de votre scan...</h3>
          <p className="text-gray-600">Connexion avec WhatsApp en cours</p>
        </CardContent>
      </Card>
    );
  }

  // Connected Step - Full Dashboard
  if (connectionStep === 'connected') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-green-600 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  WhatsApp Connecté - Simulation Active
                </CardTitle>
                <CardDescription>
                  {deviceInfo?.name} • {deviceInfo?.platform || 'Simulation Ultra-Réaliste'}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                ✓ Connecté
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversations Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Conversations ({conversations.length})
                </CardTitle>
                <Button onClick={loadConversations} size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {conversations.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Aucune conversation</p>
                    <p className="text-xs">Les messages simulés apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conv, index) => (
                      <div
                        key={conv.contact}
                        onClick={() => setSelectedConversation(conv.contact)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedConversation === conv.contact 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{conv.lastMessage?.contact?.name || `Contact ${index + 1}`}</p>
                            <p className="text-sm text-gray-600 truncate">
                              {conv.lastMessage?.body || 'Pas de message'}
                            </p>
                          </div>
                          {conv.unreadCount > 0 && (
                            <Badge variant="secondary" className="bg-green-500 text-white">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Panel */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedConversation ? `Chat avec ${selectedConversation}` : 'Sélectionnez une conversation'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedConversation ? (
                <div className="space-y-4">
                  <ScrollArea className="h-48 p-4 border rounded-lg">
                    {messages
                      .filter(msg => msg.from === selectedConversation || 
                        (msg.fromMe && selectedConversation.includes(msg.from)))
                      .map((msg, index) => (
                      <div
                        key={msg.id || index}
                        className={`mb-3 flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg ${
                            msg.fromMe
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{msg.body}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>

                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage} size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sélectionnez une conversation pour commencer à discuter</p>
                  <p className="text-xs mt-2">Les réponses automatiques sont simulées</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            🎯 <strong>Simulation WhatsApp Complète :</strong> Vous pouvez maintenant envoyer et recevoir des messages simulés ! 
            Cette simulation fonctionne entièrement dans Lovable. Les réponses automatiques simulent un vrai environnement WhatsApp.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}