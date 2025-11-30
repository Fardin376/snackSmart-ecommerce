import { PrismaClient } from '@prisma/client';
import { comparePassword, signAccessToken } from '../utils/auth.js';
import { z } from 'zod';

const prisma = new PrismaClient();

const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Admin login
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const validatedData = adminLoginSchema.parse({ email, password });

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: validatedData.email },
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res
        .status(403)
        .json({ message: 'Your account has been deactivated.' });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate access token
    const token = signAccessToken({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);

    if (error.errors) {
      return res.status(400).json({
        errors: error.errors.map((e) => e.message),
      });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get admin profile
 */
export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.adminId; // Set by auth middleware

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(admin);
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
