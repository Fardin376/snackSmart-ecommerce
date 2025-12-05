import prisma from '../utils/prisma.js';

// Get user's cart with product details
export async function getCart(req, res) {
  try {
    const userId = parseInt(req.user.userId);

    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            image: true,
            stock: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the response to flatten product data
    const formattedCart = cartItems.map((item) => ({
      id: item.id,
      userId: item.userId,
      productId: item.productId,
      quantity: item.quantity,
      name: item.product.name,
      description: item.product.description,
      price: item.product.price,
      image: item.product.image,
      stock: item.product.stock,
      category: item.product.category,
      createdAt: item.createdAt,
    }));

    res.json({ ok: true, data: formattedCart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch cart' });
  }
}

// Add item to cart or update quantity if already exists
export async function addToCart(req, res) {
  try {
    const userId = parseInt(req.user.userId);
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ ok: false, error: 'Product ID is required' });
    }

    // Check if product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return res.status(404).json({ ok: false, error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ ok: false, error: 'Insufficient stock' });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId),
        },
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + parseInt(quantity);

      if (product.stock < newQuantity) {
        return res.status(400).json({ ok: false, error: 'Insufficient stock' });
      }

      cartItem = await prisma.cart.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: {
          product: true,
        },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cart.create({
        data: {
          userId,
          productId: parseInt(productId),
          quantity: parseInt(quantity),
        },
        include: {
          product: true,
        },
      });
    }

    res.json({ ok: true, data: cartItem });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ ok: false, error: 'Failed to add to cart' });
  }
}

// Update cart item quantity
export async function updateCartQuantity(req, res) {
  try {
    const userId = parseInt(req.user.userId);
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res
        .status(400)
        .json({ ok: false, error: 'Product ID and quantity are required' });
    }

    if (quantity < 1) {
      return res
        .status(400)
        .json({ ok: false, error: 'Quantity must be at least 1' });
    }

    // Check product stock
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return res.status(404).json({ ok: false, error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ ok: false, error: 'Insufficient stock' });
    }

    // Update cart item
    const cartItem = await prisma.cart.update({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId),
        },
      },
      data: { quantity: parseInt(quantity) },
      include: {
        product: true,
      },
    });

    res.json({ ok: true, data: cartItem });
  } catch (error) {
    console.error('Error updating cart:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ ok: false, error: 'Cart item not found' });
    }
    res.status(500).json({ ok: false, error: 'Failed to update cart' });
  }
}

// Remove item from cart
export async function removeFromCart(req, res) {
  try {
    const userId = parseInt(req.user.userId);
    const { productId } = req.params;

    if (!productId) {
      return res
        .status(400)
        .json({ ok: false, error: 'Product ID is required' });
    }

    await prisma.cart.delete({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId),
        },
      },
    });

    res.json({ ok: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ ok: false, error: 'Cart item not found' });
    }
    res.status(500).json({ ok: false, error: 'Failed to remove from cart' });
  }
}

// Clear entire cart
export async function clearCart(req, res) {
  try {
    const userId = parseInt(req.user.userId);

    await prisma.cart.deleteMany({
      where: { userId },
    });

    res.json({ ok: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ ok: false, error: 'Failed to clear cart' });
  }
}
