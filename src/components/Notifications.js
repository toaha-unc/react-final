import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { notificationsAPI } from '../services/api';
import Header from './Header';
import './Notifications.css';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (filter !== 'all') {
        params.is_read = filter === 'read';
      }
      
      const response = await notificationsAPI.getNotifications(params);
      const notificationsData = response.data?.results || response.data || [];
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'order_placed': '📦',
      'order_updated': '🔄',
      'order_completed': '✅',
      'order_cancelled': '❌',
      'message_received': '💬',
      'file_uploaded': '📎',
      'review_received': '⭐',
      'payment_received': '💰',
      'general': '🔔'
    };
    return icons[type] || icons.general;
  };

  const getNotificationColor = (type) => {
    const colors = {
      'order_placed': '#007bff',
      'order_updated': '#ffc107',
      'order_completed': '#28a745',
      'order_cancelled': '#dc3545',
      'message_received': '#17a2b8',
      'file_uploaded': '#6f42c1',
      'review_received': '#fd7e14',
      'payment_received': '#20c997',
      'general': '#6c757d'
    };
    return colors[type] || colors.general;
  };

  if (loading) {
    return (
      <div className="notifications-loading">
        <div className="loading-spinner"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-error">
        <h3>Error Loading Notifications</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchNotifications}>
          Try Again
        </button>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="notifications">
      <Header />
      <div className="notifications-header">
        <h1>Notifications</h1>
        <div className="notifications-actions">
          {unreadCount > 0 && (
            <button 
              className="btn btn-secondary"
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      <div className="notifications-filters">
        <div className="filter-group">
          <label htmlFor="status-filter">Filter:</label>
          <select
            id="status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="no-notifications">
          <h3>No Notifications</h3>
          <p>
            {filter === 'all' 
              ? 'You don\'t have any notifications yet.' 
              : `No ${filter} notifications found.`
            }
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
              onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
            >
              <div className="notification-icon">
                <span 
                  style={{ 
                    color: getNotificationColor(notification.type),
                    fontSize: '1.5rem'
                  }}
                >
                  {getNotificationIcon(notification.type)}
                </span>
              </div>
              
              <div className="notification-content">
                <div className="notification-header">
                  <h4 className="notification-title">
                    {notification.title}
                  </h4>
                  <span className="notification-time">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
                
                <p className="notification-message">
                  {notification.message}
                </p>
                
                {notification.data && (
                  <div className="notification-data">
                    {notification.data.order_id && (
                      <span className="data-item">
                        Order #{notification.data.order_id}
                      </span>
                    )}
                    {notification.data.service_title && (
                      <span className="data-item">
                        {notification.data.service_title}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {!notification.is_read && (
                <div className="notification-indicator">
                  <div className="unread-dot"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
