import { PrismaClient } from '@prisma/client';
import { verifyEmailToken } from '../utils/auth.js';

const prisma = new PrismaClient();

/**
 * GET /api/email/confirm - Confirm user email
 */
export const confirmEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Token missing' });
    }

    const payload = verifyEmailToken(token);

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: { confirmed: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'Email confirmed' });
  } catch (error) {
    console.error('Email confirmation error:', error);
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
};
