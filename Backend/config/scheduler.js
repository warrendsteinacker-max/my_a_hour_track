import cron from 'node-cron';
import axios from 'axios';
import 'dotenv/config';

// 1. CONFIGURATION: Every 7 days or every 1 minute for testing [cite: 2026-01-24]
const IS_TEST_MODE = true; 
const cronSchedule = IS_TEST_MODE ? '*/1 * * * *' : '0 0 * * 0';

/**
 * The core logic shared by the cron job and the manual Admin trigger.
 * Uses 0.0.0.0 for Tailscale network compatibility [cite: 2026-01-24].
 */
export const generateInvoicesAndClearDB = async () => {
    const timestamp = new Date().toLocaleString();
    try {
        const response = await axios.post(`http://0.0.0.0:${process.env.PORT || 5000}/api/sheet/generate-invoices`, {
            reason: IS_TEST_MODE ? "Minute-based Test Run" : "Standard Weekly Run",
            systemKey: process.env.INTERNAL_SYSTEM_KEY // Bypasses Admin role check [cite: 2026-01-24]
        });

        if (response.status === 200) {
            console.log(`[${timestamp}] SUCCESS: Invoices generated & DB wiped.`);
            return true;
        }
    } catch (err) {
        console.error(`[${timestamp}] SCHEDULER ERROR:`, err.response?.data?.message || err.message);
        throw err;
    }
};

// 2. AUTOMATED CRON JOB
cron.schedule(cronSchedule, async () => {
    const type = IS_TEST_MODE ? 'TEST' : 'WEEKLY';
    console.log(`[${new Date().toLocaleString()}] Initiating ${type} Cycle...`);
    await generateInvoicesAndClearDB();
});

export default cron;