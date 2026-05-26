// Set up environment variables before importing anything
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_jwt_access_secret_key_for_testing';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_key_for_testing';

import request from 'supertest';
import app from '../index';
import prisma from '../utils/prisma';
import { generateAccessToken } from '../utils/jwt';

// Mock the Prisma client
jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: {
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Task API Endpoints', () => {
  const adminToken = generateAccessToken({
    userId: 1,
    email: 'admin@taskflow.com',
    role: 'admin',
  });

  const workerToken = generateAccessToken({
    userId: 2,
    email: 'worker@taskflow.com',
    role: 'worker',
  });

  const mockTask = {
    id: 101,
    title: 'Розробити архітектуру',
    description: 'Опис архітектури',
    type: 'research',
    status: 'todo',
    priority: 'high',
    project_id: 1,
    assignee_id: 2,
    reporter_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    it('should return a list of tasks for authenticated users', async () => {
      const mockTasks = [mockTask];
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Розробити архітектуру');
      expect(prisma.task.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return 401 when token is missing', async () => {
      const response = await request(app).get('/api/tasks');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Токен відсутній');
    });
  });

  describe('POST /api/tasks', () => {
    it('should allow admin/manager to create a standard task', async () => {
      const newTaskInput = {
        title: 'Тестова стандартна задача',
        project_id: 1,
        type: 'standard',
        status: 'todo',
        priority: 'medium',
      };

      const createdTask = {
        ...mockTask,
        id: 102,
        title: newTaskInput.title,
        type: newTaskInput.type,
      };

      (prisma.task.create as jest.Mock).mockResolvedValue(createdTask);

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newTaskInput);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Тестова стандартна задача');
      expect(response.body.type).toBe('standard');
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Тестова стандартна задача',
          type: 'standard',
          project_id: 1,
        }),
        include: expect.any(Object),
      });
    });

    it('should allow admin/manager to create a research task', async () => {
      const newTaskInput = {
        title: 'Дослідити нову бібліотеку',
        project_id: 1,
        type: 'research',
        status: 'todo',
        priority: 'high',
      };

      const createdTask = {
        ...mockTask,
        id: 103,
        title: newTaskInput.title,
        type: newTaskInput.type,
      };

      (prisma.task.create as jest.Mock).mockResolvedValue(createdTask);

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newTaskInput);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Дослідити нову бібліотеку');
      expect(response.body.type).toBe('research');
    });

    it('should deny workers from creating tasks', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${workerToken}`)
        .send({ title: 'Worker task', project_id: 1 });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Недостатньо прав');
    });

    it('should deny creating standard task with research status', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Недопустима задача',
          project_id: 1,
          type: 'standard',
          status: 'research',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Стандартні задачі не можуть мати статус "Дослідження"');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should allow updating a task', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.task.update as jest.Mock).mockResolvedValue({
        ...mockTask,
        title: 'Оновлена назва',
      });

      const response = await request(app)
        .put('/api/tasks/101')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Оновлена назва' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Оновлена назва');
      expect(prisma.task.update).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if task to update does not exist', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/tasks/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Non-existent' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Задачу не знайдено');
    });

    it('should deny updating standard task to research status', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        ...mockTask,
        type: 'standard',
        status: 'todo',
      });

      const response = await request(app)
        .put('/api/tasks/101')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'research' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Стандартні задачі не можуть мати статус "Дослідження"');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should allow admin to delete a task', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.task.delete as jest.Mock).mockResolvedValue(mockTask);

      const response = await request(app)
        .delete('/api/tasks/101')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Задачу видалено');
      expect(prisma.task.delete).toHaveBeenCalledTimes(1);
    });

    it('should deny worker from deleting a task', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);

      const response = await request(app)
        .delete('/api/tasks/101')
        .set('Authorization', `Bearer ${workerToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Недостатньо прав');
      expect(prisma.task.delete).not.toHaveBeenCalled();
    });
  });
});
