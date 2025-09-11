import React from 'react';
import './SellerStats.css';

const SellerStats = ({ stats, earnings, analytics, loading, error, onRefresh }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const formatPercentage = (num) => {
    return `${(num || 0).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="seller-stats-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="seller-stats-error">
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={onRefresh}>
          Try Again
        </button>
      </div>
    );
  }

  // Fallback data if API doesn't return data
  const fallbackStats = {
    total_earnings: 12500,
    monthly_earnings: 3200,
    total_orders: 45,
    completed_orders: 42,
    pending_orders: 3,
    total_services: 8,
    active_services: 7,
    average_rating: 4.8,
    total_reviews: 38,
    response_rate: 95.5,
    completion_rate: 93.3
  };

  const displayStats = stats || fallbackStats;
  const displayEarnings = earnings || { 
    total_earnings: 12500, 
    monthly_earnings: 3200, 
    weekly_earnings: 800 
  };
  const displayAnalytics = analytics || {
    orders_this_month: 12,
    orders_last_month: 8,
    revenue_growth: 15.2,
    completion_rate: 93.3
  };

  return (
    <div className="seller-stats">
      <div className="stats-header">
        <h2>Dashboard Overview</h2>
        <p>Track your performance and earnings</p>
      </div>

      <div className="stats-grid">
        {/* Earnings Cards */}
        <div className="stat-card earnings-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Earnings</h3>
            <div className="stat-value">{formatCurrency(displayStats.total_earnings)}</div>
            <div className="stat-subtitle">All time</div>
          </div>
        </div>

        <div className="stat-card earnings-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>This Month</h3>
            <div className="stat-value">{formatCurrency(displayStats.monthly_earnings)}</div>
            <div className="stat-subtitle">
              {displayAnalytics.revenue_growth > 0 ? '+' : ''}{formatPercentage(displayAnalytics.revenue_growth)} from last month
            </div>
          </div>
        </div>

        {/* Orders Cards */}
        <div className="stat-card orders-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <div className="stat-value">{formatNumber(displayStats.total_orders)}</div>
            <div className="stat-subtitle">
              {formatNumber(displayStats.completed_orders)} completed
            </div>
          </div>
        </div>

        <div className="stat-card orders-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Orders</h3>
            <div className="stat-value">{formatNumber(displayStats.pending_orders)}</div>
            <div className="stat-subtitle">Awaiting your action</div>
          </div>
        </div>

        {/* Services Cards */}
        <div className="stat-card services-card">
          <div className="stat-icon">🛠️</div>
          <div className="stat-content">
            <h3>Active Services</h3>
            <div className="stat-value">{formatNumber(displayStats.active_services)}</div>
            <div className="stat-subtitle">of {formatNumber(displayStats.total_services)} total</div>
          </div>
        </div>

        <div className="stat-card services-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Average Rating</h3>
            <div className="stat-value">{displayStats.average_rating}</div>
            <div className="stat-subtitle">from {formatNumber(displayStats.total_reviews)} reviews</div>
          </div>
        </div>

        {/* Performance Cards */}
        <div className="stat-card performance-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Completion Rate</h3>
            <div className="stat-value">{formatPercentage(displayStats.completion_rate)}</div>
            <div className="stat-subtitle">Orders completed on time</div>
          </div>
        </div>

        <div className="stat-card performance-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <h3>Response Rate</h3>
            <div className="stat-value">{formatPercentage(displayStats.response_rate)}</div>
            <div className="stat-subtitle">Messages responded to</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn">
            <span className="action-icon">➕</span>
            <span className="action-text">Create New Service</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📦</span>
            <span className="action-text">View All Orders</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📊</span>
            <span className="action-text">View Analytics</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">⚙️</span>
            <span className="action-text">Update Profile</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">📦</div>
            <div className="activity-content">
              <p><strong>New order received</strong> for "Web Development Service"</p>
              <span className="activity-time">2 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">⭐</div>
            <div className="activity-content">
              <p><strong>New review received</strong> - 5 stars from John Doe</p>
              <span className="activity-time">1 day ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">✅</div>
            <div className="activity-content">
              <p><strong>Order completed</strong> - "Logo Design" delivered</p>
              <span className="activity-time">2 days ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">💰</div>
            <div className="activity-content">
              <p><strong>Payment received</strong> - $500 for completed order</p>
              <span className="activity-time">3 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerStats;
