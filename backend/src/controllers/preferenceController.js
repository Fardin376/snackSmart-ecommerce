import prisma from '../utils/prisma.js';

// Track user interaction with a product
export const trackInteraction = async (req, res) => {
  try {
    const { productId, actionType, sessionId } = req.body;
    const userId = req.user?.userId || null;

    // Validate input
    if (!productId || !actionType) {
      return res
        .status(400)
        .json({ error: 'Product ID and action type are required' });
    }

    if (!['search', 'click', 'view'].includes(actionType)) {
      return res.status(400).json({ error: 'Invalid action type' });
    }

    // Ensure we have either userId or sessionId
    if (!userId && !sessionId) {
      return res
        .status(400)
        .json({ error: 'User must be logged in or provide session ID' });
    }

    // Validate that product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      select: { id: true, category: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // For logged-in users, get their preference count
    // For guest users, use sessionId
    const identifier = userId ? { userId } : { sessionId };
 
    // Atomically handle preference rotation if limit is reached
    const preferences = await prisma.userPreference.findMany({
      where: identifier,
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
 
    // If user has 20 preferences, delete the oldest one
    if (preferences.length >= 20) {
      // The first item is the oldest because of the 'asc' order
      const oldestPreferenceId = preferences[0].id;
      await prisma.userPreference.delete({
        where: { id: oldestPreferenceId },
      });
    }

    // Create new preference
    console.log('Creating preference with data:', {
      userId,
      sessionId: userId ? null : sessionId,
      productId: parseInt(productId),
      actionType,
      category: product.category,
    });

    const preference = await prisma.userPreference.create({
      data: {
        userId,
        sessionId: userId ? null : sessionId,
        productId: parseInt(productId),
        actionType,
        category: product.category,
      },
    });

    console.log('Created preference:', preference);

    res.status(201).json({
      message: 'Interaction tracked successfully',
      preference,
    });
  } catch (error) {
    console.error('Track interaction error:', error);
    res.status(500).json({ error: 'Failed to track interaction' });
  }
};

// Get user's recent preferences
export const getRecentPreferences = async (req, res) => {
  try {
    const userId = req.user?.userId || null;
    const { sessionId } = req.query;

    console.log('getRecentPreferences called with:', { userId, sessionId });

    if (!userId && !sessionId) {
      console.log('No userId or sessionId, returning empty');
      return res.status(200).json({ preferences: [], products: [] });
    }

    const identifier = userId ? { userId } : { sessionId };
    console.log('Using identifier:', identifier);

    // Debug: Check all preferences in database for this user
    const allUserPrefs = await prisma.userPreference.findMany({
      where: userId ? { userId } : { sessionId },
      select: {
        id: true,
        userId: true,
        sessionId: true,
        productId: true,
        actionType: true,
      },
    });
    console.log('All user preferences found:', allUserPrefs);

    // Get recent preferences with product details
    const preferences = await prisma.userPreference.findMany({
      where: identifier,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
            image: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Filter out inactive products and get unique products
    const uniqueProducts = [];
    const seenProductIds = new Set();

    console.log('Found preferences:', preferences.length);

    for (const pref of preferences) {
      console.log('Processing preference:', {
        productId: pref.product.id,
        status: pref.product.status,
        name: pref.product.name,
      });

      if (
        pref.product.status === 'active' &&
        !seenProductIds.has(pref.product.id)
      ) {
        uniqueProducts.push(pref.product);
        seenProductIds.add(pref.product.id);
      }
    }

    console.log('Unique products:', uniqueProducts.length);

    res.status(200).json({
      preferences,
      products: uniqueProducts.slice(0, 4), // Show top 4 recent unique products
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to load preferences' });
  }
};

// Get personalized recommendations
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user?.userId || null;
    const { sessionId } = req.query;

    if (!userId && !sessionId) {
      return res.status(200).json({ recommendations: [] });
    }

    const identifier = userId ? { userId } : { sessionId };

    // Get user's recent preferences with categories
    const preferences = await prisma.userPreference.findMany({
      where: identifier,
      select: {
        productId: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    if (preferences.length === 0) {
      return res.status(200).json({ recommendations: [] });
    }

    // Extract viewed product IDs and categories
    const viewedProductIds = preferences.map((p) => p.productId);
    const categories = [
      ...new Set(preferences.map((p) => p.category).filter(Boolean)),
    ];

    // Get recommendations based on categories (excluding already viewed products)
    const recommendations = await prisma.product.findMany({
      where: {
        status: 'active',
        id: { notIn: viewedProductIds },
        category: categories.length > 0 ? { in: categories } : undefined,
      },
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        image: true,
        description: true,
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ recommendations });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to load recommendations' });
  }
};

// Clear all user preferences
export const clearPreferences = async (req, res) => {
  try {
    const userId = req.user?.userId || null;
    const { sessionId } = req.body;

    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'User ID or session ID required' });
    }

    const identifier = userId ? { userId } : { sessionId };

    await prisma.userPreference.deleteMany({
      where: identifier,
    });

    res.status(200).json({ message: 'Preferences cleared successfully' });
  } catch (error) {
    console.error('Clear preferences error:', error);
    res.status(500).json({ error: 'Failed to clear preferences' });
  }
};
