import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Store active connections
const connections = new Map<string, WebSocket>();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  
  // WebSocket endpoint for real-time updates
  if (url.pathname === '/ws') {
    if (req.headers.get('upgrade') !== 'websocket') {
      return new Response('Expected websocket', { status: 400 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    const connectionId = crypto.randomUUID();
    
    socket.onopen = () => {
      console.log(`WebSocket connection opened: ${connectionId}`);
      connections.set(connectionId, socket);
      
      // Send initial QR code (mock for now)
      socket.send(JSON.stringify({
        type: 'qr',
        qr: generateMockQR(),
        timestamp: Date.now()
      }));
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
          // Generate new QR code
          socket.send(JSON.stringify({
            type: 'qr',
            qr: generateMockQR(),
            timestamp: Date.now()
          }));
        }
        
        if (data.type === 'mock-connect') {
          // Simulate connection process
          setTimeout(() => {
            socket.send(JSON.stringify({
              type: 'connecting',
              message: 'Connexion en cours...'
            }));
          }, 1000);
          
          setTimeout(() => {
            socket.send(JSON.stringify({
              type: 'connected',
              message: 'Connecté avec succès!',
              device: {
                name: 'Mon iPhone',
                id: 'device_' + Math.random().toString(36).substr(2, 9)
              }
            }));
          }, 3000);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    return response;
  }

  // Regular HTTP endpoints
  if (req.method === 'GET' && url.pathname === '/status') {
    return new Response(JSON.stringify({ 
      status: 'running',
      connections: connections.size,
      timestamp: Date.now()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'POST' && url.pathname === '/generate-qr') {
    try {
      const qrCode = generateMockQR();
      
      return new Response(JSON.stringify({ 
        qr: qrCode,
        timestamp: Date.now(),
        expires_in: 60000 // 1 minute
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Not found', { status: 404 });
});

// Generate a mock QR code data (in real implementation, this would come from whatsapp-web.js)
function generateMockQR(): string {
  const timestamp = Date.now();
  const randomData = Math.random().toString(36).substring(2, 15);
  return `1@${randomData},${timestamp},whatsapp-web-mock,${Math.random().toString(36).substring(2, 8)}`;
}