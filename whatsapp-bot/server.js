const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// WhatsApp Client Setup
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "whatsapp-bot-client"
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// Store WebSocket connections
const wsConnections = new Set();

// WebSocket Server for real-time communication
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    wsConnections.add(ws);
    
    // Send current status
    if (client.info) {
        ws.send(JSON.stringify({
            type: 'connected',
            message: 'Bot WhatsApp connecté',
            device: {
                name: client.info.pushname || 'WhatsApp Bot',
                id: client.info.wid._serialized
            }
        }));
    }
    
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received:', data);
            
            if (data.type === 'send_message') {
                await sendMessage(data.to, data.message);
                ws.send(JSON.stringify({
                    type: 'message_sent',
                    success: true
                }));
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: error.message
            }));
        }
    });
    
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
        wsConnections.delete(ws);
    });
});

// Broadcast to all WebSocket connections
function broadcast(data) {
    const message = JSON.stringify(data);
    wsConnections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }
    });
}

// WhatsApp Events
client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
    
    // Broadcast QR to all connected clients
    broadcast({
        type: 'qr',
        qr: qr,
        timestamp: Date.now()
    });
    
    // Also send to Supabase Edge Function
    sendToSupabase('qr', { qr, timestamp: Date.now() });
});

client.on('ready', () => {
    console.log('WhatsApp Bot is ready!');
    
    const readyData = {
        type: 'connected',
        message: 'Bot WhatsApp connecté avec succès!',
        device: {
            name: client.info.pushname || 'WhatsApp Bot',
            id: client.info.wid._serialized
        }
    };
    
    broadcast(readyData);
    sendToSupabase('connected', readyData);
});

client.on('auth_failure', (msg) => {
    console.error('Authentication failed:', msg);
    
    const errorData = {
        type: 'error',
        message: 'Échec de l\'authentification WhatsApp'
    };
    
    broadcast(errorData);
    sendToSupabase('error', errorData);
});

client.on('disconnected', (reason) => {
    console.log('WhatsApp disconnected:', reason);
    
    const disconnectData = {
        type: 'error',
        message: 'WhatsApp déconnecté: ' + reason
    };
    
    broadcast(disconnectData);
    sendToSupabase('disconnected', disconnectData);
});

// Handle incoming messages
client.on('message', async (message) => {
    console.log('Received message:', message.body);
    
    // Echo bot example - you can customize this
    if (message.body.toLowerCase().includes('hello')) {
        await message.reply('Hello! This is your WhatsApp bot responding.');
    }
    
    // Broadcast received message to connected clients
    broadcast({
        type: 'message_received',
        from: message.from,
        body: message.body,
        timestamp: message.timestamp
    });
});

// Send message function
async function sendMessage(to, messageBody) {
    try {
        await client.sendMessage(to, messageBody);
        console.log('Message sent to:', to);
        return true;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

// Send data to Supabase Edge Function
async function sendToSupabase(type, data) {
    try {
        const response = await fetch('https://xjpoivlflcvagnfyogol.functions.supabase.co/whatsapp-connection/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                type,
                data,
                timestamp: Date.now()
            })
        });
        
        if (!response.ok) {
            console.error('Failed to send to Supabase:', response.statusText);
        }
    } catch (error) {
        console.error('Error sending to Supabase:', error);
    }
}

// API Routes
app.get('/status', (req, res) => {
    const isReady = client.info !== null;
    res.json({
        status: isReady ? 'connected' : 'disconnected',
        client_info: client.info,
        timestamp: Date.now()
    });
});

app.post('/send-message', async (req, res) => {
    try {
        const { to, message } = req.body;
        await sendMessage(to, message);
        res.json({ success: true, message: 'Message sent' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/generate-qr', (req, res) => {
    // This will trigger QR generation if not connected
    if (!client.info) {
        res.json({ message: 'QR code will be generated. Check console or WebSocket.' });
    } else {
        res.json({ message: 'Already connected', client_info: client.info });
    }
});

// Initialize WhatsApp Client
console.log('Starting WhatsApp Bot...');
client.initialize();

// Start Express Server
app.listen(PORT, () => {
    console.log(`WhatsApp Bot API running on port ${PORT}`);
    console.log(`WebSocket server running on port 8080`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down WhatsApp Bot...');
    await client.destroy();
    process.exit(0);
});