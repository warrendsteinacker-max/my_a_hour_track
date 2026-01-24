import express from 'express';
import { login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user against users.json & retrieve token/hourlyRate
 * @access  Public (Access controlled via Tailscale IP binding)
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile to maintain session for the 24/7 UI
 * @access  Private (Requires JWT)
 */
router.get('/me', protect, getMe);

export default router;