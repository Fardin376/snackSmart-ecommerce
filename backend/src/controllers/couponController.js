import prisma from '../utils/prisma.js';
import { z } from 'zod';

const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive('Value must be positive'),
  validFrom: z.string().transform((str) => new Date(str)),
  validTo: z.string().transform((str) => new Date(str)),
  isActive: z.boolean().optional(),
});

/**
 * Get all coupons
 */
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Add status based on dates
    const couponsWithStatus = coupons.map((coupon) => {
      const now = new Date();
      let status = 'active';

      if (!coupon.isActive) {
        status = 'inactive';
      } else if (now < coupon.validFrom || now > coupon.validTo) {
        status = 'expired';
      }

      return {
        ...coupon,
        computedStatus: status,
      };
    });

    res.json(couponsWithStatus);
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create coupon
 */
export const createCoupon = async (req, res) => {
  try {
    const validatedData = couponSchema.parse(req.body);

    // Check if code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: validatedData.code },
    });

    if (existingCoupon) {
      return res.status(409).json({ message: 'Coupon code already exists' });
    }

    const coupon = await prisma.coupon.create({
      data: validatedData,
    });

    res.status(201).json({
      message: 'Coupon created successfully',
      coupon,
    });
  } catch (error) {
    console.error('Create coupon error:', error);

    if (error.errors) {
      return res.status(400).json({
        errors: error.errors.map((e) => e.message),
      });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update coupon
 */
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = couponSchema.partial().parse(req.body);

    const coupon = await prisma.coupon.update({
      where: { id: parseInt(id) },
      data: validatedData,
    });

    res.json({
      message: 'Coupon updated successfully',
      coupon,
    });
  } catch (error) {
    console.error('Update coupon error:', error);

    if (error.errors) {
      return res.status(400).json({
        errors: error.errors.map((e) => e.message),
      });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete coupon
 */
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.coupon.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Deactivate coupon
 */
export const deactivateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    res.json({
      message: 'Coupon deactivated successfully',
      coupon,
    });
  } catch (error) {
    console.error('Deactivate coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Validate coupon for checkout (public endpoint)
 */
export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.params;

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res
        .status(400)
        .json({ message: 'This coupon is no longer active' });
    }

    const now = new Date();
    if (now < coupon.validFrom) {
      return res.status(400).json({ message: 'This coupon is not yet valid' });
    }

    if (now > coupon.validTo) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    res.json({
      message: 'Coupon is valid',
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
