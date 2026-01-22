import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Create the Context
const AppContext = createContext();

// 2. The Provider Component
export const AppProvider = ({ children }) => {
  // Global State for the user (username, hourlyRate, role)
  const [user, setUser] = useState(null);

  // Global Sync Status (Saved, Syncing, or Error message)
  const [syncStatus, setSyncStatus] = useState("Saved");

  // Global App Error (for 404/500 full-page overlays)
  const [appError, setAppError] = useState(null);

  // Helper: Login
  const login = (userData) => {
    setUser(userData);
    setAppError(null); // Clear errors on login
  };

  // Helper: Logout
  const logout = () => {
    setUser(null);
    setAppError(null);
  };

  // Helper: Handle Backend Errors
  const triggerError = (errMessage) => {
    setSyncStatus("Something went wrong contact me at 231-878-0753");
    // Optionally log this to the console for your own debugging
    console.error("System Error Triggered:", errMessage);
  };

  // 3. The Value object that all components can access
  const value = {
    user,
    setUser,
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

// 4. Custom Hook for easy access in your components
export const useGlobalContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within an AppProvider");
  }
  return context;
};