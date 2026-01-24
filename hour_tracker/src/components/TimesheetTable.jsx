import React, { useState, useEffect } from 'react';
import api from '../api';
import { useGlobalContext } from '../context/AppContext';

const TimesheetTable = () => {
  // Added 'logout' to the context destructuring
  const { user, logout, setSyncStatus, triggerError } = useGlobalContext();
  
  const [hours, setHours] = useState({
    monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0
  });

  // 1. Load existing hours for the current week on mount
  useEffect(() => {
    const fetchCurrentHours = async () => {
      if (!user?.username) return; // Safety check
      try {
        const res = await api.get(`/api/sheet/current/${user.username}`);
        if (res.data) setHours(res.data);
      } catch (err) {
        console.error("No existing record found for this week.");
      }
    };
    fetchCurrentHours();
  }, [user?.username]);

  // 2. Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setHours(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  // 3. Save to Backend
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
      // Triggers your "231-878-0753" status bar message
      triggerError("Could not save timesheet.");
    }
  };

  // Calculate Total
  const totalHours = Object.values(hours).reduce((a, b) => a + b, 0);

  // Safety return if user hasn't loaded yet
  if (!user) return <div className="loading">Loading user profile...</div>;

  return (
    <div className="timesheet-container">
      <header className="timesheet-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Weekly Timesheet</h2>
          <p>Employee: <strong>{user.username}</strong> | Rate: ${user.hourlyRate}/hr</p>
        </div>
        {/* LOGOUT BUTTON ADDED HERE */}
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