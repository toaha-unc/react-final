import React from 'react';
import './SellerStats.css';

const SellerStats = ({ stats, earnings, analytics, loading, error, onRefresh, onNavigateToPayments }) => {
  const formatCurrency = (amount) => {
    // Handle null, undefined, or invalid amounts
    if (amount === null || amount === undefined || isNaN(amount)) {
      console.warn('Invalid amount value:', amount);
      return `BDT ${0}`;
    }
    
    // Convert to number if it's a string
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Check if conversion was successful
    if (isNaN(numericAmount)) {
      console.warn('Amount could not be converted to number:', amount);
      return `BDT ${0}`;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericAmount);
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

  // Debug: Log the received data
  console.log('SellerStats received data:', { stats, earnings, analytics });

  // Map API data to display format
  const displayStats = stats ? {
    total_earnings: stats.analytics?.total_earnings || stats.earnings_summary?.total_earnings || 0,
    monthly_earnings: stats.analytics?.earnings_this_month || stats.earnings_summary?.this_month || 0,
    total_orders: stats.analytics?.total_orders || 0,
    completed_orders: stats.analytics?.completed_orders || 0,
    pending_orders: stats.analytics?.pending_orders || 0,
    total_services: stats.analytics?.total_services || 0,
    active_services: stats.analytics?.active_services || 0,
    average_rating: stats.analytics?.average_rating || 0,
    total_reviews: stats.analytics?.total_reviews || 0,
    response_rate: 95.5, // Default value
    completion_rate: stats.performance_metrics?.completion_rate || 0
  } : {
    total_earnings: 0,
    monthly_earnings: 0,
    total_orders: 0,
    completed_orders: 0,
    pending_orders: 0,
    total_services: 0,
    active_services: 0,
    average_rating: 0,
    total_reviews: 0,
    response_rate: 0,
    completion_rate: 0
  };

  const displayEarnings = earnings || { 
    total_earnings: displayStats.total_earnings,
    monthly_earnings: displayStats.monthly_earnings, 
    weekly_earnings: 0 
  };
  
  const displayAnalytics = analytics || {
    orders_this_month: stats?.analytics?.orders_this_month || 0,
    orders_last_month: 0, // Not available in current API
    revenue_growth: 0, // Not available in current API
    completion_rate: displayStats.completion_rate
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
          <button className="action-btn" onClick={onNavigateToPayments}>
            <span className="action-icon">💳</span>
            <span className="action-text">Payment History</span>
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
              <p><strong>Payment received</strong> - BDT 500 for completed order</p>
              <span className="activity-time">3 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerStats;
