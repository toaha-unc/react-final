import React, { useState } from 'react';
import './OrderStatus.css';

const OrderStatus = ({ status, onStatusChange, canEdit = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(status);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#ffc107' },
    { value: 'in_progress', label: 'In Progress', color: '#007bff' },
    { value: 'completed', label: 'Completed', color: '#28a745' },
    { value: 'delivered', label: 'Delivered', color: '#6f42c1' },
    { value: 'cancelled', label: 'Cancelled', color: '#dc3545' }
  ];

  const currentStatus = statusOptions.find(s => s.value === status) || statusOptions[0];

  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    setIsEditing(false);
  };

  const handleEditClick = () => {
    if (canEdit) {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setSelectedStatus(status);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="order-status-editing">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="status-select"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="status-actions">
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => handleStatusChange(selectedStatus)}
          >
            Save
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <span className="status-text">{currentStatus.label}</span>
  );
};

export default OrderStatus;
