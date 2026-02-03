import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './UsersList.css';

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // In local mode, show message
      setUsers([]);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const addUserAsParticipant = (username: string) => {
    // Pass the selected user to be added as participant via session storage
    sessionStorage.setItem('selectedUserToAdd', username);
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="users-container">
      <header className="users-header">
        <div className="header-content">
          <button onClick={() => navigate('/')} className="back-button">
            ← Back to Trips
          </button>
          <h1>👥 Available Users</h1>
          <p className="subtitle">Select users to add as participants to your trips</p>
        </div>
      </header>

      <main className="users-main">
        {users.length === 0 ? (
          <div className="empty-state">
            <p>No users available</p>
          </div>
        ) : (
          <div className="users-grid">
            {users.map(u => (
              <div key={u.id} className="user-card">
                <div className="user-info">
                  <h3 className="username">@{u.username}</h3>
                  <p className="email">{u.email}</p>
                  <p className="joined">Joined {formatDate(u.createdAt)}</p>
                </div>
                <div className="user-actions">
                  {user?.username.toLowerCase() === u.username.toLowerCase() && (
                    <span className="current-user-badge">You</span>
                  )}
                  {user?.username.toLowerCase() !== u.username.toLowerCase() && (
                    <button
                      onClick={() => addUserAsParticipant(u.username)}
                      className="add-button"
                    >
                      + Add as Participant
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="users-footer">
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </footer>
    </div>
  );
}
