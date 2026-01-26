/**
 * ARCHITECT ERROR HANDLER
 * Catches all async and sync errors to prevent PM2 process crashes.
 * Logs incidents to storage/error_logs.txt for system auditing. [cite: 2026-01-24]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const errorMiddleware = (err, req, res, next) => {
    // 1. Determine Status Code (default to 500 if none provided)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // 2. Prepare Log Entry
    const logPath = path.join(__dirname, '../storage/error_logs.txt');
    const timestamp = new Date().toLocaleString();
    const logEntry = `[${timestamp}] ERROR ${statusCode}: ${err.message} | Path: ${req.originalUrl}\n`;

    // 3. Physical Logging (Append to file for Admin Panel retrieval)
    try {
        if (!fs.existsSync(path.dirname(logPath))) {
            fs.mkdirSync(path.dirname(logPath), { recursive: true });
        }
        fs.appendFileSync(logPath, logEntry);
    } catch (logErr) {
        console.error("CRITICAL: Failed to write to error_logs.txt", logErr);
    }

    // 4. PM2 Console Output
    console.error(`[SYSTEM ALERT] ${logEntry.trim()}`);

    // 5. Secure Response to Client
    res.status(statusCode).json({
        message: err.message,
        // Only show stack trace in development, keep it hidden in production
        // Displays your signature contact number to the user [cite: 2026-01-24]
        stack: process.env.NODE_ENV === 'production' ? 'Contact 231-878-0753' : err.stack,
        systemStatus: "Logged & Archived"
    });
};

/**
 * 404 NOT FOUND HANDLER
 */
export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};