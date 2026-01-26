import express from 'express';
import { 
    saveHours, 
    getUserHours, 
    generateInvoices 
} from '../controllers/sheetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/sheet/generate-invoices
 * @desc    Weekly/1-min trigger. Moves DB data to /storage/users and wipes DB.
 * @access  System (Key) or Admin (JWT)
 */
router.post('/generate-invoices', (req, res, next) => {
    const { systemKey } = req.body;

    // 1. Check if the internal scheduler is using the secret key from your .env [cite: 2026-01-24]
    if (systemKey && systemKey === process.env.INTERNAL_SYSTEM_KEY) {
        console.log("[SECURITY] Internal Scheduler Verified via System Key. Bypassing JWT.");
        return next(); 
    }

    // 2. If no key is present, fall back to standard JWT protection for manual Admin triggers [cite: 2026-01-24]
    return protect(req, res, next);
}, generateInvoices);

// --- PROTECTED USER ROUTES ---
// All routes below this line require a valid JWT login token [cite: 2026-01-24]
router.use(protect);

/**
 * @route   POST /api/sheet/save
 * @desc    Saves a specific day's hours. Uses req.user.username to index. [cite: 2026-01-24]
 */
router.post('/save', saveHours);

/**
 * @route   GET /api/sheet/my-hours
 * @desc    Fetches only the records belonging to the logged-in user. [cite: 2026-01-24]
 */
router.get('/my-hours', getUserHours);

export default router;