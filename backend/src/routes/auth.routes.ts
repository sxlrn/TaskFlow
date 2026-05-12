import { Router } from 'express';
import { register, login, googleAuth, refresh, logout, me } from '../controllers/auth.controller';
import { authLimiter } from '../middlewares/rate-limit.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Реєстрація нового користувача
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, full_name]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               full_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Реєстрація успішна
 *       400:
 *         description: Користувач вже існує
 */
router.post('/register', authLimiter, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вхід в систему
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успішний вхід, повертає accessToken
 *       401:
 *         description: Невірний email або пароль
 */
router.post('/login', authLimiter, login);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Вхід або реєстрація через Google
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [credential]
 *             properties:
 *               credential:
 *                 type: string
 *                 description: Google id_token з GSI
 *     responses:
 *       200:
 *         description: Успішний вхід, повертає accessToken і user
 *       400:
 *         description: credential відсутній або невалідний
 *       401:
 *         description: Google автентифікація не вдалась
 */
router.post('/google', authLimiter, googleAuth);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Оновлення access токена
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: Новий accessToken
 *       401:
 *         description: Refresh token недійсний
 */
router.post('/refresh', refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Вихід з системи
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Вихід успішний
 */
router.post('/logout', logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Отримати поточного користувача
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Дані поточного користувача
 *       401:
 *         description: Не авторизовано
 */
router.get('/me', authenticate, me);

export default router;