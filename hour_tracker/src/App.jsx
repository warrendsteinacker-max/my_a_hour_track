import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

// FIXED IMPORTS based on your file tree images
import { useGlobalContext } from './context/AppContext'; 
import TimesheetTable from './components/TimesheetTable';
import StatusBar from './components/StatusBar';
import Login from './components/Login';

// Lazy loading the Admin Panel for the "Architect"
const AdminPanel = lazy(() => import('./components/AdminPanel'));

function App() {
  const { user, isAdmin, logout } = useGlobalContext();

  // Security: Bounce unauthorized users back to the home page
  const ProtectedAdmin = ({ children }) => {
    if (!isAdmin) return <Navigate to="/" replace />;
    return children;
  };

  // If not logged in, only show the Login screen
  if (!user) {
    return (
      <div className="auth-wrapper">
        <Login />
        <StatusBar />
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="nav-brand">
            <Link to="/">A-HOUR TRACKER</Link>
          </div>
          
          <div className="nav-links">
            <Link to="/">Home</Link>
            
            {/* The "Nuclear" Link: Visible only to the Architect */}
            {isAdmin && (
              <Link to="/admin-wipe" className="admin-danger-link">SYSTEM WIPE</Link>
            )}
            
            <button onClick={logout} className="logout-btn">
              Logout ({user.username})
            </button>
          </div>
        </nav>

        <main className="main-content">
          <Suspense fallback={<div className="loading">Loading Secure Module...</div>}>
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

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        {/* Persistent bottom bar for "Saved" or "231..." errors */}
        <StatusBar />
      </div>
    </Router>
  );
}

export default App;