import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

// FIX: Change 'context' to 'AppContext' to match your image
import { useGlobalContext } from './context/AppContext'; 

// standard components (loaded immediately)
import TimesheetTable from './components/TimesheetTable';
import StatusBar from './components/StatusBar';
import Login from './components/Login';

// SECURE: This chunk is ONLY fetched if the user is Warren
const AdminPanel = lazy(() => import('./components/AdminPanel'));

function App() {
  const { user, isAdmin, logout } = useGlobalContext();

  // 1. Private Gatekeeper
  const ProtectedAdmin = ({ children }) => {
    if (!isAdmin) return <Navigate to="/" replace />;
    return children;
  };

  // 2. Auth Gate
  if (!user) {
    return (
      <div className="login-wrapper">
        <Login />
        <StatusBar />
      </div>
    );
  }

  return (
    <Router>
      <div className="app-layout">
        <nav className="navbar">
          <div className="nav-left">
            <Link to="/" className="nav-logo">TIMESHEET SYSTEM</Link>
          </div>
          
          <div className="nav-right">
            <Link to="/">My Hours</Link>
            
            {/* Visible only if backend confirmed architect status */}
            {isAdmin && (
              <Link to="/admin-wipe" className="nav-admin-red">SYSTEM WIPE</Link>
            )}
            
            <button onClick={logout} className="logout-btn">
              Logout ({user.username})
            </button>
          </div>
        </nav>

        <main className="content-area">
          <Suspense fallback={<div className="loading-spinner">Loading Secure Module...</div>}>
            <Routes>
              <Route path="/" element={<TimesheetTable />} />
              
              <Route 
                path="/admin-wipe" 
                element={
                  <ProtectedAdmin>
                    <AdminPanel />
                  </ProtectedAdmin>
                } 
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        <StatusBar />
      </div>
    </Router>
  );
}

export default App;