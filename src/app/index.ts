import express from 'express';
import session from 'express-session';
import passport from 'passport';
import corsMiddleware from '../configs/cors';
import { setupPassport } from '../configs/passport';
import { default as authRoutes } from '../routes/auth';
import { default as ticketsRoutes } from '../routes/tickets';
import { createServer } from 'http';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../configs/swagger';

const app = express();
const server = createServer(app);
app.use(express.json());
app.use(corsMiddleware);
app.use(express.json());
app.use(
  session({
    secret: 'yourSecret',
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

setupPassport();

app.use('/auth', authRoutes);
app.use('/tickets', ticketsRoutes);

server.listen(3000, () => {
  console.log('Server listening on 4000');
});
export default app;
