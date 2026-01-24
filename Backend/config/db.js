import mongoose from 'mongoose';
import 'dotenv/config';

/**
 * Connects to the MongoDB database using the URI provided in the .env file.
 * Configured for 24/7 operation with PM2.
 */
const connectDB = async () => {
    try {
        // Ensure your .env has MONGO_URI=mongodb://...
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`-----------------------------------------`);
        console.log(`  MONGODB CONNECTED: ${conn.connection.host}`);
        console.log(`  STATUS: Ready for Architect Access      `);
        console.log(`-----------------------------------------`);
    } catch (error) {
        console.error(`DATABASE ERROR: ${error.message}`);
        // Exit process with failure so PM2 knows to attempt a restart
        process.exit(1);
    }
};

// Monitor connection events for long-term stability
mongoose.connection.on('disconnected', () => {
    console.warn('WARNING: MongoDB disconnected. Check network/Tailscale status.');
});

mongoose.connection.on('error', (err) => {
    console.error(`CRITICAL MONGODB ERROR: ${err}`);
});

export default connectDB;