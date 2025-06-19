import WebSocket from 'ws';
import { Server } from 'http';

export function setupWebSocket(app: any, server: Server) {
  const wss = new WebSocket.Server({ server });

  app.set('wss', wss);

  wss.on('connection', (ws) => {
    console.log('📡 WebSocket client connected');

    ws.on('message', (message) => {
      console.log('📨 message from client:', message.toString());
    });
  });
}
