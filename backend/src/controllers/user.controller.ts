import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, full_name: true,
        role: true, avatar_color: true, department: true, created_at: true,
        _count: { select: { assigned_tasks: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    const usersWithCounts = await Promise.all(users.map(async (user) => {
      const [active_tasks, completed_tasks] = await Promise.all([
        prisma.task.count({
          where: {
            assignee_id: user.id,
            status: { in: ['todo', 'in_progress', 'review', 'backlog'] },
          },
        }),
        prisma.task.count({
          where: {
            assignee_id: user.id,
            status: { in: ['done', 'cancelled'] },
          },
        }),
      ]);

      const { _count, ...rest } = user;
      return {
        ...rest,
        _count: {
          active_tasks,
          completed_tasks,
          total_tasks: _count.assigned_tasks,
        },
      };
    }));

    res.json(usersWithCounts);
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      select: {
        id: true, email: true, full_name: true,
        role: true, avatar_color: true, department: true, created_at: true,
      },
    });
    if (!user) { res.status(404).json({ error: 'Користувача не знайдено' }); return; }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { full_name, avatar_color, department, role, password } = req.body;

    if (role && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Недостатньо прав для зміни ролі' });
      return;
    }

    if (req.user?.userId !== id && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Недостатньо прав' });
      return;
    }

    const data: Record<string, unknown> = { full_name, avatar_color, department };
    if (role) data.role = role;
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, email: true, full_name: true,
        role: true, avatar_color: true, department: true,
      },
    });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Користувача видалено' });
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};