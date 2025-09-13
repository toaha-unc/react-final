import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BuyerStats.css';

const BuyerStats = ({ stats, loading, error, onRefresh, onNavigateToPayments }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="buyer-stats-loading">
        <div className="loading-spinner"></div>
        <p>Loading your statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="buyer-stats-error">
        <h3>Error Loading Statistics</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={onRefresh}>
          Try Again
        </button>
      </div>
    );
  }

  const formatPrice = (price) => {
    // Handle null, undefined, or invalid prices
    if (price === null || price === undefined || isNaN(price)) {
      console.warn('Invalid price value:', price);
      return `BDT ${0}`;
    }
    
    // Convert to number if it's a string
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    // Check if conversion was successful
    if (isNaN(numericPrice)) {
      console.warn('Price could not be converted to number:', price);
      return `BDT ${0}`;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericPrice);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const statsData = stats || {
    total_orders: 0,
    completed_orders: 0,
    pending_orders: 0,
    total_spent: 0,
    average_order_value: 0,
    last_order_date: null,
    favorite_categories: [],
    total_reviews_given: 0,
    average_rating_given: 0
  };

  const quickActions = [
    {
      title: 'Browse Services',
      description: 'Discover new services',
      icon: '🔍',
      action: () => navigate('/services'),
      color: 'primary'
    },
    {
      title: 'Payment History',
      description: 'View transaction history',
      icon: '💳',
      action: () => onNavigateToPayments && onNavigateToPayments(),
      color: 'secondary'
    },
    {
      title: 'View Orders',
      description: 'Track your orders',
      icon: '📦',
      action: () => navigate('/orders'),
      color: 'secondary'
    },
    {
      title: 'My Reviews',
      description: 'Manage your reviews',
      icon: '⭐',
      action: () => navigate('/reviews'),
      color: 'secondary'
    },
    {
      title: 'Edit Profile',
      description: 'Update your information',
      icon: '👤',
      action: () => navigate('/profile'),
      color: 'secondary'
    }
  ];

  return (
    <div className="buyer-stats">
      <div className="stats-header">
        <h2>Dashboard Overview</h2>
        <p>Here's a summary of your activity and account status</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{statsData.total_orders}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{statsData.completed_orders}</h3>
            <p>Completed Orders</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{statsData.pending_orders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatPrice(statsData.total_spent)}</h3>
            <p>Total Spent</p>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{formatPrice(statsData.average_order_value)}</h3>
            <p>Average Order Value</p>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{statsData.total_reviews_given}</h3>
            <p>Reviews Given</p>
          </div>
        </div>
      </div>

      <div className="stats-details">
        <div className="details-grid">

          <div className="detail-card">
            <h4>Order Status Breakdown</h4>
            <div className="detail-content">
              <div className="status-breakdown">
                <div className="status-item">
                  <div className="status-dot completed"></div>
                  <span>Completed: {statsData.completed_orders}</span>
                </div>
                <div className="status-item">
                  <div className="status-dot pending"></div>
                  <span>Pending: {statsData.pending_orders}</span>
                </div>
                <div className="status-item">
                  <div className="status-dot in-progress"></div>
                  <span>In Progress: {statsData.total_orders - statsData.completed_orders - statsData.pending_orders}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`action-card ${action.color}`}
              onClick={action.action}
            >
              <div className="action-icon">{action.icon}</div>
              <div className="action-content">
                <h4>{action.title}</h4>
                <p>{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuyerStats;
