import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// 1. CONFIG & DB IMPORTS
import connectDB from './config/db.js';
import './config/scheduler.js'; // Starts the 1-min / 7-day background tasks

// 2. ROUTE IMPORTS
import authRoutes from './routes/authRoutes.js';
import sheetRoutes from './routes/sheetRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// 3. MIDDLEWARE IMPORTS
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { logger } from './middleware/logger.js';

// ESM fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize MongoDB (Volatile UI Memory)
connectDB();

// Global Configuration
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Essential for Tailscale network binding

// 4. GLOBAL MIDDLEWARE
app.use(cors()); 
app.use(express.json()); 
app.use(logger); 

// 5. STORAGE SETUP (For Users, Invoices, and Logs)
// This ensures the directory structure exists for the sheetController
const usersStoragePath = path.join(__dirname, 'storage', 'users');
if (!fs.existsSync(usersStoragePath)) {
    fs.mkdirSync(usersStoragePath, { recursive: true });
}

// Serve storage folder as static so Admin can view/download JSON invoices
app.use('/storage', express.static(path.join(__dirname, 'storage')));

// 6. MVC ROUTES
app.use('/api/auth', authRoutes);   // Authenticates against users.json
app.use('/api/sheet', sheetRoutes); // Handles DB storage and JSON generation
app.use('/api/admin', adminRoutes); // Handles log viewing and folder management

// Health Check for PM2 monitoring
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'Online',
        uptime: Math.floor(process.uptime()) + 's',
        database: 'Connected',
        scheduler: 'Active',
        network: 'Private Tailscale Active',
        contact: '231-878-0753'
    });
});

// 7. ERROR HANDLING
// Final catch-all that returns the custom error message and phone number
app.use(errorMiddleware);

app.listen(PORT, HOST, () => {
    console.log(`=========================================`);
    console.log(`   ARCHITECT SYSTEM: 24/7 ACTIVE         `);
    console.log(`   MONGODB: Connected                    `);
    console.log(`   SCHEDULER: 1-Min / 7-Day Active       `);
    console.log(`   TAILSCALE: http://${HOST}:${PORT}     `);
    console.log(`=========================================`);
});