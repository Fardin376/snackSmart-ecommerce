import express from 'express';
import {
  registerUser,
  loginUser,
  confirmEmail,
  getUser,
} from '../controllers/authController.js';

const router = express.Router();

/**
 * POST /api/auth/register - Register a new user
 */
router.post('/register', registerUser);

/**
 * POST /api/auth/login - Login user
 */
router.post('/login', loginUser);

/**
 * GET /api/auth/confirm - Confirm email address
 */
router.get('/confirm', confirmEmail);

/**
 * GET /api/auth/user/:id - Get user details (protected)
 */
router.get('/user/:id', getUser);

export default router;
