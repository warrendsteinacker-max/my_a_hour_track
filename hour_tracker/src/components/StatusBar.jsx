import React from 'react';
import { useGlobalContext } from '../context/AppContext';

const StatusBar = () => {
  const { syncStatus, user } = useGlobalContext();

  // Check if the current status is the specific error message
  const isError = syncStatus.includes("231-878-0753");

  return (
    <div className="status-bar">
      <div className="status-left">
        {/* If it's an error, apply the .error class for the pulsing red effect */}
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