import express from 'express';
import {
  adminLogin,
  getAdminProfile,
} from '../controllers/adminAuthController.js';
import { verifyAdminToken } from '../middleware/adminAuth.js';

const router = express.Router();

/**
 * POST /api/admin/auth/login - Admin login
 */
router.post('/login', adminLogin);

/**
 * GET /api/admin/auth/profile - Get admin profile
 */
router.get('/profile', verifyAdminToken, getAdminProfile);

export default router;
