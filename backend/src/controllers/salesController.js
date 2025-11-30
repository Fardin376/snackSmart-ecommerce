import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get sales summary
 */
export const getSalesSummary = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    const where = {};
    if (fromDate && toDate) {
      where.createdAt = {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      };
    }

    // Get total orders and revenue
    const orders = await prisma.order.findMany({
      where: { ...where, status: 'completed' },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + parseFloat(order.total),
      0
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      averageOrderValue: averageOrderValue.toFixed(2),
    });
  } catch (error) {
    console.error('Get sales summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get top selling products
 */
export const getTopProducts = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    const where = {};
    if (fromDate && toDate) {
      where.order = {
        createdAt: {
          gte: new Date(fromDate),
          lte: new Date(toDate),
        },
        status: 'completed',
      };
    } else {
      where.order = {
        status: 'completed',
      };
    }

    const orderItems = await prisma.orderItem.findMany({
      where,
      include: {
        product: true,
      },
    });

    // Group by product and calculate totals
    const productSales = {};
    orderItems.forEach((item) => {
      const productId = item.productId;
      if (!productSales[productId]) {
        productSales[productId] = {
          product: item.product,
          quantity: 0,
          revenue: 0,
        };
      }
      productSales[productId].quantity += item.quantity;
      productSales[productId].revenue += parseFloat(item.price) * item.quantity;
    });

    // Convert to array and sort
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.json(topProducts);
  } catch (error) {
    console.error('Get top products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get recent orders
 */
export const getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const orders = await prisma.order.findMany({
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json(orders);
  } catch (error) {
    console.error('Get recent orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all orders with filtering
 */
export const getAllOrders = async (req, res) => {
  try {
    const { status, fromDate, toDate } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (fromDate && toDate) {
      where.createdAt = {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get dashboard stats
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Total customers
    const totalCustomers = await prisma.user.count({
      where: { confirmed: true, isActive: true },
    });

    // Total products
    const totalProducts = await prisma.product.count({
      where: { status: 'active' },
    });

    // Today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await prisma.order.findMany({
      where: {
        status: 'completed',
        createdAt: {
          gte: today,
        },
      },
    });

    const todaySales = todayOrders.length;

    // Month revenue
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const monthOrders = await prisma.order.findMany({
      where: {
        status: 'completed',
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    const monthRevenue = monthOrders.reduce(
      (sum, order) => sum + parseFloat(order.total),
      0
    );

    res.json({
      totalCustomers,
      totalProducts,
      todaySales,
      monthRevenue: monthRevenue.toFixed(2),
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
