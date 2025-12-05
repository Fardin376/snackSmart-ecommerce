import prisma from '../utils/prisma.js';
import { productSchema } from '../utils/validators.js';

/**
 * Get all products with optional search and sort
 */
export const getAllProducts = async (req, res) => {
  try {
    const { search, sortBy, sortOrder, userId, sessionId } = req.query;

    console.log('Search query:', {
      search,
      sortBy,
      sortOrder,
      userId,
      sessionId,
    });

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
    } else if (sortBy === 'preferences' && (userId || sessionId)) {
      // Sort by user preferences
      const identifier = userId ? { userId: parseInt(userId) } : { sessionId };

      // Get user's recent preferences
      const preferences = await prisma.userPreference.findMany({
        where: identifier,
        select: {
          productId: true,
          category: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      if (preferences.length > 0) {
        // Get products and sort by preference relevance
        const preferredProductIds = preferences.map((p) => p.productId);
        const preferredCategories = [
          ...new Set(preferences.map((p) => p.category).filter(Boolean)),
        ];

        const products = await prisma.product.findMany({
          where,
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

        // Sort products by preference (viewed products first, then by category match)
        const sortedProducts = products.sort((a, b) => {
          const aViewed = preferredProductIds.includes(a.id);
          const bViewed = preferredProductIds.includes(b.id);
          const aInCategory = preferredCategories.includes(a.category);
          const bInCategory = preferredCategories.includes(b.category);

          if (aViewed && !bViewed) return -1;
          if (!aViewed && bViewed) return 1;
          if (aInCategory && !bInCategory) return -1;
          if (!aInCategory && bInCategory) return 1;
          return 0;
        });

        console.log(
          `Found ${sortedProducts.length} products (sorted by preferences)`
        );
        return res.json(sortedProducts);
      }
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
