import React, { useEffect } from 'react';
import { useGlobalContext } from '../context/AppContext';

const StatusBar = () => {
  const { syncStatus, user, triggerError } = useGlobalContext();

  // Check if the current status contains your signature error contact number
  const isError = syncStatus.includes("231-878-0753");

  // LISTEN FOR GLOBAL NETWORK FAILURES
  // This catches the 'architect-system-error' dispatched by your api.js interceptor
  useEffect(() => {
    const handleNetworkFailure = () => {
      triggerError("Critical System Failure: Contact 231-878-0753");
    };

    window.addEventListener('architect-system-error', handleNetworkFailure);
    
    // Cleanup listener on unmount to prevent memory leaks in your 24/7 environment
    return () => {
      window.removeEventListener('architect-system-error', handleNetworkFailure);
    };
  }, [triggerError]);

  return (
    <div className="status-bar">
      <div className="status-left">
        {/* The 'error' class triggers your pulsing red CSS logic */}
        <span className={`status-text ${isError ? 'error' : 'saved'}`}>
          {syncStatus}
        </span>
      </div>

      <div className="status-right">
        {user ? (
          <span className="status-user-info">
            Connected: <strong>{user.username}</strong> | {new Date().toLocaleDateString()}
          </span>
        ) : (
          <span className="status-user-info">System Offline</span>
        )}
      </div>
    </div>
  );
};

export default StatusBar;