import { useState } from 'react';
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const response = await api.post(`/receipts/upload/${sessionId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Check if OCR successfully parsed items
      if (response.data.ocrSuccess && response.data.items.length > 0) {
        // OCR worked! Proceed normally
        onUploadComplete();
      } else {
        // OCR failed, show manual entry
        setShowManual(true);
        setError('OCR could not extract items from the receipt. Please enter items manually below or click "Load Sample" for test data.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload receipt');
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
        return { name, price, quantity: 1, taxable: true };
      }).filter(item => item.name && !isNaN(item.price));

      const tax = parseFloat(manualTax) || 0;
      const subtotal = items.reduce((sum, item) => sum + item.price, 0);

      await api.post(`/receipts/manual/${sessionId}`, {
        items,
        tax,
        subtotal,
        total: subtotal + tax
      });

      onUploadComplete();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process receipt');
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
        <h2>Upload Receipt</h2>
        <p>Upload a photo of your Costco receipt or enter items manually</p>

        {error && <div className="error-message">{error}</div>}

        {!showManual ? (
          <div className="upload-section">
            <label className="upload-button">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              <span>{uploading ? 'Processing...' : '📷 Take Photo / Choose Image'}</span>
            </label>

            <div className="divider">or</div>

            <button
              onClick={() => setShowManual(true)}
              className="btn-secondary"
              disabled={uploading}
            >
              ✏️ Enter Manually
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
