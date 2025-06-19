import express from 'express';
import passport from 'passport';
import { User } from '../models/user';
import bcrypt from 'bcrypt';
const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Реєстрація нового користувача
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Користувача зареєстровано
 *       400:
 *         description: Користувач вже існує
 *       500:
 *         description: Помилка сервера
 */
router.post('/register', async (req, res): Promise<any> => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Користувач вже існує' });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: encryptedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Користувача зареєстровано' });
  } catch (err) {
    res.status(500).json({ message: 'Помилка реєстрації', error: err });
  }
});
/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Логін користувача
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Логін успішний
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Логін не вдалося
 *       500:
 *         description: Помилка сервера
 */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: 'Login failed', info });

    req.login(user, (err) => {
      if (err) return next(err);
      return res.json({ message: 'Login success', user });
    });
  })(req, res, next);
});

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     tags: [Auth]
 *     summary: Вихід з системи
 *     responses:
 *       302:
 *         description: Перенаправлення після виходу
 *       500:
 *         description: Помилка при виході
 */
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: 'Помилка при виході' });
    res.redirect('/');
  });
});

/**
 * @swagger
 * /auth/check:
 *   get:
 *     tags: [Auth]
 *     summary: Перевірка автентифікації користувача
 *     responses:
 *       200:
 *         description: Користувач автентифікований
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *       401:
 *         description: Не автентифіковано
 */
router.get('/check', async (req, res): Promise<any> => {
  if (req.isAuthenticated()) {
    return res.json({ user: req.user });
  }
  res.status(401).json({ message: 'Не автентифіковано' });
});

/**
 * @swagger
 * /auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Авторизація через Google OAuth
 *     responses:
 *       302:
 *         description: Перенаправлення на Google для авторизації
 */
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Callback URL для Google OAuth
 *     responses:
 *       302:
 *         description: Перенаправлення після успішної або невдалої авторизації
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  }),
);

export default router;
