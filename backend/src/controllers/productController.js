import { PrismaClient } from '@prisma/client';
import { productSchema } from '../utils/validators.js';

const prisma = new PrismaClient();

/**
 * Get all products with optional search and sort
 */
export const getAllProducts = async (req, res) => {
  try {
    const { search, sortBy, sortOrder } = req.query;

    console.log('Search query:', { search, sortBy, sortOrder });

    // Build where clause for search (MySQL is case-insensitive by default)
    const where =
      search && search.trim()
        ? {
            OR: [
              { name: { contains: search.trim() } },
              { description: { contains: search.trim() } },
              { category: { contains: search.trim() } },
            ],
          }
        : {};

    console.log('Where clause:', JSON.stringify(where, null, 2));

    // Build orderBy clause for sorting
    let orderBy = { createdAt: 'desc' }; // Default sort

    if (sortBy === 'name') {
      orderBy = { name: sortOrder === 'desc' ? 'desc' : 'asc' };
    } else if (sortBy === 'price') {
      orderBy = { price: sortOrder === 'desc' ? 'desc' : 'asc' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        image: true,
        createdAt: true,
      },
    });

    console.log(`Found ${products.length} products`);

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create product (admin only - example)
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, image } = req.body;

    // Validate input
    const validatedData = productSchema.parse({
      name,
      description,
      category,
      price: parseFloat(price),
      image,
    });

    const product = await prisma.product.create({
      data: validatedData,
    });

    res.status(201).json(product);
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
