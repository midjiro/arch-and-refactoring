import express from 'express';
import session from 'express-session';
import passport from 'passport';
import corsMiddleware from '../configs/cors';
import { setupPassport } from '../configs/passport';
import { default as authRoutes } from '../routes/auth';
import { default as ticketsRoutes } from '../routes/tickets';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../configs/swagger';

const app = express();

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

export default app;
