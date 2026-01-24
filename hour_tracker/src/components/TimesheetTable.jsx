import React, { useState, useEffect } from 'react';
import api from '../api';
import { useGlobalContext } from '../context/AppContext';

const TimesheetTable = () => {
  // Pulling 'resetTable' from context to handle the weekly/test-mode wipe
  const { user, logout, setSyncStatus, triggerError, resetTable } = useGlobalContext();
  
  const [hours, setHours] = useState({
    monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0
  });

  // 1. POLLING LOGIC: Checks the server for updates every minute
  // This detects if the 7-day or 1-minute scheduler has cleared the database
  useEffect(() => {
    const fetchCurrentHours = async () => {
      if (!user?.username) return; 
      try {
        const res = await api.get(`/api/sheet/current/${user.username}`);
        
        // If the server returns empty hours but our local state has data, 
        // it means the scheduler triggered an invoice and wiped the week.
        const serverHasData = Object.values(res.data).some(v => v > 0);
        const localHasData = Object.values(hours).some(v => v > 0);

        if (!serverHasData && localHasData) {
          console.log("Invoice generated: Clearing local table for new cycle.");
          resetTable(); // Resets context and local storage
          setHours(res.data); // Update UI state to zeros
        } else {
          setHours(res.data);
        }
      } catch (err) {
        console.error("Sync error: check Tailscale connection.");
      }
    };

    fetchCurrentHours();
    
    // Set up the 24/7 interval for the test feature toggle
    const interval = setInterval(fetchCurrentHours, 60000); // Poll every 1 min
    return () => clearInterval(interval);
  }, [user?.username, resetTable]);

  // 2. Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setHours(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    setSyncStatus("Unsaved Changes"); // Let user know they need to sync
  };

  // 3. Save to Backend (Manual Sync)
  const handleSave = async () => {
    try {
      setSyncStatus("Syncing...");
      await api.post('/api/sheet/save', {
        username: user.username,
        hours: hours,
        hourlyRate: user.hourlyRate
      });
      setSyncStatus("Saved");
    } catch (err) {
      // Triggers your "231-878-0753" status bar message via triggerError
      triggerError("Could not save timesheet.");
    }
  };

  // Calculate Total
  const totalHours = Object.values(hours).reduce((a, b) => a + b, 0);

  if (!user) return <div className="loading">Loading user profile...</div>;

  return (
    <div className="timesheet-container">
      <header className="timesheet-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Weekly Timesheet</h2>
          <p>Employee: <strong>{user.username}</strong> | Rate: ${user.hourlyRate}/hr</p>
        </div>
        <button className="logout-button" onClick={logout} style={{ padding: '8px 15px', cursor: 'pointer' }}>
          Logout
        </button>
      </header>

      <div className="timesheet-grid">
        {Object.keys(hours).map((day) => (
          <div key={day} className="day-input">
            <label>{day.charAt(0).toUpperCase() + day.slice(1)}</label>
            <input
              type="number"
              name={day}
              value={hours[day]}
              onChange={handleChange}
              min="0"
              max="24"
              step="0.5"
            />
          </div>
        ))}
      </div>

      <div className="timesheet-summary">
        <div className="total-display">
          <span>Total Hours: <strong>{totalHours}</strong></span>
          <span>Estimated Pay: <strong>${(totalHours * user.hourlyRate).toFixed(2)}</strong></span>
        </div>
        <button className="save-button" onClick={handleSave}>
          Submit Hours
        </button>
      </div>
    </div>
  );
};

export default TimesheetTable;