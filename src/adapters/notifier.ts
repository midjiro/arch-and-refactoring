import WebSocket from 'ws';

export interface INotifier {
  sendUpdate(type: string, data: any): void;
}

export class WsAdapter implements INotifier {
  constructor(private wss: WebSocket.Server) {}

  sendUpdate(type: string, data: any) {
    const message = JSON.stringify({ type, data });
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
