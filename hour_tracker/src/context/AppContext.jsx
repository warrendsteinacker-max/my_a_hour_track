import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState("Saved");
  const [appError, setAppError] = useState(null);

  // Derived State: Automatically check if the user is the Architect
  // This makes your App.jsx routes much cleaner
  const isAdmin = user?.role === 'the_unseen_architect_77';

  // PERSISTENCE: Check if user is already in LocalStorage when the app starts
  useEffect(() => {
    const savedUser = localStorage.getItem('hour_track_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

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
  };

  const triggerError = (errMessage) => {
    // Your signature Architect contact error
    setSyncStatus("Something went wrong contact me at 231-878-0753");
    console.error("System Error Triggered:", errMessage);
  };

  const value = {
    user,
    isAdmin, // Now available globally!
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