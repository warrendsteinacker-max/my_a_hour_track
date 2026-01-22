import React, { useState, useEffect } from 'react';
import api from '../api';
import { useGlobalContext } from '../context/AppContext';

const AdminPanel = () => {
  const { setSyncStatus, triggerError } = useGlobalContext();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [isWiping, setIsWiping] = useState(false);

  // 1. Fetch all users to populate the dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/api/admin/users');
        setUsers(res.data);
      } catch (err) {
        triggerError("Failed to load user list");
      }
    };
    fetchUsers();
  }, []);

  // 2. The "Nuclear" Wipe Logic
  const handleWipe = async () => {
    if (!selectedUser) return alert("Please select a target first.");
    
    const confirmWipe = window.confirm(
      `WARNING: This will permanently delete all JSON records for ${selectedUser}. This cannot be undone. Proceed?`
    );

    if (confirmWipe) {
      try {
        setIsWiping(true);
        setSyncStatus("Wiping Records...");
        
        await api.delete(`/api/admin/wipe/${selectedUser}`);
        
        setSyncStatus("Saved");
        alert(`Successfully purged all records for ${selectedUser}.`);
        setSelectedUser('');
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
        <h2>SYSTEM ADMINISTRATION</h2>
        <p>Targeted Record Deletion (Permanent)</p>
        
        <hr className="admin-hr" />

        <div className="admin-form">
          <label>Select User to Purge:</label>
          <select 
            className="admin-select"
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)}
            disabled={isWiping}
          >
            <option value="">-- Choose Employee --</option>
            {users.map(u => (
              <option key={u.id} value={u.username}>{u.username}</option>
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
          Logged as Architect. All actions are logged to <code>error_logs.txt</code>.
        </p>
      </div>
    </div>
  );
};

export default AdminPanel;