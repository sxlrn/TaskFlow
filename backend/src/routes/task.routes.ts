import { Router } from 'express';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../controllers/task.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Отримати всі задачі
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: assignee_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [backlog, todo, in_progress, review, done, cancelled]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *     responses:
 *       200:
 *         description: Список задач
 */
router.get('/', authenticate, getTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Отримати задачу за ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Дані задачі
 *       404:
 *         description: Задачу не знайдено
 */
router.get('/:id', authenticate, getTask);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Створити задачу
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, project_id]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               project_id:
 *                 type: integer
 *               assignee_id:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [backlog, todo, in_progress, review, done, cancelled]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               deadline:
 *                 type: string
 *                 format: date
 *               estimated_hours:
 *                 type: number
 *     responses:
 *       201:
 *         description: Задачу створено
 */
router.post('/', authenticate, authorize('admin', 'manager'), createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Оновити задачу
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Задачу оновлено
 */
router.put('/:id', authenticate, updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Видалити задачу
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Задачу видалено
 */
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteTask);

export default router;