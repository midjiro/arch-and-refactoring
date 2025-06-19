import http from 'http';
import app from './app/index';
import { connectDB } from './configs/db';
import { setupWebSocket } from './configs/websockets';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

setupWebSocket(app, server);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
