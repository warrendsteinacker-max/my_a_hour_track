import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your manually managed users file
const usersFilePath = path.join(__dirname, '../users.json');

/**
 * @desc    Login user using credentials from users.json
 * @route   POST /api/auth/login
 */
export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Read the local JSON file
        if (!fs.existsSync(usersFilePath)) {
            return res.status(500).json({ message: "System Error: users.json missing" });
        }

        const fileData = fs.readFileSync(usersFilePath, 'utf8');
        const users = JSON.parse(fileData);

        // 2. Find matching user
        const user = users.find(u => u.username === username && u.password === password);

        if (!user) {
            return res.status(401).json({ 
                message: "Invalid Credentials. Contact 231-878-0753 for access." 
            });
        }

        // 3. Generate JWT containing the Architect Role and Hourly Rate
        const token = jwt.sign(
            { 
                id: user.username, 
                role: user.role, 
                hourlyRate: user.hourlyRate 
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // 4. Send response to React Native frontend
        res.json({
            username: user.username,
            role: user.role,
            hourlyRate: user.hourlyRate,
            token: token
        });

    } catch (error) {
        res.status(500).json({ message: "Server error during authentication" });
    }
};

/**
 * @desc    Get current user (Persistent Session)
 * @route   GET /api/auth/me
 */
export const getMe = async (req, res) => {
    try {
        // req.user is populated by the protect middleware
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({ message: "Session expired" });
    }
};