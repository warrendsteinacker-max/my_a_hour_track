import express from 'express';
import { 
    saveHours, 
    getUserHours, 
    generateInvoices 
} from '../controllers/sheetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// protect middleware ensures req.user is populated with username and rate
router.use(protect);

/**
 * @route   POST /api/sheet/save
 * @desc    Saves a specific day's hours. Uses req.user.username to index.
 */
router.post('/save', saveHours);

/**
 * @route   GET /api/sheet/my-hours
 * @desc    Fetches only the records belonging to the logged-in user.
 */
router.get('/my-hours', getUserHours);

/**
 * @route   POST /api/sheet/generate-invoices
 * @desc    Weekly/1-min trigger. Moves DB data to /storage/users and wipes DB.
 * @access  System/Admin Only
 */
router.post('/generate-invoices', generateInvoices);

export default router;