import express from 'express';
import { confirmEmail } from '../controllers/emailController.js';

const router = express.Router();

/**
 * GET /api/email/confirm - Confirm user email address
 */
router.get('/confirm', confirmEmail);

export default router;
