import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../utils/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const getIp = (req: Request) => req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, full_name } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ error: 'Користувач з таким email вже існує' });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, full_name },
    });

    await prisma.authLog.create({
      data: { user_id: user.id, email, ip: getIp(req), success: true },
    });

    res.status(201).json({ message: 'Реєстрація успішна' });
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      await prisma.authLog.create({
        data: { email, ip: getIp(req), success: false },
      });
      res.status(401).json({ error: 'Невірний email або пароль' });
      return;
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user_id: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.authLog.create({
      data: { user_id: user.id, email, ip: getIp(req), success: true },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_color: user.avatar_color,
        department: user.department,
      },
    });
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

// Google OAuth — верифікує id_token від фронту, створює або знаходить юзера
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;
    if (!credential) {
      res.status(400).json({ error: 'Google credential відсутній' });
      return;
    }

    // Верифікуємо токен через Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ error: 'Невалідний Google токен' });
      return;
    }

    const { email, name, sub: googleId } = payload;

    // Знаходимо або створюємо юзера
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Новий юзер через Google
      user = await prisma.user.create({
        data: {
          email,
          full_name: name ?? email.split('@')[0],
          google_id: googleId,
          password: null, // Google-юзери без пароля
        },
      });
    } else if (!user.google_id) {
      // Існуючий email-юзер — прив'язуємо Google
      user = await prisma.user.update({
        where: { id: user.id },
        data: { google_id: googleId },
      });
    }

    await prisma.authLog.create({
      data: { user_id: user.id, email, ip: getIp(req), success: true },
    });

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user_id: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_color: user.avatar_color,
        department: user.department,
      },
    });
  } catch (err) {
    console.error('Google auth error:', err instanceof Error ? err.message : err);
    res.status(401).json({ error: 'Google автентифікація не вдалась', details: err instanceof Error ? err.message : String(err) });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401).json({ error: 'Refresh token відсутній' });
      return;
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expires_at < new Date()) {
      res.status(401).json({ error: 'Refresh token недійсний' });
      return;
    }

    const payload = verifyRefreshToken(token);

    await prisma.refreshToken.delete({ where: { token } });
    await prisma.refreshToken.deleteMany({ where: { user_id: payload.userId, expires_at: { lt: new Date() } } });

    const newAccessToken = generateAccessToken({ userId: payload.userId, email: payload.email, role: payload.role });
    const newRefreshToken = generateRefreshToken({ userId: payload.userId, email: payload.email, role: payload.role });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        user_id: payload.userId,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Вихід успішний' });
  } catch {
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) { res.status(401).json({ error: 'Не авторизовано' }); return; }
    const token = authHeader.split(' ')[1];
    const { verifyAccessToken } = await import('../utils/jwt');
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, full_name: true, role: true, avatar_color: true, department: true },
    });

    if (!user) { res.status(404).json({ error: 'Користувача не знайдено' }); return; }
    res.json(user);
  } catch {
    res.status(401).json({ error: 'Токен недійсний' });
  }
};