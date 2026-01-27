import { SplitCalculation } from '../types';
import SettlementPanel from './SettlementPanel';
import './SplitSummary.css';

interface Props {
  calculation: SplitCalculation | null;
  sessionId: string;
  onSettled: () => void;
}

export default function SplitSummary({ calculation, sessionId, onSettled }: Props) {
  if (!calculation) {
    return (
      <div className="split-summary">
        <div className="empty-message">
          Assign items to participants to see the split calculation
        </div>
      </div>
    );
  }

  const { participants, summary } = calculation;

  return (
    <div className="split-summary">
      <div className="summary-overview">
        <h3>Total Summary</h3>
        <div className="overview-grid">
          <div className="overview-item">
            <span className="label">Subtotal</span>
            <span className="value">${summary.subtotal.toFixed(2)}</span>
          </div>
          <div className="overview-item">
            <span className="label">Tax</span>
            <span className="value">${summary.tax.toFixed(2)}</span>
          </div>
          <div className="overview-item total">
            <span className="label">Total</span>
            <span className="value">${summary.total.toFixed(2)}</span>
          </div>
        </div>
        {summary.roundingError !== 0 && (
          <p className="rounding-note">
            Rounding adjustment: ${Math.abs(summary.roundingError).toFixed(2)}
          </p>
        )}
      </div>

      <div className="participants-breakdown">
        <h3>Per Person Breakdown</h3>
        <div className="participants-grid">
          {participants.map(participant => (
            <div key={participant.participantId} className="participant-card">
              <div className="participant-header">
                <h4>{participant.name}</h4>
                <div className="participant-total">${participant.total.toFixed(2)}</div>
              </div>

              <div className="participant-details">
                <div className="detail-row">
                  <span>Subtotal</span>
                  <span>${participant.subtotal.toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span>Tax</span>
                  <span>${participant.taxAmount.toFixed(2)}</span>
                </div>
              </div>

              {participant.items.length > 0 && (
                <div className="participant-items">
                  <h5>Items ({participant.items.length})</h5>
                  {participant.items.map((item, idx) => (
                    <div key={idx} className="item-row">
                      <span className="item-name">{item.name}</span>
                      <span className="item-split">
                        {item.splitCount > 1 && (
                          <span className="split-indicator">
                            ÷{item.splitCount}
                          </span>
                        )}
                        <span className="item-share">${item.share.toFixed(2)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <SettlementPanel 
        calculation={calculation} 
        sessionId={sessionId}
        onSettled={onSettled}
      />
    </div>
  );
}
