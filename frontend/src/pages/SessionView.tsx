import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { BillSplitSession, SplitCalculation } from '../types';
import ReceiptUpload from '../components/ReceiptUpload';
import ParticipantsList from '../components/ParticipantsList';
import ItemsList from '../components/ItemsList';
import SplitSummary from '../components/SplitSummary';
import './SessionView.css';

export default function SessionView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<BillSplitSession | null>(null);
  const [calculation, setCalculation] = useState<SplitCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'items' | 'summary'>('items');

  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    try {
      const response = await api.get(`/sessions/${id}`);
      setSession(response.data);
      
      // Load calculation if there are items and participants
      if (response.data.lineItems.length > 0 && response.data.participants.length > 0) {
        const calcResponse = await api.get(`/sessions/${id}/calculate`);
        setCalculation(calcResponse.data);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptUploaded = async () => {
    await loadSession();
  };

  const handleParticipantAdded = async () => {
    await loadSession();
  };

  const handleItemUpdated = async () => {
    await loadSession();
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!session) {
    return <div className="error">Session not found</div>;
  }

  return (
    <div className="session-view">
      <header className="session-header">
        <div className="header-content">
          <button onClick={() => navigate('/')} className="back-button">
            ← Back
          </button>
          <h1>{session.name}</h1>
        </div>
      </header>

      <main className="session-main">
        {session.receiptUrl && (
          <div className="receipt-preview">
            <h3>Original Receipt</h3>
            <a 
              href={`/api/uploads/${session.receiptUrl}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="receipt-link"
            >
              📄 View Original Receipt Image
            </a>
          </div>
        )}

        {session.lineItems.length === 0 && (
          <ReceiptUpload sessionId={session.id} onUploadComplete={handleReceiptUploaded} />
        )}

        {session.lineItems.length > 0 && (
          <>
            <ParticipantsList
              participants={session.participants}
              sessionId={session.id}
              onParticipantAdded={handleParticipantAdded}
            />

            <div className="tabs">
              <button
                className={`tab ${activeTab === 'items' ? 'active' : ''}`}
                onClick={() => setActiveTab('items')}
              >
                Assign Items
              </button>
              <button
                className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
                onClick={() => setActiveTab('summary')}
              >
                Summary
              </button>
            </div>

            {activeTab === 'items' ? (
              <ItemsList
                items={session.lineItems}
                participants={session.participants}
                sessionId={session.id}
                onItemUpdated={handleItemUpdated}
              />
            ) : (
              <SplitSummary 
                calculation={calculation} 
                sessionId={session.id}
                onSettled={handleItemUpdated}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
