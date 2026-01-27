import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import './SettlementSummary.css';

interface SessionDetail {
  sessionId: string;
  sessionName: string;
  amountOwed: number;
  amountPaid: number;
  settled: boolean;
  settledAt?: string;
}

interface ParticipantSummary {
  participantName: string;
  totalOwed: number;
  totalPaid: number;
  balance: number;
  sessions: SessionDetail[];
  fullySettled: boolean;
}

export default function SettlementSummary() {
  const [summaries, setSummaries] = useState<ParticipantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const response = await api.get('/participants/settlement-summary');
      setSummaries(response.data);
    } catch (error) {
      console.error('Failed to load settlement summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async (participantName: string) => {
    if (!confirm(`Mark all bills for ${participantName} as settled?`)) {
      return;
    }

    try {
      await api.post('/participants/settle', { participantName });
      loadSummary();
    } catch (error) {
      console.error('Settlement error:', error);
      alert('Failed to settle participant');
    }
  };

  const toggleExpand = (participantName: string) => {
    setExpandedParticipant(
      expandedParticipant === participantName ? null : participantName
    );
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="settlement-summary-page">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>💰 Settlement Summary</h1>
          <div className="user-menu">
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">
              ← Back to Dashboard
            </button>
            <span>Welcome, {user?.username}!</span>
            <button onClick={logout} className="btn-secondary">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="settlement-main">
        <div className="summary-intro">
          <h2>Who Owes What</h2>
          <p>View and manage outstanding balances across all your bill splits</p>
        </div>

        {summaries.length === 0 ? (
          <div className="empty-state">
            <p>No outstanding bills yet.</p>
          </div>
        ) : (
          <div className="participants-list">
            {summaries.map((summary) => (
              <div
                key={summary.participantName}
                className={`participant-card ${summary.fullySettled ? 'settled' : 'outstanding'}`}
              >
                <div 
                  className="participant-header"
                  onClick={() => toggleExpand(summary.participantName)}
                >
                  <div className="participant-info">
                    <h3>{summary.participantName}</h3>
                    <div className="participant-stats">
                      <div className="stat-row">
                        <span className="stat-label">Total Owed:</span>
                        <strong className="stat-value">${summary.totalOwed.toFixed(2)}</strong>
                      </div>
                      <div className="stat-row amount-paid">
                        <span className="stat-label">✓ Paid:</span>
                        <strong className="stat-value green-amount">${summary.totalPaid.toFixed(2)}</strong>
                      </div>
                      <div className="stat-row amount-unpaid">
                        <span className="stat-label">⏳ To Be Paid:</span>
                        <strong className="stat-value red-amount">${summary.balance.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                  
                  <div className="participant-actions">
                    {summary.fullySettled ? (
                      <span className="status-badge settled">✓ All Settled</span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSettle(summary.participantName);
                        }}
                        className="btn-primary settle-btn"
                      >
                        Settle Up
                      </button>
                    )}
                    <span className="expand-icon">
                      {expandedParticipant === summary.participantName ? '▼' : '▶'}
                    </span>
                  </div>
                </div>

                {expandedParticipant === summary.participantName && (
                  <div className="session-details">
                    <h4>Sessions:</h4>
                    <div className="sessions-list">
                      {summary.sessions.map((session) => (
                        <div
                          key={session.sessionId}
                          className={`session-item ${session.settled ? 'settled' : ''}`}
                          onClick={() => navigate(`/session/${session.sessionId}`)}
                        >
                          <div className="session-info">
                            <span className="session-name">{session.sessionName}</span>
                            <span className="session-amount">
                              ${session.amountOwed.toFixed(2)}
                            </span>
                          </div>
                          <div className="session-status">
                            {session.settled ? (
                              <span className="status settled">
                                ✓ Paid {session.settledAt && 
                                  new Date(session.settledAt).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="status outstanding">
                                ⏳ Outstanding
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
