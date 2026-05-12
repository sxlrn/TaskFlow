import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { project_id, assignee_id, status, priority } = req.query;

    const tasks = await prisma.task.findMany({
      where: {
        ...(project_id && { project_id: Number(project_id) }),
        ...(assignee_id && { assignee_id: Number(assignee_id) }),
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any }),
      },
      include: {
        assignee: {
          select: { id: true, full_name: true, email: true, avatar_color: true },
        },
        reporter: {
          select: { id: true, full_name: true, email: true },
        },
        project: {
          select: { id: true, title: true, color: true },
        },
      },
      orderBy: { updated_at: 'desc' },
    });
    res.json(tasks);
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        assignee: {
          select: { id: true, full_name: true, email: true, avatar_color: true },
        },
        reporter: {
          select: { id: true, full_name: true, email: true },
        },
        project: {
          select: { id: true, title: true, color: true },
        },
      },
    });
    if (!task) { res.status(404).json({ error: 'Задачу не знайдено' }); return; }
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, project_id, assignee_id, status, priority, deadline, estimated_hours } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        project_id: Number(project_id),
        assignee_id: assignee_id ? Number(assignee_id) : null,
        reporter_id: req.user!.userId,
        status,
        priority,
        deadline: deadline ? new Date(deadline) : null,
        estimated_hours: estimated_hours ? Number(estimated_hours) : null,
      },
      include: {
        assignee: {
          select: { id: true, full_name: true, email: true, avatar_color: true },
        },
        reporter: {
          select: { id: true, full_name: true, email: true },
        },
        project: {
          select: { id: true, title: true, color: true },
        },
      },
    });
    res.status(201).json(task);
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { title, description, assignee_id, status, priority, deadline, estimated_hours } = req.body;

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ error: 'Задачу не знайдено' }); return; }

    // Worker може змінювати тільки свої задачі і тільки статус
    if (req.user!.role === 'worker') {
      if (existing.assignee_id !== req.user!.userId) {
        res.status(403).json({ error: 'Недостатньо прав' });
        return;
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(assignee_id !== undefined && { assignee_id: assignee_id ? Number(assignee_id) : null }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(estimated_hours !== undefined && { estimated_hours: estimated_hours ? Number(estimated_hours) : null }),
      },
      include: {
        assignee: {
          select: { id: true, full_name: true, email: true, avatar_color: true },
        },
        reporter: {
          select: { id: true, full_name: true, email: true },
        },
        project: {
          select: { id: true, title: true, color: true },
        },
      },
    });
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ error: 'Задачу не знайдено' }); return; }

    if (req.user!.role === 'worker') {
      res.status(403).json({ error: 'Недостатньо прав' });
      return;
    }

    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Задачу видалено' });
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};