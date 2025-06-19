import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { Ticket } from '../models/tickets';

beforeAll(async () => {
  app.set('wss', {
    clients: new Set(),
  });

  await mongoose.connect('mongodb://localhost:27017/test-tickets', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as any);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

afterEach(async () => {
  await Ticket.deleteMany({});
});

describe('Tickets API', () => {
  it('POST /tickets - створює квиток', async () => {
    const ticketData = {
      movieTitle: 'Inception 3',
      sessionTime: '2025-07-02T20:00:00',
      seatNumber: 'B6',
      price: 120,
      type: 'ordinary',
      status: 'available',
    };

    const res = await request(app).post('/tickets').send(ticketData);

    console.log(res.body);

    expect(res.status).toBe(201);
    expect(res.body.movieTitle).toBe('Inception 3');
  });

  it('PUT /tickets/:id - оновлює квиток', async () => {
    const ticket = await Ticket.create({
      movieTitle: 'Inception 3',
      sessionTime: '2025-07-02T20:00:00',
      seatNumber: 'B6',
      price: 120,
      type: 'vip',
      status: 'available',
    });

    const res = await request(app)
      .put(`/tickets/${ticket._id}`)
      .send({ price: 250 });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(250);
  });

  it('DELETE /tickets/:id - видаляє квиток', async () => {
    const ticket = await Ticket.create({
      movieTitle: 'Inception 3',
      sessionTime: '2025-07-02T20:00:00',
      seatNumber: 'B6',
      price: 120,
      type: 'ordinary',
      status: 'available',
    });

    const res = await request(app).delete(`/tickets/${ticket._id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Квиток видалено');
  });

  it('GET /tickets - повертає список', async () => {
    await Ticket.create({
      movieTitle: 'Inception 4',
      sessionTime: '2025-07-02T20:00:00',
      seatNumber: 'B6',
      price: 120,
      type: 'ordinary',
      status: 'available',
    });

    const res = await request(app).get('/tickets');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
