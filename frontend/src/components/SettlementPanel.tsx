import { useState, useEffect } from 'react';
import { SplitCalculation } from '../types';
import api from '../lib/api';
import './SettlementPanel.css';

interface Props {
  calculation: SplitCalculation | null;
  sessionId: string;
  onSettled: () => void;
}

export default function SettlementPanel({ calculation, sessionId, onSettled }: Props) {
  const [settlements, setSettlements] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExistingSettlements();
  }, [sessionId, calculation]);

  const loadExistingSettlements = async () => {
    try {
      const sessionData = await api.getSession(Number(sessionId));
      const existingSettlements: Record<string, boolean> = {};
      
      if (sessionData && sessionData.settlements && Array.isArray(sessionData.settlements)) {
        sessionData.settlements.forEach((s: any) => {
          existingSettlements[s.fromParticipantId] = true;
        });
      }
      
      setSettlements(existingSettlements);
    } catch (error) {
      console.error('Failed to load settlements:', error);
    }
  };

  if (!calculation) {
    return null;
  }

  const handleToggle = (participantId: string) => {
    setSettlements(prev => ({
      ...prev,
      [participantId]: !prev[participantId]
    }));
  };

  const handleSaveSettlement = async () => {
    setSaving(true);
    try {
      const settlementData = calculation.participants.map(p => ({
        id: Date.now() + Math.random(),
        fromParticipantId: Number(p.participantId),
        toParticipantId: Number(p.participantId),
        amount: p.total,
        sessionId: Number(sessionId)
      }));

      await api.saveSettlements(Number(sessionId), settlementData);
      onSettled();
    } catch (error) {
      console.error('Settlement save error:', error);
      alert('Failed to save settlement status');
    } finally {
      setSaving(false);
    }
  };

  const allSettled = calculation.participants.every(p => settlements[p.participantId]);
  const someSettled = calculation.participants.some(p => settlements[p.participantId]);

  return (
    <div className="settlement-panel">
      <h3>💰 Settle Up</h3>
      <p className="settlement-info">Mark who has paid their share</p>

      <div className="settlement-list">
        {calculation.participants.map(participant => (
          <div key={participant.participantId} className="settlement-item">
            <label className="settlement-checkbox">
              <input
                type="checkbox"
                checked={settlements[participant.participantId] || false}
                onChange={() => handleToggle(participant.participantId)}
              />
              <span className="checkmark"></span>
              <div className="settlement-details">
                <span className="participant-name">{participant.name}</span>
                <span className="participant-amount">${participant.total.toFixed(2)}</span>
              </div>
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={handleSaveSettlement}
        disabled={saving || !someSettled}
        className="btn-primary settle-button"
      >
        {saving ? 'Saving...' : allSettled ? '✓ Mark All as Settled' : 'Save Settlement Status'}
      </button>
    </div>
  );
}
