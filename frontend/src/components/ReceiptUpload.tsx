import { useState, useRef } from 'react';
import api from '../lib/api';
import './ReceiptUpload.css';

interface Props {
  sessionId: string;
  onUploadComplete: () => void;
}

export default function ReceiptUpload({ sessionId, onUploadComplete }: Props) {
  const [uploading, setUploading] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualItems, setManualItems] = useState('');
  const [manualTax, setManualTax] = useState('');
  const [error, setError] = useState('');
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      // In local mode, OCR is not available
      setShowManual(true);
      setError('Receipt processing requires a backend server. Please enter items manually or use the "Add Item" button.');
    } catch (err: any) {
      setError('Failed to process receipt');
    } finally {
      setUploading(false);
    }
  };

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    try {
      // Parse manual items
      const items = manualItems.split('\n').map(line => {
        const parts = line.trim().split(/\s+/);
        const price = parseFloat(parts[parts.length - 1]);
        const name = parts.slice(0, -1).join(' ');
        return { name, price, quantity: 1 };
      }).filter(item => item.name && !isNaN(item.price));

      // Add items to session
      for (const item of items) {
        await api.addItem(Number(sessionId), {
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          participantIds: []
        });
      }

      setShowManual(false);
      setManualItems('');
      onUploadComplete();
    } catch (err: any) {
      setError('Failed to process receipt');
    } finally {
      setUploading(false);
    }
  };

  const loadSample = () => {
    setManualItems(`Organic Milk 2-Pack 8.99
Rotisserie Chicken 9.98
Paper Towels 12-Pack 24.99
Mixed Nuts 2.5lb 19.99
Laundry Detergent 18.99
Kirkland Olive Oil 22.99
Fresh Strawberries 11.98
Ground Beef 5lb 28.99`);
    setManualTax('12.34');
  };

  return (
    <div className="receipt-upload">
      <div className="upload-card">
        <h2>Upload Your Receipt</h2>
        <p>Take a photo or choose an existing image to automatically extract items</p>

        {error && <div className="error-message">{error}</div>}

        {!showManual ? (
          <div className="upload-section">
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />

            <button
              onClick={() => cameraInputRef.current?.click()}
              className="upload-button"
              disabled={uploading}
            >
              <span>{uploading ? 'Processing...' : '📷 Take Photo'}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="upload-button secondary"
              disabled={uploading}
            >
              <span>{uploading ? 'Processing...' : '🖼️ Choose from Gallery'}</span>
            </button>

            <div className="divider">or</div>

            <button
              onClick={() => setShowManual(true)}
              className="btn-secondary w-full"
              disabled={uploading}
            >
              ✏️ Enter Items Manually
            </button>
          </div>
        ) : (
          <form onSubmit={handleManualEntry} className="manual-entry">
            <div className="form-group">
              <label>Items (one per line: "Item Name Price")</label>
              <textarea
                value={manualItems}
                onChange={(e) => setManualItems(e.target.value)}
                placeholder="Organic Milk 8.99&#10;Chicken 4.99&#10;..."
                rows={8}
                required
              />
            </div>

            <div className="form-group">
              <label>Tax Amount</label>
              <input
                type="number"
                step="0.01"
                value={manualTax}
                onChange={(e) => setManualTax(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="manual-actions">
              <button type="button" onClick={loadSample} className="btn-secondary">
                Load Sample
              </button>
              <button type="button" onClick={() => setShowManual(false)} className="btn-secondary">
                Back
              </button>
              <button type="submit" className="btn-primary" disabled={uploading}>
                {uploading ? 'Processing...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
