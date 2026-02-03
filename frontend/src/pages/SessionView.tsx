import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { BillSplitSession, SplitCalculation, ParticipantTotal } from '../types';
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
      const sessionData = await api.getSession(Number(id));
      if (!sessionData) {
        setLoading(false);
        return;
      }
      setSession(sessionData as any);
      
      // Calculate splits locally if there are items and participants
      if (sessionData.items && sessionData.items.length > 0 && sessionData.participants && sessionData.participants.length > 0) {
        const calc = calculateSplits(sessionData);
        setCalculation(calc);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSplits = (sessionData: any): SplitCalculation => {
    if (!sessionData) {
      return {
        participants: [],
        summary: { subtotal: 0, tax: 0, total: 0, roundingError: 0 }
      };
    }
    
    const participants = Array.isArray(sessionData.participants) ? sessionData.participants : [];
    const items = Array.isArray(sessionData.items) ? sessionData.items : [];
    
    const participantTotals: Record<number, number> = {};
    
    participants.forEach((p: any) => {
      if (p?.id) {
        participantTotals[p.id] = 0;
      }
    });
    
    items.forEach((item: any) => {
      if (!item?.price) return;
      const participantIds = Array.isArray(item.participantIds) ? item.participantIds : [];
      const shareCount = participantIds.length || 1;
      const shareAmount = item.price / shareCount;
      participantIds.forEach((pid: number) => {
        participantTotals[pid] = (participantTotals[pid] || 0) + shareAmount;
      });
    });
    
    const total = items.reduce((sum: number, i: any) => sum + (i?.price || 0), 0);
    
    const participantsList: ParticipantTotal[] = participants.map((p: any) => ({
      participantId: String(p?.id || ''),
      name: p?.name || 'Unknown',
      subtotal: participantTotals[p?.id] || 0,
      taxAmount: 0,
      total: participantTotals[p?.id] || 0,
      items: items.filter((i: any) => {
        const pids = Array.isArray(i?.participantIds) ? i.participantIds : [];
        return pids.includes(p?.id);
      }).map((i: any) => {
        const pids = Array.isArray(i?.participantIds) ? i.participantIds : [];
        return {
          name: i?.name || '',
          price: i?.price || 0,
          splitCount: pids.length || 1,
          share: (i?.price || 0) / (pids.length || 1)
        };
      })
    }));
    
    return {
      participants: participantsList,
      summary: {
        subtotal: total,
        tax: 0,
        total: total,
        roundingError: 0
      }
    };
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

  const handleDownloadReceipt = async () => {
    try {
      alert('Receipt download is not available in demo mode');
    } catch (error) {
      console.error('Failed to download receipt:', error);
      alert('Failed to download receipt');
    }
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
            ← Back to Trips
          </button>
          <h1>{session.name}</h1>
        </div>
      </header>

      <main className="session-main">
        {session.receiptUrl && (
          <div className="receipt-preview">
            <h3>📄 Receipt Image</h3>
            <div className="receipt-actions">
              <a 
                href={`/api/uploads/${session.receiptUrl}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="receipt-link"
              >
                View Original Receipt
              </a>
              <button 
                onClick={handleDownloadReceipt}
                className="receipt-download-button"
              >
                ⬇️ Download Receipt
              </button>
            </div>
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
                🛒 Assign Items
              </button>
              <button
                className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
                onClick={() => setActiveTab('summary')}
              >
                💰 Who Owes What
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
