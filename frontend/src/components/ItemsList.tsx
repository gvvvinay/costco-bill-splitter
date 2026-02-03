import { useState } from 'react';
import api from '../lib/api';
import { LineItem, Participant } from '../types';
import './ItemsList.css';

interface Props {
  items: LineItem[];
  participants: Participant[];
  sessionId: string;
  onItemUpdated: () => void;
}

export default function ItemsList({ items, participants, sessionId, onItemUpdated }: Props) {
  const [filter, setFilter] = useState<'all' | 'unassigned'>('all');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');

  const filteredItems = items.filter(item => {
    if (filter === 'unassigned') {
      return item.assignments.length === 0;
    }
    return true;
  });

  const handleToggleParticipant = async (itemId: string, participantId: string, isAssigned: boolean) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const currentAssignments = item.assignments.map(a => a.participantId);
    const newAssignments = isAssigned
      ? currentAssignments.filter(id => id !== participantId)
      : [...currentAssignments, participantId];

    try {
      await api.post(`/sessions/${sessionId}/items/${itemId}/assign`, {
        participantIds: newAssignments
      });
      onItemUpdated();
    } catch (error) {
      console.error('Failed to update assignment:', error);
    }
  };

  const handleAssignAll = async (itemId: string) => {
    try {
      await api.post(`/sessions/${sessionId}/items/${itemId}/assign`, {
        participantIds: participants.map(p => p.id)
      });
      onItemUpdated();
    } catch (error) {
      console.error('Failed to assign all:', error);
    }
  };

  const handleClearAll = async (itemId: string) => {
    try {
      await api.post(`/sessions/${sessionId}/items/${itemId}/assign`, {
        participantIds: []
      });
      onItemUpdated();
    } catch (error) {
      console.error('Failed to clear assignments:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return;

    try {
      await api.delete(`/sessions/${sessionId}/items/${itemId}`);
      onItemUpdated();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleStartEdit = (item: LineItem) => {
    setEditingItem(item.id);
    setEditName(item.name);
    setEditPrice(item.price.toString());
  };

  const handleSaveEdit = async (itemId: string) => {
    const price = parseFloat(editPrice);
    if (!editName.trim() || isNaN(price) || price <= 0) {
      alert('Please enter valid name and price');
      return;
    }

    try {
      await api.put(`/sessions/${sessionId}/items/${itemId}`, {
        name: editName.trim(),
        price: price
      });
      setEditingItem(null);
      onItemUpdated();
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('Failed to update item');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditName('');
    setEditPrice('');
  };

  const handleAddItem = async () => {
    const price = parseFloat(newItemPrice);
    const quantity = parseInt(newItemQuantity);
    
    if (!newItemName.trim() || isNaN(price) || price <= 0 || isNaN(quantity) || quantity < 1) {
      alert('Please enter valid item details');
      return;
    }

    try {
      await api.post(`/sessions/${sessionId}/items`, {
        name: newItemName.trim(),
        price: price,
        quantity: quantity
      });
      setShowAddForm(false);
      setNewItemName('');
      setNewItemPrice('');
      setNewItemQuantity('1');
      onItemUpdated();
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('Failed to add item');
    }
  };

  if (participants.length === 0) {
    return (
      <div className="items-list">
        <div className="empty-message">
          <p>👥 Add people above to start splitting items</p>
        </div>
      </div>
    );
  }

  return (
    <div className="items-list">
      <div className="items-header">
        <h3>Receipt Items</h3>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({items.length})
          </button>
          <button
            className={`filter-btn ${filter === 'unassigned' ? 'active' : ''}`}
            onClick={() => setFilter('unassigned')}
          >
            Not Assigned ({items.filter(i => i.assignments.length === 0).length})
          </button>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
          style={{ marginLeft: 'auto' }}
        >
          {showAddForm ? 'Cancel' : '✚ Add Item'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-item-form">
          <h4>Add New Item</h4>
          <div className="form-row">
            <input
              type="text"
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="form-input"
            />
            <input
              type="number"
              placeholder="Price"
              step="0.01"
              min="0"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              className="form-input"
              style={{ width: '120px' }}
            />
            <input
              type="number"
              placeholder="Qty"
              min="1"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              className="form-input"
              style={{ width: '80px' }}
            />
            <button onClick={handleAddItem} className="btn-primary">
              Add
            </button>
          </div>
        </div>
      )}

      <div className="items-grid">
        {filteredItems.map(item => {
          const assignedIds = item.assignments.map(a => a.participantId);

          return (
            <div key={item.id} className="item-card">
              <div className="item-header">
                {editingItem === item.id ? (
                  <div className="item-edit-form">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="form-input"
                      placeholder="Item name"
                    />
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="form-input"
                      placeholder="Price"
                      step="0.01"
                      min="0"
                      style={{ width: '100px' }}
                    />
                    <button onClick={() => handleSaveEdit(item.id)} className="btn-primary btn-sm">
                      Save
                    </button>
                    <button onClick={handleCancelEdit} className="btn-secondary btn-sm">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p className="item-price">${item.price.toFixed(2)}</p>
                      {item.quantity > 1 && (
                        <span className="item-quantity">Qty: {item.quantity}</span>
                      )}
                    </div>
                    <div className="item-header-buttons">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="btn-edit"
                        title="Edit item"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="btn-delete"
                        title="Delete item"
                      >
                        ×
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="item-participants">
                <label className="item-participants-label">Who's sharing this item?</label>
                <div className="participants-chips-container">
                  {participants.map(participant => {
                    const isAssigned = assignedIds.includes(participant.id);
                    return (
                      <button
                        key={participant.id}
                        className={`participant-chip ${isAssigned ? 'assigned' : ''}`}
                        onClick={() => handleToggleParticipant(item.id, participant.id, isAssigned)}
                      >
                        {participant.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="item-actions">
                <button
                  onClick={() => handleAssignAll(item.id)}
                  className="btn-link"
                >
                  👥 Everyone
                </button>
                <button
                  onClick={() => handleClearAll(item.id)}
                  className="btn-link"
                >
                  🚫 Clear All
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="empty-message">
          {filter === 'unassigned' ? 'All items are assigned!' : 'No items yet'}
        </div>
      )}
    </div>
  );
}
