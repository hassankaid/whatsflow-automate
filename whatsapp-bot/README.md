# WhatsApp Bot Server

Ce serveur Node.js utilise `whatsapp-web.js` pour créer un vrai bot WhatsApp qui fonctionne avec votre application.

## Installation

1. **Prérequis :**
   ```bash
   # Installer Node.js (version 16+)
   # Installer npm
   ```

2. **Installation des dépendances :**
   ```bash
   cd whatsapp-bot
   npm install
   ```

3. **Configuration :**
   ```bash
   # Créer un fichier .env (optionnel)
   echo "SUPABASE_ANON_KEY=your_supabase_anon_key" > .env
   ```

## Utilisation

### Démarrage du serveur
```bash
npm start
# ou pour le développement avec auto-reload
npm run dev
```

### Première connexion
1. Lancez le serveur
2. Un QR code apparaîtra dans le terminal
3. Scannez le QR code avec WhatsApp sur votre téléphone
4. Le bot sera connecté et prêt à fonctionner

### API Endpoints

- `GET /status` - Statut de la connexion WhatsApp
- `POST /send-message` - Envoyer un message
  ```json
  {
    "to": "1234567890@c.us",
    "message": "Hello from bot!"
  }
  ```
- `GET /generate-qr` - Générer un nouveau QR code

### WebSocket
- Port 8080 pour la communication en temps réel
- Messages QR, statut de connexion, messages reçus

## Déploiement

### Option 1: VPS/Serveur dédié
```bash
# Sur votre serveur
git clone [your-repo]
cd whatsapp-bot
npm install
npm start
```

### Option 2: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001 8080
CMD ["npm", "start"]
```

### Option 3: Services cloud
- Railway.app
- Render.com  
- DigitalOcean App Platform
- Heroku (avec buildpack approprié)

## Intégration avec Supabase

Le serveur communique automatiquement avec votre Edge Function Supabase :
- Envoie les QR codes
- Notifie les changements de statut
- Synchronise les messages

## Personnalisation

Modifiez `server.js` pour :
- Ajouter des réponses automatiques
- Intégrer des APIs
- Créer des commandes bot
- Gérer des groupes WhatsApp

## Sécurité

⚠️ **Important :**
- Ne partagez jamais vos fichiers de session
- Utilisez HTTPS en production
- Limitez l'accès aux APIs
- Respectez les limites de taux WhatsApp