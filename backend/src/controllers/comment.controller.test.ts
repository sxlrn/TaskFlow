// Set up environment variables before importing anything
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_jwt_access_secret_key_for_testing';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_key_for_testing';

import request from 'supertest';
import app from '../index';
import prisma from '../utils/prisma';
import { generateAccessToken } from '../utils/jwt';

// Mock the Prisma client for comments and tasks
jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: {
    comment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    task: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Comment API Endpoints', () => {
  const adminToken = generateAccessToken({
    userId: 1,
    email: 'admin@taskflow.com',
    role: 'admin',
  });

  const workerToken1 = generateAccessToken({
    userId: 2,
    email: 'worker1@taskflow.com',
    role: 'worker',
  });

  const workerToken2 = generateAccessToken({
    userId: 3,
    email: 'worker2@taskflow.com',
    role: 'worker',
  });

  const mockComment = {
    id: 501,
    content: 'Чудовий прогрес по цій задачі!',
    task_id: 10,
    author_id: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/comments', () => {
    it('should return comments for a specific task', async () => {
      (prisma.comment.findMany as jest.Mock).mockResolvedValue([mockComment]);

      const response = await request(app)
        .get('/api/comments?task_id=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0].content).toBe('Чудовий прогрес по цій задачі!');
      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { task_id: 10 },
        })
      );
    });

    it('should return 400 bad request if task_id is missing', async () => {
      const response = await request(app)
        .get('/api/comments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Потрібно вказати task_id');
    });
  });

  describe('POST /api/comments', () => {
    it('should allow user to comment if task exists', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({ id: 10, title: 'Задача 10' });
      (prisma.comment.create as jest.Mock).mockResolvedValue({
        ...mockComment,
        content: 'Новий коментар',
        author_id: 2,
      });

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${workerToken1}`)
        .send({ task_id: 10, content: 'Новий коментар' });

      expect(response.status).toBe(201);
      expect(response.body.content).toBe('Новий коментар');
      expect(prisma.task.findUnique).toHaveBeenCalledWith({ where: { id: 10 } });
    });

    it('should return 404 if parent task does not exist', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${workerToken1}`)
        .send({ task_id: 99, content: 'Коментар' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Задачу не знайдено');
    });
  });

  describe('PUT /api/comments/:id', () => {
    it('should allow the author to edit their own comment', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);
      (prisma.comment.update as jest.Mock).mockResolvedValue({
        ...mockComment,
        content: 'Відредаговано автор',
      });

      const response = await request(app)
        .put('/api/comments/501')
        .set('Authorization', `Bearer ${workerToken1}`)
        .send({ content: 'Відредаговано автор' });

      expect(response.status).toBe(200);
      expect(response.body.content).toBe('Відредаговано автор');
    });

    it('should prevent non-authors from editing the comment', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);

      const response = await request(app)
        .put('/api/comments/501')
        .set('Authorization', `Bearer ${workerToken2}`)
        .send({ content: 'Спроба зламу' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Ви можете редагувати лише власні коментарі');
    });
  });

  describe('DELETE /api/comments/:id', () => {
    it('should allow the author to delete their own comment', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);
      (prisma.comment.delete as jest.Mock).mockResolvedValue(mockComment);

      const response = await request(app)
        .delete('/api/comments/501')
        .set('Authorization', `Bearer ${workerToken1}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Коментар видалено');
    });

    it('should allow admins/managers to delete someone else\'s comment', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);
      (prisma.comment.delete as jest.Mock).mockResolvedValue(mockComment);

      const response = await request(app)
        .delete('/api/comments/501')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Коментар видалено');
    });

    it('should prevent non-author workers from deleting the comment', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);

      const response = await request(app)
        .delete('/api/comments/501')
        .set('Authorization', `Bearer ${workerToken2}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Недостатньо прав для видалення цього коментаря');
    });
  });
});
