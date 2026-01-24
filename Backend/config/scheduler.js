import cron from 'node-cron';
import axios from 'axios';
import 'dotenv/config';

// 1. CONFIGURATION: Toggle 'true' for 1-minute testing, 'false' for 7-day production
// As per your requirement: Every 7 days or every 1 minute for testing.
const IS_TEST_MODE = true; 
const cronSchedule = IS_TEST_MODE ? '*/1 * * * *' : '0 0 * * 0';

cron.schedule(cronSchedule, async () => {
    const timestamp = new Date().toLocaleString();
    console.log(`[${timestamp}] Initiating ${IS_TEST_MODE ? 'TEST' : 'WEEKLY'} Cycle...`);

    try {
        // 2. SELF-POST REQUEST:
        // Using 0.0.0.0 for Tailscale network compatibility as configured in app.listen.
        // The endpoint is /api/sheet/generate-invoices based on our sheetRoutes setup.
        const response = await axios.post(`http://0.0.0.0:${process.env.PORT || 5000}/api/sheet/generate-invoices`, {
            reason: IS_TEST_MODE ? "Minute-based Test Run" : "Standard Weekly Run",
            systemKey: process.env.INTERNAL_SYSTEM_KEY // Bypasses Admin role check via .env key
        });

        if (response.status === 200) {
            console.log(`[${timestamp}] SUCCESS: Invoices generated & DB wiped. Front-end tables will clear.`);
        }
    } catch (err) {
        // Log errors to PM2 console so you can see them via 'pm2 logs'
        console.error(`[${timestamp}] SCHEDULER ERROR:`, err.response?.data?.message || err.message);
    }
});

export default cron;