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

// Import whatsapp-web.js - Note: This is a simulation for Deno environment
// In a real implementation, you'd need a Node.js compatible library
class WhatsAppWebSimulator {
  private qrCallback: ((qr: string) => void) | null = null;
  private readyCallback: (() => void) | null = null;
  private authFailureCallback: (() => void) | null = null;
  
  constructor() {
    console.log('WhatsApp Web Simulator initialized');
  }
  
  on(event: string, callback: any) {
    console.log(`Registering event: ${event}`);
    if (event === 'qr') {
      this.qrCallback = callback;
    } else if (event === 'ready') {
      this.readyCallback = callback;
    } else if (event === 'auth_failure') {
      this.authFailureCallback = callback;
    }
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
    if (this.readyCallback) {
      this.readyCallback();
    }
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
    console.log('Creating new WhatsApp client instance');
    whatsappClient = new WhatsAppWebSimulator();
    
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
      console.log('WhatsApp client is ready!');
      isWhatsAppReady = true;
      // Broadcast ready state to all connected clients
      connections.forEach((socket, id) => {
        try {
          socket.send(JSON.stringify({
            type: 'connected',
            message: 'WhatsApp connecté avec succès!',
            device: {
              name: 'Appareil connecté',
              id: 'whatsapp_' + Date.now()
            }
          }));
        } catch (error) {
          console.error(`Error sending ready to connection ${id}:`, error);
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

  if (req.method === 'POST' && url.pathname === '/send-to-bot') {
    try {
      const { action, data } = await req.json();
      
      // Forward request to Node.js bot server
      // You'll need to configure the bot server URL
      const botServerUrl = 'http://your-bot-server.com:3001';
      
      const response = await fetch(`${botServerUrl}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error communicating with bot server:', error);
      return new Response(JSON.stringify({ 
        error: 'Bot server communication failed',
        message: error.message 
      }), {
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