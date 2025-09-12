import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI } from '../services/api';
import Header from './Header';
import BuyerProfile from './BuyerProfile';
import BuyerReviews from './BuyerReviews';
import BuyerStats from './BuyerStats';
import PaymentHistory from './PaymentHistory';
import './BuyerDashboard.css';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBuyerStats();
  }, []);

  const fetchBuyerStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getBuyerStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching buyer stats:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'reviews', label: 'My Reviews', icon: '⭐' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <BuyerStats stats={stats} loading={loading} error={error} onRefresh={fetchBuyerStats} />;
      case 'payments':
        return <PaymentHistory />;
      case 'reviews':
        return <BuyerReviews />;
      case 'profile':
        return <BuyerProfile />;
      default:
        return <BuyerStats stats={stats} loading={loading} error={error} onRefresh={fetchBuyerStats} />;
    }
  };

  if (loading && !stats) {
    return (
      <div className="buyer-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="buyer-dashboard">
      <Header />
      <div className="buyer-dashboard-header">
        <div className="container">
          <div className="header-content">
            <div className="welcome-section">
              <h1>Welcome back, {user?.first_name || 'Buyer'}!</h1>
              <p>Manage your orders, reviews, and profile settings</p>
            </div>
            <div className="user-avatar">
              <div className="avatar-circle">
                {user?.first_name?.charAt(0)?.toUpperCase() || 'B'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="buyer-dashboard-content">
        <div className="container">
          <div className="dashboard-layout">
            <nav className="dashboard-nav">
              <ul className="nav-tabs">
                {tabs.map((tab) => (
                  <li key={tab.id} className="nav-item">
                    <button
                      className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span className="tab-icon">{tab.icon}</span>
                      <span className="tab-label">{tab.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <main className="dashboard-main">
              {renderTabContent()}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
