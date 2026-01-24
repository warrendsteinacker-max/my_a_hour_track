import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Route Imports - ESM requires the .js extension for local files
import authRoutes from './routes/authRoutes.js';
import sheetRoutes from './routes/sheetRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Middleware Imports
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { logger } from './middleware/logger.js';

// ESM fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuration
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Binding to 0.0.0.0 for Tailscale access

// 1. GLOBAL MIDDLEWARE
app.use(cors()); 
app.use(express.json()); 
app.use(logger); 

// 2. ENSURE STORAGE DIRECTORY EXISTS
const storagePath = path.join(__dirname, 'storage', 'users');
if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
}

// 3. MVC ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/sheet', sheetRoutes);
app.use('/api/admin', adminRoutes);

// 4. HEALTH CHECK (For PM2 24/7 Monitoring)
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'Online',
        uptime: process.uptime(),
        network: 'Private Tailscale Active',
        timestamp: new Date().toISOString()
    });
});

// 5. ERROR HANDLING MIDDLEWARE
app.use(errorMiddleware);

// 6. START SERVER
app.listen(PORT, HOST, () => {
    console.log(`=========================================`);
    console.log(`  ARCHITECT BACKEND (ESM MODE) LIVE      `);
    console.log(`  PORT: ${PORT}                          `);
    console.log(`  HOST: ${HOST} (Tailscale Ready)       `);
    console.log(`  PM2: Active 24/7                      `);
    console.log(`=========================================`);
});