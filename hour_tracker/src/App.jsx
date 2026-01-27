// import React, { lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { useGlobalContext } from './context/AppContext';

// Navigate, Link

// Suspense

// Standard Components
import Login from './components/Login';
import TimesheetTable from './components/TimesheetTable';
// import StatusBar from './components/StatusBar';
// import AdminPanel from './components/AdminPanel';

// Admin Panel (Lazy Loaded for Security)
// const AdminPanel = lazy(() => import('./components/AdminPanel'));

function App() {

  // const { user, isAdmin } = useGlobalContext();

  // AUTH GATE: Only show Login + StatusBar if not logged in
  // if (!user) {
  //   return (
  //     <div className="login-wrapper">
  //       <Login />
  //       <StatusBar />
  //     </div>
  //   );
  // }

  return (
      <Router>
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/dashboard" element={<TimesheetTable />} />
        </Routes>
      </Router>
    // <Router>
    //   <div className="app-layout">
    //     {/* GLOBAL NAVIGATION: Only shows links if user is Architect */}
    //     <nav className="navbar">
    //       <Link to="/" className="nav-logo">A-HOUR TRACKER</Link>
    //       <div className="nav-right">
    //         <Link to="/">My Sheet</Link>
    //         {isAdmin && (
    //           <Link to="/admin-wipe" className="nav-admin-red">TERMINAL</Link>
    //         )}
    //       </div>
    //     </nav>

    //     <main className="content-area">
    //       <Suspense fallback={<div className="loading">Accessing Secure Module...</div>}>
    //         <Routes>
    //           <Route path="/" element={<TimesheetTable />} />
              
    //           {/* PROTECTED ROUTE: Bounces non-admins back to home */}
    //           <Route 
    //             path="/admin-wipe" 
    //             element={isAdmin ? <AdminPanel /> : <Navigate to="/" replace />} 
    //           />

    //           <Route path="*" element={<Navigate to="/" replace />} />
    //         </Routes>
    //       </Suspense>
    //     </main>

    //     {/* The bottom bar that stays visible everywhere */}
    //     <StatusBar />
    //   </div>
    // </Router>
  );
}

export default App;