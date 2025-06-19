import { Router, Request, Response } from 'express';
import {
  BookingStrategy,
  OrdinaryBookingStrategy,
  VipBookingStrategy,
} from '../strategies/booking';
import WebSocket from 'ws';
import { Ticket } from '../models/tickets';
import { IUserDocument } from '../models/user';
import { WsAdapter } from '../adapters/notifier';

const router = Router();

/**
 * @swagger
 * /tickets:
 *   post:
 *     tags: [Tickets]
 *     summary: Створити квиток
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieTitle:
 *                 type: string
 *               seatNumber:
 *                 type: string
 *               sessionTime:
 *                 type: string
 *                 format: date-time
 *               price:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [vip, ordinary]
 *     responses:
 *       201:
 *         description: Квиток створено
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const ticket = new Ticket(req.body);
    await ticket.save();

    const wss = req.app.get('wss');
    const notifier = new WsAdapter(wss);

    notifier.sendUpdate('ticketCreated', ticket);

    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ message: 'Помилка створення квитка', error: err });
  }
});

/**
 * @swagger
 * /tickets/{id}:
 *   put:
 *     tags: [Tickets]
 *     summary: Оновити квиток за ID
 *     description: Оновлює дані квитка і надсилає оновлення через WebSocket.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Ідентифікатор квитка
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieTitle:
 *                 type: string
 *               seatNumber:
 *                 type: string
 *               sessionTime:
 *                 type: string
 *                 format: date-time
 *               price:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [vip, ordinary]
 *               status:
 *                 type: string
 *                 enum: [available, booked]
 *     responses:
 *       200:
 *         description: Успішне оновлення квитка
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Квиток не знайдено
 *       400:
 *         description: Помилка валідації або оновлення
 */

router.put('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!ticket) return res.status(404).json({ message: 'Квиток не знайдено' });

    const wss = req.app.get('wss');
    const notifier = new WsAdapter(wss);
    notifier.sendUpdate('ticketUpdated', ticket);

    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: 'Помилка оновлення квитка', error: err });
  }
});

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     tags: [Tickets]
 *     summary: Видалити квиток
 *     description: Видаляє квиток за його ID і надсилає повідомлення через WebSocket.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Ідентифікатор квитка
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Квиток успішно видалено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Квиток не знайдено
 *       500:
 *         description: Внутрішня помилка сервера
 */

router.delete('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Квиток не знайдено' });

    const wss = req.app.get('wss');
    const notifier = new WsAdapter(wss);
    notifier.sendUpdate('ticketDeleted', { id: req.params.id });

    res.json({ message: 'Квиток видалено' });
  } catch (err) {
    res.status(500).json({ message: 'Помилка видалення квитка', error: err });
  }
});

/**
 * @swagger
 * /tickets/{id}/book:
 *   post:
 *     tags: [Tickets]
 *     summary: Забронювати квиток
 *     description: |
 *       Бронює квиток за його ID, застосовуючи відповідну стратегію бронювання (VIP або Ordinary).
 *       Після бронювання надсилає оновлення через WebSocket.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Ідентифікатор квитка, який потрібно забронювати
 *         schema:
 *           type: string
 *     security:
 *       - cookieAuth: []  # або інша схема, якщо використовується JWT то тут відповідно
 *     responses:
 *       200:
 *         description: Квиток успішно заброньовано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Помилка бронювання (наприклад, квиток вже заброньований)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Неавторизований користувач
 *       404:
 *         description: Квиток не знайдено
 */
router.post('/:id/book', async (req: Request, res: Response): Promise<any> => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Квиток не знайдено' });

    const user = req.user as IUserDocument;
    if (!user) return res.status(401).json({ message: 'Неавторизований' });

    let strategy: BookingStrategy;

    if (ticket.type === 'vip') {
      strategy = new VipBookingStrategy();
    } else {
      strategy = new OrdinaryBookingStrategy();
    }

    const bookedTicket = await strategy.book(ticket, user);

    const wss = req.app.get('wss');
    const notifier = new WsAdapter(wss);

    notifier.sendUpdate('ticketUpdated', bookedTicket);

    res.json(bookedTicket);
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Помилка бронювання' });
  }
});

/**
 * @swagger
 * /tickets/{id}/book:
 *   delete:
 *     tags: [Tickets]
 *     summary: Скасувати бронювання квитка
 *     description: |
 *       Скасовує бронювання квитка за ID, якщо він заброньований поточним користувачем.
 *       Після скасування надсилає оновлення через WebSocket.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Ідентифікатор квитка, бронювання якого потрібно скасувати
 *         schema:
 *           type: string
 *     security:
 *       - cookieAuth: []  # або інша схема авторизації
 *     responses:
 *       200:
 *         description: Бронювання успішно скасовано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Неавторизований користувач
 *       403:
 *         description: Квиток заброньований іншим користувачем
 *       404:
 *         description: Квиток не знайдено
 *       500:
 *         description: Внутрішня помилка сервера
 */

router.delete(
  '/:id/book',
  async (req: Request, res: Response): Promise<any> => {
    try {
      const user = req.user as IUserDocument;
      if (!user) return res.status(401).json({ message: 'Неавторизовано' });

      const ticket = await Ticket.findById(req.params.id);
      if (!ticket)
        return res.status(404).json({ message: 'Квиток не знайдено' });

      if (ticket.bookedBy?.toString() !== user.id) {
        return res.status(403).json({ message: 'Це не ваш квиток' });
      }

      ticket.status = 'available';
      ticket.bookedBy = null;
      await ticket.save();

      const wss = req.app.get('wss');
      const notifier = new WsAdapter(wss);
      notifier.sendUpdate('ticketCanceled', ticket);

      res.json({ message: 'Бронювання скасовано', ticket });
    } catch (err: any) {
      res
        .status(500)
        .json({ message: err.message || 'Помилка при скасуванні' });
    }
  },
);

/**
 * @swagger
 * /tickets:
 *   get:
 *     tags: [Tickets]
 *     summary: Отримати список квитків
 *     responses:
 *       200:
 *         description: Успішно
 */
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Помилка при отриманні квитків', error: err });
  }
});

export default router;
