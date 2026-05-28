import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        manager: {
          select: { id: true, full_name: true, email: true, avatar_color: true },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    res.json(projects);
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        manager: {
          select: { id: true, full_name: true, email: true, avatar_color: true },
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, full_name: true, email: true, avatar_color: true },
            },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });
    if (!project) { res.status(404).json({ error: 'Проєкт не знайдено' }); return; }
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, color, deadline } = req.body;
    const trimmedTitle = title?.trim();
    const trimmedDescription = description?.trim() || null;

    if (!trimmedTitle) {
      res.status(400).json({ error: 'Назва проєкту не може бути порожньою' });
      return;
    }

    const project = await prisma.project.create({
      data: {
        title: trimmedTitle,
        description: trimmedDescription,
        status,
        priority,
        color,
        deadline: deadline ? new Date(deadline) : null,
        manager_id: req.user!.userId,
      },
      include: {
        manager: {
          select: { id: true, full_name: true, email: true },
        },
      },
    });
    res.status(201).json(project);
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, color, deadline } = req.body;
    const id = Number(req.params.id);

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ error: 'Проєкт не знайдено' }); return; }

    if (existing.manager_id !== req.user!.userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Недостатньо прав' });
      return;
    }

    const trimmedTitle = title?.trim();
    const trimmedDescription = description?.trim() || null;

    if (!trimmedTitle) {
      res.status(400).json({ error: 'Назва проєкту не може бути порожньою' });
      return;
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: trimmedTitle,
        description: trimmedDescription,
        status,
        priority,
        color,
        deadline: deadline ? new Date(deadline) : null,
      },
      include: {
        manager: {
          select: { id: true, full_name: true, email: true },
        },
      },
    });
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ error: 'Проєкт не знайдено' }); return; }

    if (existing.manager_id !== req.user!.userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Недостатньо прав' });
      return;
    }

    await prisma.project.delete({ where: { id } });
    res.json({ message: 'Проєкт видалено' });
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};