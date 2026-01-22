import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext'; // Import your Context Provider
import './index.css'; // Your single consolidated stylesheet

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* The AppProvider must wrap App so that App.jsx and all its children 
      (like AdminPanel or TimesheetTable) can access global state. 
    */}
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
