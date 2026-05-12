import { Router } from 'express';
import { getProjects, getProject, createProject, updateProject, deleteProject } from '../controllers/project.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Отримати всі проєкти
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Список проєктів
 */
router.get('/', authenticate, getProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Отримати проєкт за ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Дані проєкту з задачами
 *       404:
 *         description: Проєкт не знайдено
 */
router.get('/:id', authenticate, getProject);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Створити проєкт
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, on_hold, completed, archived]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               color:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Проєкт створено
 */
router.post('/', authenticate, authorize('admin', 'manager'), createProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Оновити проєкт
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Проєкт оновлено
 */
router.put('/:id', authenticate, authorize('admin', 'manager'), updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Видалити проєкт
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Проєкт видалено
 */
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteProject);

export default router;