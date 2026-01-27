import { useState } from 'react';
import api from '../lib/api';
import { Participant } from '../types';
import './ParticipantsList.css';

interface Props {
  participants: Participant[];
  sessionId: string;
  onParticipantAdded: () => void;
}

export default function ParticipantsList({ participants, sessionId, onParticipantAdded }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setAdding(true);
    try {
      await api.post(`/sessions/${sessionId}/participants`, { name: newName });
      setNewName('');
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
        <h3>Participants ({participants.length})</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-add">
          + Add
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
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Participant name"
            autoFocus
            required
          />
          <button type="submit" disabled={adding} className="btn-primary">
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
