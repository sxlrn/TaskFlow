// Set up environment variables before importing anything
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_jwt_access_secret_key_for_testing';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_key_for_testing';

import request from 'supertest';
import app from '../index';
import prisma from '../utils/prisma';
import { generateAccessToken } from '../utils/jwt';

// Mock the Prisma client for projects
jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: {
    project: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Project API Endpoints', () => {
  const adminToken = generateAccessToken({
    userId: 1,
    email: 'admin@taskflow.com',
    role: 'admin',
  });

  const managerToken1 = generateAccessToken({
    userId: 2,
    email: 'manager1@taskflow.com',
    role: 'manager',
  });

  const managerToken2 = generateAccessToken({
    userId: 3,
    email: 'manager2@taskflow.com',
    role: 'manager',
  });

  const mockProject = {
    id: 1,
    title: 'Реконструкція веб-сайту',
    description: 'Оновлення дизайну',
    status: 'active',
    priority: 'medium',
    color: '#4f46e5',
    deadline: new Date().toISOString(),
    manager_id: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/projects', () => {
    it('should return all projects', async () => {
      (prisma.project.findMany as jest.Mock).mockResolvedValue([mockProject]);

      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0].title).toBe('Реконструкція веб-сайту');
      expect(prisma.project.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should return a single project by id', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const response = await request(app)
        .get('/api/projects/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Реконструкція веб-сайту');
      expect(prisma.project.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
        })
      );
    });

    it('should return 404 if project is not found', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/projects/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Проєкт не знайдено');
    });
  });

  describe('POST /api/projects', () => {
    it('should allow managers/admins to create projects', async () => {
      const input = {
        title: 'Новий стартап',
        description: 'Розробка MVP',
      };
      (prisma.project.create as jest.Mock).mockResolvedValue({
        ...mockProject,
        id: 2,
        title: input.title,
        manager_id: 2,
      });

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer={managerToken1}`)
        .set('Authorization', `Bearer ${managerToken1}`)
        .send(input);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Новий стартап');
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Новий стартап',
          manager_id: 2,
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should allow the assigned manager to update the project', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.project.update as jest.Mock).mockResolvedValue({
        ...mockProject,
        title: 'Оновлена назва проєкту',
      });

      const response = await request(app)
        .put('/api/projects/1')
        .set('Authorization', `Bearer ${managerToken1}`)
        .send({ title: 'Оновлена назва проєкту' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Оновлена назва проєкту');
    });

    it('should prevent other managers from updating the project', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const response = await request(app)
        .put('/api/projects/1')
        .set('Authorization', `Bearer ${managerToken2}`)
        .send({ title: 'Спроба зламу' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Недостатньо прав');
    });

    it('should allow administrators to update any project', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.project.update as jest.Mock).mockResolvedValue({
        ...mockProject,
        title: 'Оновлено адміном',
      });

      const response = await request(app)
        .put('/api/projects/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Оновлено адміном' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Оновлено адміном');
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should allow the assigned manager to delete the project', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.project.delete as jest.Mock).mockResolvedValue(mockProject);

      const response = await request(app)
        .delete('/api/projects/1')
        .set('Authorization', `Bearer ${managerToken1}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Проєкт видалено');
    });

    it('should prevent other managers from deleting the project', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const response = await request(app)
        .delete('/api/projects/1')
        .set('Authorization', `Bearer ${managerToken2}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Недостатньо прав');
    });
  });
});
