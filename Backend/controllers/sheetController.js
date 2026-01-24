import Timesheet from '../models/Timesheet.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for user data retrieval
export const getUserHours = async (req, res) => {
    try {
        const records = await Timesheet.find({ username: req.user.username });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch data." });
    }
};

// Helper for saving daily entries
export const saveHours = async (req, res) => {
    const { date, hours, task } = req.body;
    try {
        const entry = await Timesheet.findOneAndUpdate(
            { username: req.user.username, date },
            { 
                hours, 
                task, 
                hourlyRate: req.user.hourlyRate // Rate from session/JWT
            },
            { upsert: true, new: true }
        );
        res.status(200).json(entry);
    } catch (error) {
        res.status(500).json({ message: "Error saving hours." });
    }
};

/**
 * @desc    The Reset: Moves DB to JSON Files and clears UI
 */
export const generateInvoices = async (req, res) => {
    const { systemKey } = req.body;
    
    // Check against .env variables instead of hardcoded strings
    const isSystem = systemKey === process.env.INTERNAL_SYSTEM_KEY;
    const isAdmin = req.user?.role === process.env.ADMIN_ROLE_ID;

    if (!isSystem && !isAdmin) {
        return res.status(403).json({ message: "Unauthorized Trigger - Access Denied" });
    }

    try {
        const allRecords = await Timesheet.find({});
        if (allRecords.length === 0) return res.status(200).json({ message: "Empty" });

        const grouped = allRecords.reduce((acc, rec) => {
            acc[rec.username] = acc[rec.username] || [];
            acc[rec.username].push(rec);
            return acc;
        }, {});

        for (const username in grouped) {
            const userRecords = grouped[username];
            const rate = userRecords[0].hourlyRate || 0;
            const totalHours = userRecords.reduce((sum, r) => sum + r.hours, 0);

            const userDir = path.join(__dirname, '../storage/users', username);
            if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

            // Filename: MM-DD-YYYY_Username.json
            const dateStr = new Date().toLocaleDateString('en-US').replace(/\//g, '-');
            const fileName = `${dateStr}_${username}.json`;
            
            fs.writeFileSync(path.join(userDir, fileName), JSON.stringify({
                invoiceDate: dateStr,
                username,
                hourlyRate: rate,
                totalHours,
                totalPay: `$${(totalHours * rate).toFixed(2)}`,
                details: userRecords
            }, null, 2));
        }

        // Wipe MongoDB to reset the React Native frontend table
        await Timesheet.deleteMany({});
        res.status(200).json({ message: "Cycle complete. UI cleared." });
    } catch (error) {
        res.status(500).json({ message: "System wipe failed." });
    }
};