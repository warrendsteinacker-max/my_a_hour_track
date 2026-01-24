import React, { useState, useEffect } from 'react';
import api from '../api';
import { useGlobalContext } from '../context/AppContext';

const AdminPanel = () => {
  // Destructuring isAdmin to ensure private VITE_ADMIN_ROLE_ID check
  const { logout, setSyncStatus, triggerError, isAdmin } = useGlobalContext();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [isWiping, setIsWiping] = useState(false);

  // 1. SECURITY GATE: If not the Architect, block access immediately
  if (!isAdmin) {
    return (
      <div className="unauthorized">
        <h2>403 - Forbidden</h2>
        <p>This terminal is restricted to authorized Architect personnel.</p>
      </div>
    );
  }

  // 2. FETCH USERS: Pulls from MongoDB via the protected admin route
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/api/admin/users');
        setUsers(res.data);
      } catch (err) {
        // If the Tailscale network drops or role is invalid
        triggerError("Access Denied or Network Failure");
      }
    };
    fetchUsers();
  }, [triggerError]);

  // 3. THE NUCLEAR WIPE: Now handles MongoDB record deletion + logs to error_logs.txt
  const handleWipe = async () => {
    if (!selectedUser) return alert("Select a target.");
    
    const confirmWipe = window.confirm(
      `WARNING: This will permanently purge all database records for ${selectedUser}. This action is logged. Proceed?`
    );

    if (confirmWipe) {
      try {
        setIsWiping(true);
        setSyncStatus("Wiping Database...");
        
        // This hits your Backend/controllers/adminController.js logic
        await api.delete(`/api/admin/wipe/${selectedUser}`);
        
        setSyncStatus("Saved");
        alert(`Records for ${selectedUser} have been purged.`);
        setSelectedUser('');
        
        // Refresh user list in case user was deleted
        const updatedUsers = users.filter(u => u.username !== selectedUser);
        setUsers(updatedUsers);

      } catch (err) {
        triggerError("Wipe failed. System locked.");
      } finally {
        setIsWiping(false);
      }
    }
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-20px' }}>
          <button className="logout-button" onClick={logout}>
            Exit Terminal
          </button>
        </div>

        <h2>SYSTEM ADMINISTRATION</h2>
        <p>Architect Level: Targeted Purge (MongoDB)</p>
        
        <hr className="admin-hr" />

        <div className="admin-form">
          <label>Select Target for Purge:</label>
          <select 
            className="admin-select"
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)}
            disabled={isWiping}
          >
            <option value="">-- Choose Employee --</option>
            {users.map(u => (
              // Using MongoDB _id or username as key
              <option key={u._id || u.username} value={u.username}>{u.username}</option>
            ))}
          </select>

          <button 
            className="nuclear-button" 
            onClick={handleWipe}
            disabled={isWiping || !selectedUser}
          >
            {isWiping ? "PURGING..." : "EXECUTE WIPE"}
          </button>
        </div>

        <p className="admin-warning">
          Authenticated as Architect. Actions are captured in <code>storage/error_logs.txt</code>.
        </p>
      </div>
    </div>
  );
};

export default AdminPanel;