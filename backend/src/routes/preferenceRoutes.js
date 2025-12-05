import express from 'express';
import {
  trackInteraction,
  getRecentPreferences,
  getRecommendations,
  clearPreferences,
} from '../controllers/preferenceController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Track product interaction (search, click, view)
router.post('/track', optionalAuth, trackInteraction);

// Get user's recent preferences
router.get('/recent', optionalAuth, getRecentPreferences);

// Get personalized recommendations
router.get('/recommendations', optionalAuth, getRecommendations);

// Clear all preferences
router.delete('/clear', optionalAuth, clearPreferences);

export default router;
