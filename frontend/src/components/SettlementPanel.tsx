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
      const response = await api.get(`/sessions/${sessionId}`);
      const existingSettlements: Record<string, boolean> = {};
      
      if (response.data.settlements && Array.isArray(response.data.settlements)) {
        response.data.settlements.forEach((s: any) => {
          existingSettlements[s.participantId] = s.settled;
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
        participantId: p.participantId,
        participantName: p.name,
        amount: p.total,
        settled: settlements[p.participantId] || false
      }));

      await api.post(`/sessions/${sessionId}/settle`, { settlements: settlementData });
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
