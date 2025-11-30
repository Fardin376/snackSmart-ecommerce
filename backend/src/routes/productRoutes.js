import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
} from '../controllers/productController.js';

const router = express.Router();

/**
 * GET /api/products - Get all products
 */
router.get('/', getAllProducts);

/**
 * GET /api/products/:id - Get product by ID
 */
router.get('/:id', getProductById);

/**
 * POST /api/products - Create product (admin only)
 */
router.post('/', createProduct);

export default router;
