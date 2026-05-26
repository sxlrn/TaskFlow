import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { task_id } = req.query;

    if (!task_id) {
      res.status(400).json({ error: 'Потрібно вказати task_id' });
      return;
    }

    const comments = await prisma.comment.findMany({
      where: { task_id: Number(task_id) },
      include: {
        author: {
          select: { id: true, full_name: true, email: true, avatar_color: true },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    res.json(comments);
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { task_id, content } = req.body;

    if (!task_id || !content?.trim()) {
      res.status(400).json({ error: 'Потрібно вказати task_id та content' });
      return;
    }

    const taskExists = await prisma.task.findUnique({ where: { id: Number(task_id) } });
    if (!taskExists) {
      res.status(404).json({ error: 'Задачу не знайдено' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        task_id: Number(task_id),
        author_id: req.user!.userId,
      },
      include: {
        author: {
          select: { id: true, full_name: true, email: true, avatar_color: true },
        },
      },
    });

    res.status(201).json(comment);
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

export const updateComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { content } = req.body;

    if (!content?.trim()) {
      res.status(400).json({ error: 'Вміст коментаря не може бути порожнім' });
      return;
    }

    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Коментар не знайдено' });
      return;
    }

    if (existing.author_id !== req.user!.userId) {
      res.status(403).json({ error: 'Ви можете редагувати лише власні коментарі' });
      return;
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { content: content.trim() },
      include: {
        author: {
          select: { id: true, full_name: true, email: true, avatar_color: true },
        },
      },
    });

    res.json(comment);
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Коментар не знайдено' });
      return;
    }

    // Лише автор або адміністратор/менеджер можуть видаляти коментар
    if (existing.author_id !== req.user!.userId && req.user!.role === 'worker') {
      res.status(403).json({ error: 'Недостатньо прав для видалення цього коментаря' });
      return;
    }

    await prisma.comment.delete({ where: { id } });
    res.json({ message: 'Коментар видалено' });
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};
