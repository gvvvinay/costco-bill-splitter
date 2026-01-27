import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { BillSplitSession } from '../types';
import './Dashboard.css';

export default function Dashboard() {
  const [sessions, setSessions] = useState<BillSplitSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSession, setShowNewSession] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await api.get('/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;

    try {
      const response = await api.post('/sessions', { name: newSessionName });
      navigate(`/session/${response.data.id}`);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleArchive = async (sessionId: string, archived: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await api.patch(`/sessions/${sessionId}/archive`, { archived });
      loadSessions();
    } catch (error) {
      console.error('Archive error:', error);
      alert('Failed to archive session');
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get(`/sessions/export/csv?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `costco-splits-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setShowExport(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Costco Bill Splitter</h1>
          <div className="user-menu">
            <span>Welcome, {user?.username}!</span>
            <button onClick={logout} className="btn-secondary">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="sessions-header">
          <h2>Your Bill Splits</h2>
          <div className="header-actions">
            <button 
              onClick={() => navigate('/settlements')} 
              className="btn-secondary"
            >
              💰 Settlement Summary
            </button>
            <button 
              onClick={() => setShowExport(true)} 
              className="btn-secondary"
            >
              📊 Export CSV
            </button>
            <button 
              onClick={() => setShowNewSession(true)} 
              className="btn-primary"
            >
              + New Split
            </button>
          </div>
        </div>

        {showNewSession && (
          <div className="modal-overlay" onClick={() => setShowNewSession(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Create New Bill Split</h3>
              <form onSubmit={createSession}>
                <div className="form-group">
                  <label htmlFor="sessionName">Session Name</label>
                  <input
                    id="sessionName"
                    type="text"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="e.g., Weekend Costco Run"
                    autoFocus
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowNewSession(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showExport && (
          <div className="modal-overlay" onClick={() => setShowExport(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Export to CSV</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleExport(); }}>
                <div className="form-group">
                  <label htmlFor="startDate">Start Date (Optional)</label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">End Date (Optional)</label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowExport(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    📥 Download CSV
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="sessions-filter">
          <button 
            className={`filter-btn ${!showArchived ? 'active' : ''}`}
            onClick={() => setShowArchived(false)}
          >
            Active Sessions
          </button>
          <button 
            className={`filter-btn ${showArchived ? 'active' : ''}`}
            onClick={() => setShowArchived(true)}
          >
            Archived Sessions
          </button>
        </div>

        {sessions.filter(s => showArchived ? s.archived : !s.archived).length === 0 ? (
          <div className="empty-state">
            <p>{showArchived ? 'No archived sessions.' : 'No active bill splits yet. Create one to get started!'}</p>
          </div>
        ) : (
          <div className="sessions-grid">
            {sessions.filter(s => showArchived ? s.archived : !s.archived).map((session) => (
              <div
                key={session.id}
                className={`session-card ${session.archived ? 'archived' : ''}`}
              >
                <div onClick={() => navigate(`/session/${session.id}`)}>
                  <h3>{session.name}</h3>
                  <div className="session-info">
                    <p className="session-date">{formatDate(session.createdAt)}</p>
                    <p className="session-total">
                      Total: ${session.totalAmount.toFixed(2)}
                    </p>
                    <p className="session-meta">
                      {session.participants.length} participant{session.participants.length !== 1 ? 's' : ''} • 
                      {' '}{session.lineItems.length} item{session.lineItems.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="session-actions">
                  <button
                    onClick={(e) => handleArchive(session.id, !session.archived, e)}
                    className="btn-archive"
                    title={session.archived ? 'Unarchive' : 'Archive'}
                  >
                    {session.archived ? '📤 Unarchive' : '📦 Archive'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
