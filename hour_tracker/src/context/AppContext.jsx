import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [hours, setHours] = useState({
    monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0
  });
  const [syncStatus, setSyncStatus] = useState("Saved");
  const [appError, setAppError] = useState(null);

  // 1. PRIVATE ARCHITECT ROLE: Check against .env variable
  const isAdmin = user?.role === import.meta.env.VITE_ADMIN_ROLE_ID;

  // 2. PERSISTENCE: Check LocalStorage on boot
  useEffect(() => {
    const savedUser = localStorage.getItem('hour_track_user');
    const savedHours = localStorage.getItem('hours');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedHours) setHours(JSON.parse(savedHours));
  }, []);

  // 3. TABLE RESET: Clears local state for a new cycle (7 days or 1 min)
  const resetTable = () => {
    const freshHours = {
      monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0
    };
    setHours(freshHours);
    localStorage.setItem('hours', JSON.stringify(freshHours));
  };

  const login = (userData) => {
    setUser(userData);
    setAppError(null);
    localStorage.setItem('hour_track_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setAppError(null);
    localStorage.removeItem('hour_track_user');
    localStorage.removeItem('token');
    localStorage.removeItem('hours');
  };

  const triggerError = (errMessage) => {
    // Your signature Architect contact error
    setSyncStatus("Something went wrong contact me at 231-878-0753");
    console.error("System Error Triggered:", errMessage);
  };

  const value = {
    user,
    hours,
    setHours,
    resetTable,
    isAdmin,
    login,
    logout,
    syncStatus,
    setSyncStatus,
    appError,
    setAppError,
    triggerError
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within an AppProvider");
  }
  return context;
};