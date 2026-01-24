import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the storage directory exists for 24/7 persistence
const logDir = path.join(__dirname, '../storage');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logFilePath = path.join(logDir, 'system_access.log');

export const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Identify if the request is from the Internal Scheduler
    const isInternal = req.body?.systemKey ? '[INTERNAL-SCHEDULER]' : '[REMOTE-USER]';

    const logEntry = `[${timestamp}] ${isInternal} ${method} ${url} - IP: ${ip}\n`;

    // 1. Log to Console (Visible via 'pm2 logs')
    console.log(logEntry.trim());

    // 2. Append to physical log file for long-term auditing
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error("FAILED TO WRITE TO SYSTEM LOG:", err);
        }
    });

    next();
};