import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { User } from '../models/user';

describe('Auth Routes', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/test-auth', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/auth/register').send({
        username: 'testuser',
        password: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Користувача зареєстровано');
    });

    it('should not allow duplicate usernames', async () => {
      await new User({ username: 'testuser', password: 'hashed' }).save();

      const res = await request(app).post('/auth/register').send({
        username: 'testuser',
        password: 'password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Користувач вже існує');
    });
  });

  describe('POST /auth/login', () => {
    it('should login a user (mocked)', async () => {
      const password = 'password123';
      const bcrypt = require('bcrypt');
      const hashed = await bcrypt.hash(password, 10);

      await new User({ username: 'testuser', password: hashed }).save();

      const agent = request.agent(app);
      const res = await agent.post('/auth/login').send({
        username: 'testuser',
        password,
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login success');
    });
  });

  describe('GET /auth/check', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/auth/check');
      expect(res.status).toBe(401);
    });
  });
});
