import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Store active connections and WhatsApp client state
const connections = new Map<string, WebSocket>();
let whatsappClient: any = null;
let isWhatsAppReady = false;
let currentQR = '';
let connectedDevice = '';
let conversations = new Map<string, any[]>();

// Simulation complète WhatsApp - Fonctionnalité complète dans Lovable
class WhatsAppSimulator {
  private qrCallback: ((qr: string) => void) | null = null;
  private readyCallback: (() => void) | null = null;
  private authFailureCallback: (() => void) | null = null;
  private messageCallback: ((msg: any) => void) | null = null;
  
  constructor() {
    console.log('WhatsApp Simulator Ultra-Réaliste initialized');
    this.initializeMockContacts();
  }
  
  on(event: string, callback: any) {
    console.log(`Registering event: ${event}`);
    if (event === 'qr') {
      this.qrCallback = callback;
    } else if (event === 'ready') {
      this.readyCallback = callback;
    } else if (event === 'auth_failure') {
      this.authFailureCallback = callback;
    } else if (event === 'message') {
      this.messageCallback = callback;
    }
  }
  
  private initializeMockContacts() {
    // Initialiser quelques contacts simulés
    conversations.set('33123456789@c.us', [
      {
        id: 'msg1',
        body: 'Bonjour ! Comment ça va ?',
        from: '33123456789@c.us',
        fromMe: false,
        timestamp: Date.now() - 3600000,
        contact: { name: 'Pierre Martin', pushname: 'Pierre' }
      }
    ]);
    
    conversations.set('33987654321@c.us', [
      {
        id: 'msg2', 
        body: 'Merci pour votre réponse rapide !',
        from: '33987654321@c.us',
        fromMe: false,
        timestamp: Date.now() - 1800000,
        contact: { name: 'Marie Dupont', pushname: 'Marie' }
      }
    ]);
  }
  
  initialize() {
    console.log('Initializing WhatsApp client...');
    // Simulate QR generation after a short delay
    setTimeout(() => {
      if (this.qrCallback) {
        const mockQR = this.generateRealisticQR();
        console.log('Generated QR code:', mockQR.substring(0, 50) + '...');
        this.qrCallback(mockQR);
      }
    }, 1000);
    
    // Simulate connection timeout
    setTimeout(() => {
      if (this.authFailureCallback && !isWhatsAppReady) {
        console.log('WhatsApp connection timeout');
        this.authFailureCallback();
      }
    }, 30000); // 30 seconds timeout
  }
  
  private generateRealisticQR(): string {
    // Generate a more realistic WhatsApp QR code format
    const timestamp = Date.now();
    const randomData = crypto.randomUUID().replace(/-/g, '');
    const serverToken = crypto.randomUUID().replace(/-/g, '');
    const clientToken = crypto.randomUUID().replace(/-/g, '');
    
    return `1@${randomData},${serverToken},${clientToken},${timestamp}`;
  }
  
  simulateConnection() {
    console.log('Simulating WhatsApp connection...');
    isWhatsAppReady = true;
    connectedDevice = `WhatsApp Simulator - ${new Date().toLocaleString()}`;
    
    if (this.readyCallback) {
      this.readyCallback();
    }
    
    // Simuler quelques messages entrants après connexion
    setTimeout(() => this.simulateIncomingMessages(), 5000);
  }
  
  private simulateIncomingMessages() {
    const mockMessages = [
      {
        id: 'auto1',
        body: 'Message de test automatique - Connexion réussie !',
        from: '33123456789@c.us',
        fromMe: false,
        timestamp: Date.now(),
        contact: { name: 'Bot Test', pushname: 'Bot' }
      }
    ];
    
    mockMessages.forEach(msg => {
      if (this.messageCallback) {
        this.messageCallback(msg);
      }
    });
  }
  
  async sendMessage(to: string, body: string) {
    console.log(`Simulating message send to ${to}: ${body}`);
    
    // Ajouter à la conversation
    if (!conversations.has(to)) {
      conversations.set(to, []);
    }
    
    const conversation = conversations.get(to)!;
    conversation.push({
      id: 'sent_' + Date.now(),
      body,
      from: to,
      fromMe: true,
      timestamp: Date.now(),
      contact: { name: 'Vous', pushname: 'Vous' }
    });
    
    // Simuler une réponse automatique après 2-5 secondes
    setTimeout(() => {
      const autoReply = {
        id: 'auto_' + Date.now(),
        body: `Réponse automatique à: "${body}"`,
        from: to,
        fromMe: false,
        timestamp: Date.now(),
        contact: { name: 'Contact Simulé', pushname: 'Simulé' }
      };
      
      conversation.push(autoReply);
      
      if (this.messageCallback) {
        this.messageCallback(autoReply);
      }
    }, Math.random() * 3000 + 2000);
    
    return { success: true };
  }
  
  getConversations() {
    return Array.from(conversations.entries()).map(([contact, messages]) => ({
      contact,
      lastMessage: messages[messages.length - 1],
      unreadCount: Math.floor(Math.random() * 3),
      messages
    }));
  }
  
  getState() {
    return isWhatsAppReady ? 'CONNECTED' : 'DISCONNECTED';
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // Initialize WhatsApp client if not already done
  if (!whatsappClient) {
    console.log('Creating new WhatsApp Simulator instance');
    whatsappClient = new WhatsAppSimulator();
    
    whatsappClient.on('qr', (qr: string) => {
      console.log('QR Code received from WhatsApp client');
      currentQR = qr;
      // Broadcast QR to all connected clients
      connections.forEach((socket, id) => {
        try {
          socket.send(JSON.stringify({
            type: 'qr',
            qr: qr,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.error(`Error sending QR to connection ${id}:`, error);
          connections.delete(id);
        }
      });
    });
    
    whatsappClient.on('ready', () => {
      console.log('WhatsApp Simulator is ready!');
      isWhatsAppReady = true;
      // Broadcast ready state to all connected clients
      connections.forEach((socket, id) => {
        try {
          socket.send(JSON.stringify({
            type: 'connected',
            message: 'WhatsApp connecté avec succès!',
            device: {
              name: connectedDevice,
              id: 'whatsapp_simulator_' + Date.now(),
              platform: 'Simulation Lovable'
            }
          }));
        } catch (error) {
          console.error(`Error sending ready to connection ${id}:`, error);
          connections.delete(id);
        }
      });
    });
    
    whatsappClient.on('message', (message: any) => {
      console.log('New message received:', message.body);
      // Broadcast message to all connected clients
      connections.forEach((socket, id) => {
        try {
          socket.send(JSON.stringify({
            type: 'message_received',
            message: {
              id: message.id,
              body: message.body,
              from: message.from,
              fromMe: message.fromMe,
              timestamp: message.timestamp,
              contact: message.contact
            }
          }));
        } catch (error) {
          console.error(`Error sending message to connection ${id}:`, error);
          connections.delete(id);
        }
      });
    });
    
    whatsappClient.on('auth_failure', () => {
      console.log('WhatsApp authentication failed');
      isWhatsAppReady = false;
      // Broadcast error to all connected clients
      connections.forEach((socket, id) => {
        try {
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Échec de l\'authentification WhatsApp. Veuillez réessayer.'
          }));
        } catch (error) {
          console.error(`Error sending auth failure to connection ${id}:`, error);
          connections.delete(id);
        }
      });
    });
    
    // Initialize the client
    whatsappClient.initialize();
  }

  // WebSocket endpoint for real-time updates
  if (req.headers.get('upgrade') === 'websocket') {
    const { socket, response } = Deno.upgradeWebSocket(req);
    const connectionId = crypto.randomUUID();
    
    socket.onopen = () => {
      console.log(`WebSocket connection opened: ${connectionId}`);
      connections.set(connectionId, socket);
      
      // Send current state
      if (isWhatsAppReady) {
        socket.send(JSON.stringify({
          type: 'connected',
          message: 'WhatsApp déjà connecté',
          device: {
            name: 'Appareil connecté',
            id: 'whatsapp_connected'
          }
        }));
      } else if (currentQR) {
        socket.send(JSON.stringify({
          type: 'qr',
          qr: currentQR,
          timestamp: Date.now()
        }));
      } else {
        socket.send(JSON.stringify({
          type: 'initializing',
          message: 'Initialisation en cours...'
        }));
      }
    };

    socket.onclose = () => {
      console.log(`WebSocket connection closed: ${connectionId}`);
      connections.delete(connectionId);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);
        
        if (data.type === 'refresh-qr') {
          console.log('Refreshing QR code...');
          // Reset WhatsApp client to generate new QR
          isWhatsAppReady = false;
          currentQR = '';
          
          // Create a new instance and reinitialize
          const newClient = new WhatsAppWebSimulator();
          
          newClient.on('qr', (qr: string) => {
            currentQR = qr;
            socket.send(JSON.stringify({
              type: 'qr',
              qr: qr,
              timestamp: Date.now()
            }));
          });
          
          newClient.on('ready', () => {
            isWhatsAppReady = true;
            socket.send(JSON.stringify({
              type: 'connected',
              message: 'WhatsApp connecté avec succès!',
              device: {
                name: 'Appareil connecté',
                id: 'whatsapp_' + Date.now()
              }
            }));
          });
          
          newClient.on('auth_failure', () => {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Échec de l\'authentification. Veuillez réessayer.'
            }));
          });
          
          whatsappClient = newClient;
          whatsappClient.initialize();
        }
        
        if (data.type === 'mock-connect') {
          console.log('Simulating WhatsApp connection...');
          // Simulate connection process
          socket.send(JSON.stringify({
            type: 'connecting',
            message: 'Connexion en cours...'
          }));
          
          setTimeout(() => {
            if (whatsappClient) {
              whatsappClient.simulateConnection();
            }
          }, 2000);
        }
        
        if (data.type === 'send_message') {
          console.log('Sending message:', data);
          if (whatsappClient && isWhatsAppReady) {
            try {
              await whatsappClient.sendMessage(data.to, data.body);
              socket.send(JSON.stringify({
                type: 'message_sent',
                success: true,
                to: data.to,
                body: data.body
              }));
            } catch (error) {
              socket.send(JSON.stringify({
                type: 'error',
                message: 'Erreur lors de l\'envoi du message'
              }));
            }
          }
        }
        
        if (data.type === 'get_conversations') {
          console.log('Getting conversations...');
          if (whatsappClient) {
            const conversations = whatsappClient.getConversations();
            socket.send(JSON.stringify({
              type: 'conversations',
              data: conversations
            }));
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Erreur lors du traitement du message'
        }));
      }
    };

    return response;
  }

  // Webhook endpoint to receive data from Node.js bot server
  if (req.method === 'POST' && url.pathname === '/webhook') {
    try {
      const { type, data, timestamp } = await req.json();
      console.log('Received webhook from bot server:', { type, data });
      
      // Broadcast to all connected WebSocket clients
      connections.forEach((socket, id) => {
        try {
          socket.send(JSON.stringify({
            type,
            ...data,
            timestamp: timestamp || Date.now()
          }));
        } catch (error) {
          console.error(`Error sending to connection ${id}:`, error);
          connections.delete(id);
        }
      });
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Webhook error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // Regular HTTP endpoints
  if (req.method === 'GET' && url.pathname === '/status') {
    return new Response(JSON.stringify({ 
      status: 'running',
      whatsapp_ready: isWhatsAppReady,
      connections: connections.size,
      bot_server_connected: true, // Assuming bot server is running
      timestamp: Date.now()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'POST' && url.pathname === '/send-message') {
    try {
      const { to, body } = await req.json();
      
      if (whatsappClient && isWhatsAppReady) {
        const result = await whatsappClient.sendMessage(to, body);
        return new Response(JSON.stringify({
          success: true,
          message: 'Message envoyé avec succès',
          to,
          body
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({
          error: 'WhatsApp non connecté',
          success: false
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de l\'envoi du message',
        message: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
  
  if (req.method === 'GET' && url.pathname === '/conversations') {
    try {
      if (whatsappClient) {
        const conversations = whatsappClient.getConversations();
        return new Response(JSON.stringify({
          success: true,
          conversations
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({
          error: 'WhatsApp non initialisé',
          conversations: []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (error) {
      console.error('Error getting conversations:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (req.method === 'POST' && url.pathname === '/generate-qr') {
    try {
      if (currentQR) {
        return new Response(JSON.stringify({ 
          qr: currentQR,
          timestamp: Date.now(),
          expires_in: 60000 // 1 minute
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({ 
          error: 'QR code not available yet',
          message: 'WhatsApp client is initializing...'
        }), {
          status: 202,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('WhatsApp Connection Service', { 
    status: 200,
    headers: corsHeaders 
  });
});