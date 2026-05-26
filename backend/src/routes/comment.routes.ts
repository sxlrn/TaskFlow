import { Router } from 'express';
import { getComments, createComment, updateComment, deleteComment } from '../controllers/comment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Отримати коментарі до задачі
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: task_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID задачі, для якої потрібно отримати коментарі
 *     responses:
 *       200:
 *         description: Список коментарів
 *       400:
 *         description: Потрібно вказати task_id
 *       401:
 *         description: Неавторизовано
 */
router.get('/', getComments);

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Створити коментар до задачі
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [task_id, content]
 *             properties:
 *               task_id:
 *                 type: integer
 *                 description: ID задачі
 *               content:
 *                 type: string
 *                 description: Вміст коментаря
 *     responses:
 *       201:
 *         description: Коментар успішно створено
 *       400:
 *         description: Некоректні вхідні дані (відсутній task_id або порожній вміст)
 *       401:
 *         description: Неавторизовано
 *       404:
 *         description: Задачу не знайдено
 */
router.post('/', createComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Оновити коментар за ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID коментаря
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 description: Оновлений вміст коментаря
 *     responses:
 *       200:
 *         description: Коментар успішно оновлено
 *       400:
 *         description: Вміст коментаря не може бути порожнім
 *       401:
 *         description: Неавторизовано
 *       403:
 *         description: Ви можете редагувати лише власні коментарі
 *       404:
 *         description: Коментар не знайдено
 */
router.put('/:id', updateComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Видалити коментар за ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID коментаря
 *     responses:
 *       200:
 *         description: Коментар успішно видалено
 *       401:
 *         description: Неавторизовано
 *       403:
 *         description: Недостатньо прав для видалення цього коментаря (лише автор або менеджер/адмін)
 *       404:
 *         description: Коментар не знайдено
 */
router.delete('/:id', deleteComment);

export default router;

