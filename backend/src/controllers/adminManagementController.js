import prisma from '../utils/prisma.js';
import { hashPassword } from '../utils/auth.js';
import { z } from 'zod';

const adminSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['Super Admin', 'Staff Admin']),
});

/**
 * Get all admins
 */
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(admins);
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create new admin (Super Admin only)
 */
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    const validatedData = adminSchema.parse({ name, email, password, role });

    // Check if email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: validatedData.email },
    });

    if (existingAdmin) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin,
    });
  } catch (error) {
    console.error('Create admin error:', error);

    if (error.errors) {
      return res.status(400).json({
        errors: error.errors.map((e) => e.message),
      });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update admin
 */
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const admin = await prisma.admin.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    res.json({
      message: 'Admin updated successfully',
      admin,
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Deactivate admin (Super Admin only)
 */
export const deactivateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deactivating yourself
    if (parseInt(id) === req.adminId) {
      return res
        .status(400)
        .json({ message: 'Cannot deactivate your own account' });
    }

    const admin = await prisma.admin.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    res.json({
      message: 'Admin deactivated successfully',
      admin,
    });
  } catch (error) {
    console.error('Deactivate admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete admin (Super Admin only)
 */
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (parseInt(id) === req.adminId) {
      return res
        .status(400)
        .json({ message: 'Cannot delete your own account' });
    }

    await prisma.admin.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
