import { Router } from 'express';
import { getUsers, getUser, updateUser, deleteUser } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Отримати всіх користувачів
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Список користувачів
 */
router.get('/', authenticate, getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Отримати користувача за ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Дані користувача
 *       404:
 *         description: Користувача не знайдено
 */
router.get('/:id', authenticate, getUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Оновити користувача
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               avatar_color:
 *                 type: string
 *               department:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, manager, worker]
 *     responses:
 *       200:
 *         description: Користувача оновлено
 */
router.put('/:id', authenticate, updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Видалити користувача
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Користувача видалено
 *       403:
 *         description: Недостатньо прав
 */
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

export default router;