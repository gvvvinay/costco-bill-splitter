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
      const data = await api.getSessions();
      if (!data || !Array.isArray(data)) {
        setSessions([]);
        return;
      }
      // Convert to BillSplitSession format
      const converted = data.map((s: any) => ({
        ...s,
        id: String(s?.id || Date.now()),
        userId: String(s?.userId || ''),
        totalAmount: (s?.items || []).reduce((sum: number, i: any) => sum + (i?.price || 0), 0),
        taxAmount: 0,
        archived: false,
        lineItems: (s?.items || []).map((item: any) => ({
          ...item,
          id: String(item?.id || Date.now()),
          sessionId: String(s?.id || ''),
          taxable: false,
          orderIndex: 0,
          assignments: (item?.participantIds || []).map((pid: number) => ({
            id: String(Date.now() + Math.random()),
            lineItemId: String(item?.id || ''),
            participantId: String(pid),
            participant: (s?.participants || []).find((p: any) => p?.id === pid)
          })).filter(Boolean)
        })),
        participants: (s?.participants || []).map((p: any) => ({
          ...p,
          id: String(p?.id || Date.now()),
          sessionId: String(s?.id || '')
        })),
        updatedAt: s?.createdAt || new Date().toISOString()
      }));
      setSessions(converted);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;

    try {
      const newSession = await api.createSession(newSessionName);
      navigate(`/session/${newSession.id}`);
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

  const handleArchive = async (_sessionId: string, _archived: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // In local mode, just reload sessions (archive feature can be added to localStorageApi if needed)
      loadSessions();
    } catch (error) {
      console.error('Archive error:', error);
      alert('Failed to archive session');
    }
  };

  const handleExport = async () => {
    try {
      // In local mode, create CSV from sessions data
      const allSessions = await api.getSessions();
      const csvContent = generateCSV(allSessions, startDate, endDate);
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
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

  const generateCSV = (sessions: any[], startDate: string, endDate: string) => {
    let filtered = sessions;
    if (startDate) filtered = filtered.filter(s => new Date(s.createdAt) >= new Date(startDate));
    if (endDate) filtered = filtered.filter(s => new Date(s.createdAt) <= new Date(endDate));
    
    const headers = 'Session,Date,Item,Price,Participants\n';
    const rows = filtered.flatMap(session => 
      (session.items || []).map((item: any) => 
        `"${session.name}","${session.createdAt}","${item.name}",${item.price},"${item.participantIds?.length || 0}"`
      )
    ).join('\n');
    
    return headers + rows;
  };

  const getSessionTotal = (session: BillSplitSession) => {
    // Calculate total dynamically from line items + tax to ensure accuracy
    // even if the stored totalAmount is out of sync
    const itemsTotal = session.lineItems?.reduce((sum, item) => sum + item.price, 0) || 0;
    return itemsTotal + (session.taxAmount || 0);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>SplitFair</h1>
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
              onClick={() => navigate('/users')} 
              className="btn-secondary"
            >
              👥 Users
            </button>
            <button 
              onClick={() => navigate('/settlements')} 
              className="btn-secondary"
            >
              💰 Settlements
            </button>
            <button 
              onClick={() => navigate('/activity')} 
              className="btn-secondary"
            >
              🕒 Activity Log
            </button>
            <button 
              onClick={() => setShowExport(true)}  
              className="btn-secondary"
            >
              📊 Export
            </button>
            <button 
              onClick={() => setShowNewSession(true)} 
              className="btn-primary"
            >
              ✚ New Split
            </button>
          </div>
        </div>

        {showNewSession && (
          <div className="modal-overlay" onClick={() => setShowNewSession(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Create New Bill Split</h3>
              <p style={{ marginBottom: '1.5rem', color: 'var(--gray-600)', fontSize: '0.9375rem' }}>
                Give this trip a memorable name to help track your shared expenses
              </p>
              <form onSubmit={createSession}>
                <div className="form-group">
                  <label htmlFor="sessionName">Trip Name</label>
                  <input
                    id="sessionName"
                    type="text"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="e.g., Weekend Grocery Run, July 4th Party Supplies"
                    autoFocus
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowNewSession(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Trip
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
              <p style={{ marginBottom: '1.5rem', color: 'var(--gray-600)', fontSize: '0.9375rem' }}>
                Download your bill splits for record keeping or analysis
              </p>
              <form onSubmit={(e) => { e.preventDefault(); handleExport(); }}>
                <div className="form-group">
                  <label htmlFor="startDate">From Date (Optional)</label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">To Date (Optional)</label>
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
            Active Trips
          </button>
          <button 
            className={`filter-btn ${showArchived ? 'active' : ''}`}
            onClick={() => setShowArchived(true)}
          >
            Archived
          </button>
        </div>

        {sessions.filter(s => showArchived ? s.archived : !s.archived).length === 0 ? (
          <div className="empty-state">
            <p>{showArchived ? 'No archived splits yet.' : 'No bill splits yet. Click "New Split" to get started!'}</p>
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
                      ${getSessionTotal(session).toFixed(2)}
                    </p>
                    <p className="session-meta">
                      {session.participants.length} {session.participants.length === 1 ? 'person' : 'people'} • 
                      {' '}{session.lineItems.length} {session.lineItems.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
                <div className="session-actions">
                  <button
                    onClick={(e) => handleArchive(session.id, !session.archived, e)}
                    className="btn-archive"
                    title={session.archived ? 'Unarchive' : 'Archive'}
                  >
                    {session.archived ? '📤 Restore' : '📦 Archive'}
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
