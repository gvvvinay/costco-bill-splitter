import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Participant } from '../types';
import './ParticipantsList.css';

interface Props {
  participants: Participant[];
  sessionId: string;
  onParticipantAdded: () => void;
}

interface User {
  id: string;
  username: string;
  email: string;
}

export default function ParticipantsList({ participants, sessionId, onParticipantAdded }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [adding, setAdding] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (showAdd) {
      loadUsers();
    }
  }, [showAdd]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      // In local mode, we don't have a users list - just allow custom names
      setUsers([]);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Get users that aren't already participants
  const availableUsers = users.filter(
    user => !participants.some(p => p.name.toLowerCase() === user.username.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser.trim()) return;

    setAdding(true);
    try {
      await api.addParticipant(Number(sessionId), selectedUser);
      setSelectedUser('');
      setShowAdd(false);
      onParticipantAdded();
    } catch (error) {
      console.error('Failed to add participant:', error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="participants-list">
      <div className="participants-header">
        <h3>Who's splitting? ({participants.length})</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-add">
          ✚ Add Person
        </button>
      </div>

      <div className="participants-chips">
        {participants.map(p => (
          <div key={p.id} className="chip">
            {p.name}
          </div>
        ))}
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="add-participant-form">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            disabled={loadingUsers || availableUsers.length === 0}
            required
            autoFocus
          >
            <option value="">
              {loadingUsers ? 'Loading users...' : availableUsers.length === 0 ? 'No more users to add' : 'Select a user'}
            </option>
            {availableUsers.map(user => (
              <option key={user.id} value={user.username}>
                @{user.username}
              </option>
            ))}
          </select>
          <button type="submit" disabled={adding || !selectedUser} className="btn-primary">
            Add
          </button>
          <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
