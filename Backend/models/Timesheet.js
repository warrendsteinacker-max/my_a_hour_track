import mongoose from 'mongoose';

/**
 * TIMESHEET SCHEMA
 * Acts as the 'Volatile Memory' for the React Native frontend.
 * Data is wiped from here every cycle and moved to /storage/users/.
 */
const timesheetSchema = new mongoose.Schema({
    // Username used to filter data so users only see their own hours
    username: { 
        type: String, 
        required: true, 
        index: true 
    },
    // The date for the entry (Format: YYYY-MM-DD or MM/DD/YYYY)
    date: { 
        type: String, 
        required: true 
    },
    // Total hours worked for that specific day
    hours: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    // Optional task description
    task: { 
        type: String, 
        default: "" 
    },
    // Captured from users.json at login to ensure pay calculation is locked in
    hourlyRate: { 
        type: Number, 
        required: true 
    }
}, { 
    timestamps: true // Tracks exactly when entries were created/updated
});

// Compound index to ensure a user can only have ONE entry per date
timesheetSchema.index({ username: 1, date: 1 }, { unique: true });

const Timesheet = mongoose.model('Timesheet', timesheetSchema);

export default Timesheet;