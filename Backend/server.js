import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// 1. CONFIG & DB IMPORTS
import connectDB from './config/db.js';
import './config/scheduler.js'; // Just importing it starts the background tasks

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

// Initialize MongoDB
connectDB();

// Global Configuration
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Essential for Tailscale network binding

// 4. GLOBAL MIDDLEWARE
app.use(cors()); 
app.use(express.json()); 
app.use(logger); 

// 5. STORAGE SETUP (For local logs and temp files)
const storagePath = path.join(__dirname, 'storage');
if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
}

// 6. MVC ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/sheet', sheetRoutes);
app.use('/api/admin', adminRoutes);

// Health Check for PM2 monitoring
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'Online',
        uptime: process.uptime(),
        database: 'Connected',
        scheduler: 'Active',
        network: 'Private Tailscale Active'
    });
});

// 7. ERROR HANDLING
app.use(errorMiddleware);

app.listen(PORT, HOST, () => {
    console.log(`=========================================`);
    console.log(`  ARCHITECT SYSTEM: 24/7 ACTIVE         `);
    console.log(`  MONGODB: Connected                    `);
    console.log(`  SCHEDULER: Running Background Tasks   `);
    console.log(`  TAILSCALE: http://${HOST}:${PORT}     `);
    console.log(`=========================================`);
});