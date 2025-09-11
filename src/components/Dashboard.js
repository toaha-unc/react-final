import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Recommendations from './Recommendations';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isSeller, isBuyer } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome to your Dashboard</h1>
          <p>Hello, {user?.first_name || user?.email}!</p>
        </div>

        <div className="dashboard-content">
          <div className="user-info-card">
            <h2>Account Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Email:</label>
                <span>{user?.email}</span>
              </div>
              <div className="info-item">
                <label>Name:</label>
                <span>{user?.first_name} {user?.last_name}</span>
              </div>
              <div className="info-item">
                <label>Role:</label>
                <span className={`role-badge ${user?.role}`}>
                  {user?.role === 'seller' ? 'Service Provider' : 'Buyer'}
                </span>
              </div>
              <div className="info-item">
                <label>Email Verified:</label>
                <span className={user?.is_email_verified ? 'verified' : 'unverified'}>
                  {user?.is_email_verified ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          <div className="dashboard-cards">
            {isSeller && (
              <div className="dashboard-card">
                <h3>Service Provider Tools</h3>
                <p>Manage your services, view orders, and track earnings.</p>
                <div className="card-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/seller-dashboard')}
                  >
                    Seller Dashboard
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => navigate('/services')}
                  >
                    Manage Services
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => navigate('/orders')}
                  >
                    View Orders
                  </button>
                </div>
              </div>
            )}

            {isBuyer && (
              <div className="dashboard-card">
                <h3>Buyer Tools</h3>
                <p>Browse services, place orders, and manage your projects.</p>
                <div className="card-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/buyer-dashboard')}
                  >
                    Buyer Dashboard
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => navigate('/services')}
                  >
                    Browse Services
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => navigate('/orders')}
                  >
                    My Orders
                  </button>
                </div>
              </div>
            )}

            <div className="dashboard-card">
              <h3>Notifications</h3>
              <p>Stay updated with order notifications and messages.</p>
              <div className="card-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/notifications')}
                >
                  View Notifications
                </button>
              </div>
            </div>

            <div className="dashboard-card">
              <h3>Profile Settings</h3>
              <p>Update your profile information and preferences.</p>
              <div className="card-actions">
                <button className="btn btn-primary">Edit Profile</button>
                <button className="btn btn-secondary">Account Settings</button>
              </div>
            </div>
          </div>

          {/* Recommendations for buyers */}
          {isBuyer && (
            <div className="recommendations-section">
              <Recommendations />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
