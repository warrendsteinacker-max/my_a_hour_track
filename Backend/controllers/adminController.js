import Timesheet from '../models/Timesheet.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path logic to match your structure: /Backend/storage/users/
const usersStoragePath = path.join(__dirname, '../storage/users');

/**
 * @desc    Get Stats: Total UI entries and System Uptime
 */
export const getSystemStats = async (req, res) => {
    try {
        const totalEntries = await Timesheet.countDocuments();
        const uptime = process.uptime(); 

        res.status(200).json({
            activeRecords: totalEntries,
            uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
            status: '24/7 Online'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving system stats' });
    }
};

/**
 * @desc    List all user directories in /storage/users/
 */
export const listUserFolders = (req, res) => {
    try {
        if (!fs.existsSync(usersStoragePath)) {
            return res.json([]);
        }

        const folders = fs.readdirSync(usersStoragePath).filter(file => 
            fs.statSync(path.join(usersStoragePath, file)).isDirectory()
        );
        
        res.status(200).json(folders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to list user directories' });
    }
};

/**
 * @desc    List all weekly JSON invoices for a specific user
 */
export const getUserInvoices = (req, res) => {
    const { username } = req.params;
    const userDirPath = path.join(usersStoragePath, username);

    try {
        if (!fs.existsSync(userDirPath)) {
            return res.json([]);
        }

        const files = fs.readdirSync(userDirPath).filter(file => file.endsWith('.json'));
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve user invoices' });
    }
};

/**
 * @desc    Delete a specific invoice file (e.g., 03-27-2005_username.json)
 */
export const deleteInvoice = (req, res) => {
    const { username, filename } = req.params;
    const filePath = path.join(usersStoragePath, username, filename);

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.status(200).json({ message: `File ${filename} deleted.` });
        } else {
            res.status(404).json({ message: 'File not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
};

/**
 * @desc    Read the raw error logs for the Admin Panel terminal
 */
export const getRawLogs = (req, res) => {
    const logPath = path.join(__dirname, '../storage/error_logs.txt');
    
    try {
        if (!fs.existsSync(logPath)) {
            return res.json({ logs: "No error logs found." });
        }

        const logs = fs.readFileSync(logPath, 'utf8');
        // Return last 100 lines for the UI
        const logLines = logs.split('\n').slice(-100).join('\n');
        res.status(200).json({ logs: logLines });
    } catch (error) {
        res.status(500).json({ message: 'Could not read log file' });
    }
};