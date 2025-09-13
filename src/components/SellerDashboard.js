import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI } from '../services/api';
import Header from './Header';
import SellerServices from './SellerServices';
import SellerOrders from './SellerOrders';
import SellerReviews from './SellerReviews';
import SellerProfile from './SellerProfile';
import PaymentHistory from './PaymentHistory';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const { user, isSeller } = useAuth();
  const [activeTab, setActiveTab] = useState('services');
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    earnings: null,
    analytics: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isSeller) {
      fetchDashboardData();
    }
  }, [isSeller]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching dashboard data...');
      const response = await dashboardAPI.getSellerStats();
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      if (response.data) {
        const dashboardData = {
          stats: response.data,
          analytics: response.data.analytics || null,
          earnings: response.data.earnings_summary || null
        };
        
        console.log('Setting dashboard data:', dashboardData);
        setDashboardData(dashboardData);
      } else {
        console.error('No data received from API');
        setError('No data received from server');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(`Failed to load dashboard data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'services', label: 'My Services', icon: '🛠️' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  const handleNavigateToPayments = () => {
    setActiveTab('payments');
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'services':
        return <SellerServices />;
      case 'orders':
        return <SellerOrders dashboardData={dashboardData} />;
      case 'reviews':
        return <SellerReviews />;
      case 'payments':
        return <PaymentHistory />;
      case 'profile':
        return <SellerProfile />;
      default:
        return <SellerServices />;
    }
  };

  if (!isSeller) {
    return (
      <div className="seller-dashboard-error">
        <div className="error-content">
          <h1>Access Denied</h1>
          <p>You need to be a seller to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-dashboard">
      <Header />
      <div className="container">
        <div className="seller-dashboard-header">
          <div className="welcome-section">
            <h1>Seller Dashboard</h1>
            <p>Welcome back, {user?.first_name || user?.email}!</p>
            <span className="role-badge">Service Provider</span>
          </div>
        </div>

        <div className="seller-dashboard-content">
          <nav className="dashboard-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="dashboard-main">
            <div className="tab-content">
              {renderActiveTab()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
