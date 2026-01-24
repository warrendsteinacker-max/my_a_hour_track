import express from 'express';
import { 
    getSystemStats, 
    getRawLogs, 
    manualInvoiceTrigger,
    listUserFolders,
    getUserInvoices,
    deleteInvoice
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply security to all admin routes
// 1. protect: Validates JWT
// 2. adminOnly: Verifies the Architect Role ID from users.json
router.use(protect);
router.use(adminOnly);

/**
 * @route   GET /api/admin/stats
 * @desc    Get UI memory stats (Timesheet model) and system uptime
 */
router.get('/stats', getSystemStats);

/**
 * @route   GET /api/admin/logs
 * @desc    Read the physical 'system_access.log' for the terminal
 */
router.get('/logs', getRawLogs);

/**
 * @route   POST /api/admin/trigger-reset
 * @desc    Manually force a DB-to-JSON migration and clear the UI
 */
router.post('/trigger-reset', manualInvoiceTrigger);

/**
 * @route   GET /api/admin/users
 * @desc    List all subdirectories in /storage/users
 */
router.get('/users', listUserFolders);

/**
 * @route   GET /api/admin/invoices/:username
 * @desc    List all JSON files for a specific user
 */
router.get('/invoices/:username', getUserInvoices);

/**
 * @route   DELETE /api/admin/invoices/:username/:filename
 * @desc    Delete a specific JSON invoice from the server
 */
router.delete('/invoices/:username/:filename', deleteInvoice);

export default router;