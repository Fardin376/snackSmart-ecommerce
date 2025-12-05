import prisma from '../utils/prisma.js';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  image: z.string().url('Invalid image URL').optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

const stockUpdateSchema = z.object({
  stock: z.number().int().min(0, 'Stock must be a non-negative integer'),
});

/**
 * Get all products (admin view with stock)
 */
export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create product
 */
export const createProduct = async (req, res) => {
  try {
    const validatedData = productSchema.parse(req.body);

    const product = await prisma.product.create({
      data: validatedData,
    });

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);

    if (error.errors) {
      return res.status(400).json({
        errors: error.errors.map((e) => e.message),
      });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update product
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = productSchema.partial().parse(req.body);

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: validatedData,
    });

    res.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);

    if (error.errors) {
      return res.status(400).json({
        errors: error.errors.map((e) => e.message),
      });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete product (hard delete - remove from database)
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update stock
 */
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = stockUpdateSchema.parse(req.body);

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { stock },
    });

    res.json({
      message: 'Stock updated successfully',
      product,
    });
  } catch (error) {
    console.error('Update stock error:', error);

    if (error.errors) {
      return res.status(400).json({
        errors: error.errors.map((e) => e.message),
      });
    }

    res.status(500).json({ message: 'Server error' });
  }
};
