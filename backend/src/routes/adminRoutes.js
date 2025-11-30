import express from 'express';
import {
  getAllCustomers,
  updateCustomerStatus,
  getCustomerById,
} from '../controllers/customerController.js';
import {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deactivateAdmin,
  deleteAdmin,
} from '../controllers/adminManagementController.js';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} from '../controllers/inventoryController.js';
import {
  getSalesSummary,
  getTopProducts,
  getRecentOrders,
  getAllOrders,
  getDashboardStats,
} from '../controllers/salesController.js';
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  deactivateCoupon,
  validateCoupon,
} from '../controllers/couponController.js';
import { verifyAdminToken, verifySuperAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// All admin routes require authentication
router.use(verifyAdminToken);

// Dashboard Stats
router.get('/dashboard/stats', getDashboardStats);

// Customer Management
router.get('/customers', getAllCustomers);
router.get('/customers/:id', getCustomerById);
router.patch('/customers/:id/status', updateCustomerStatus);

// Admin Management (Super Admin only for create/delete)
router.get('/admins', getAllAdmins);
router.post('/admins', verifySuperAdmin, createAdmin);
router.put('/admins/:id', updateAdmin);
router.patch('/admins/:id/deactivate', verifySuperAdmin, deactivateAdmin);
router.delete('/admins/:id', verifySuperAdmin, deleteAdmin);

// Inventory Management
router.get('/inventory/products', getAllProducts);
router.post('/inventory/products', createProduct);
router.put('/inventory/products/:id', updateProduct);
router.delete('/inventory/products/:id', deleteProduct);
router.patch('/inventory/products/:id/stock', updateStock);

// Sales & Orders
router.get('/sales/summary', getSalesSummary);
router.get('/sales/top-products', getTopProducts);
router.get('/sales/recent-orders', getRecentOrders);
router.get('/sales/orders', getAllOrders);

// Coupons Management
router.get('/coupons', getAllCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);
router.patch('/coupons/:id/deactivate', deactivateCoupon);

// Public coupon validation (no auth required)
router.get('/coupons/validate/:code', validateCoupon);

export default router;
