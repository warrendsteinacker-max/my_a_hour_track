import cron from 'node-cron';
import axios from 'axios'; // To call your own internal invoice route
import 'dotenv/config';

// Toggle this to TRUE for 1-minute testing
const IS_TEST_MODE = true; 
const cronSchedule = IS_TEST_MODE ? '*/1 * * * *' : '0 0 * * 0';

cron.schedule(cronSchedule, async () => {
    console.log(`Running ${IS_TEST_MODE ? 'TEST' : 'WEEKLY'} Invoice Generation...`);
    try {
        // This calls your server's own internal logic to process all users
        await axios.post(`http://localhost:${process.env.PORT || 5000}/api/admin/generate-invoices`, {
            reason: IS_TEST_MODE ? "Minute-based Test Run" : "Standard Weekly Run"
        });
        console.log("Invoices processed successfully.");
    } catch (err) {
        console.error("Invoicing Task Failed:", err.message);
    }
});

export default cron;