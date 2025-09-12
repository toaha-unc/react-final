import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';
import OrderStatus from './OrderStatus';
import './BuyerOrders.css';

const BuyerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const scrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter, sortBy]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ordering: sortBy === 'created_at' ? '-created_at' : sortBy,
        buyer: user?.id
      };
      
      if (filter !== 'all') {
        params.status = filter;
      }
      
      const response = await ordersAPI.getOrders(params);
      const ordersData = response.data?.results || response.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'pending': '#ffc107',
      'in_progress': '#007bff',
      'completed': '#28a745',
      'cancelled': '#dc3545',
      'delivered': '#6f42c1'
    };
    return statusColors[status] || '#6c757d';
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="buyer-orders-loading">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="buyer-orders-error">
        <h3>Error Loading Orders</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchOrders}>
          Try Again
        </button>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="buyer-order-details">
        <div className="order-details-header">
          <button className="back-btn" onClick={handleBackToList}>
            ← Back to Orders
          </button>
          <h2>Order Details</h2>
        </div>

        <div className="order-details-content">
          <div className="order-main">
            <div className="order-header">
              <div className="order-title-section">
                <h1 className="order-title">
                  {selectedOrder.service?.title || 'Service Order'}
                </h1>
                <p className="order-id">Order #{selectedOrder.id}</p>
              </div>
              <div className="order-status-section">
                <OrderStatus 
                  status={selectedOrder.status} 
                  onStatusChange={() => {}} // Buyers can't change status
                  canEdit={false}
                />
              </div>
            </div>

            <div className="order-info-grid">
              <div className="info-card">
                <h3>Order Information</h3>
                <div className="info-items">
                  <div className="info-item">
                    <span className="info-label">Order Date:</span>
                    <span className="info-value">{formatDate(selectedOrder.created_at)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Total Amount:</span>
                    <span className="info-value">{formatPrice(selectedOrder.total_amount)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Quantity:</span>
                    <span className="info-value">{selectedOrder.quantity}</span>
                  </div>
                  {selectedOrder.delivery_date && (
                    <div className="info-item">
                      <span className="info-label">Delivery Date:</span>
                      <span className="info-value">{formatDate(selectedOrder.delivery_date)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card">
                <h3>Seller Information</h3>
                <div className="info-items">
                  {selectedOrder.seller && (
                    <>
                      <div className="info-item">
                        <span className="info-label">Name:</span>
                        <span className="info-value">
                          {selectedOrder.seller.first_name} {selectedOrder.seller.last_name}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Email:</span>
                        <span className="info-value">{selectedOrder.seller.email}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {selectedOrder.requirements && (
              <div className="requirements-section">
                <h3>Project Requirements</h3>
                <div className="requirements-content">
                  <p>{selectedOrder.requirements}</p>
                </div>
              </div>
            )}

            <div className="order-actions">
              <button 
                className="btn btn-primary"
                onClick={() => window.location.href = `/order-details/${selectedOrder.id}`}
              >
                View Full Details
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => window.location.href = `/services/${selectedOrder.service?.id}`}
              >
                View Service
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="buyer-orders">
      <div className="orders-header">
        <h2>Order History</h2>
        <p>Track and manage your service orders</p>
      </div>

      <div className="orders-filters">
        <div className="filter-group">
          <label htmlFor="status-filter">Filter by Status:</label>
          <select
            id="status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-filter">Sort by:</label>
          <select
            id="sort-filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="created_at">Date Created</option>
            <option value="total_amount">Price</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h3>No Orders Found</h3>
          <p>
            {filter === 'all' 
              ? 'You haven\'t placed any orders yet.' 
              : `No orders found with status: ${filter}`
            }
          </p>
          <button 
            className="btn btn-primary"
            onClick={scrollToServices}
          >
            Browse Services
          </button>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-info">
                  <h3 className="order-title">
                    {order.service?.title || 'Service Order'}
                  </h3>
                  <p className="order-id">Order #{order.id}</p>
                </div>
                <div className="order-status">
                  <OrderStatus 
                    status={order.status} 
                    onStatusChange={() => {}} // Buyers can't change status
                    canEdit={false}
                  />
                </div>
              </div>

              <div className="order-card-content">
                <div className="order-details">
                  <div className="detail-item">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value">{formatPrice(order.total_amount)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Quantity:</span>
                    <span className="detail-value">{order.quantity}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ordered:</span>
                    <span className="detail-value">{formatDate(order.created_at)}</span>
                  </div>
                  {order.delivery_date && (
                    <div className="detail-item">
                      <span className="detail-label">Delivery:</span>
                      <span className="detail-value">{formatDate(order.delivery_date)}</span>
                    </div>
                  )}
                </div>

                <div className="order-parties">
                  {order.seller && (
                    <div className="party-info">
                      <span className="party-label">Seller:</span>
                      <span className="party-name">
                        {order.seller.first_name} {order.seller.last_name}
                      </span>
                    </div>
                  )}
                </div>

                {order.requirements && (
                  <div className="order-requirements">
                    <span className="requirements-label">Requirements:</span>
                    <p className="requirements-text">{order.requirements}</p>
                  </div>
                )}

                <div className="order-card-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleViewOrder(order)}
                  >
                    View Details
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => window.location.href = `/services/${order.service?.id}`}
                  >
                    View Service
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerOrders;
