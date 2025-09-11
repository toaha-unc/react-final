import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';
import OrderStatus from './OrderStatus';
import './OrderList.css';

const OrderList = ({ onViewOrder, onEditOrder }) => {
  const { user, isSeller, isBuyer } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');

  useEffect(() => {
    fetchOrders();
  }, [filter, sortBy]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ordering: sortBy === 'created_at' ? '-created_at' : sortBy,
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrder(orderId, { status: newStatus });
      fetchOrders(); // Refresh the list
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const handleViewOrder = (order) => {
    if (onViewOrder) {
      onViewOrder(order);
    }
  };

  const handleEditOrder = (order) => {
    if (onEditOrder) {
      onEditOrder(order);
    }
  };

  if (loading) {
    return (
      <div className="order-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-list-error">
        <h3>Error Loading Orders</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchOrders}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="order-list">
      <div className="order-list-header">
        <h1>
          {isSeller ? 'Orders Received' : 'My Orders'}
        </h1>
        <p>
          {isSeller 
            ? 'Manage orders for your services' 
            : 'Track your order history and status'
          }
        </p>
      </div>

      <div className="order-filters">
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
          <h3>No Orders Found</h3>
          <p>
            {filter === 'all' 
              ? 'You haven\'t placed any orders yet.' 
              : `No orders found with status: ${filter}`
            }
          </p>
          {isBuyer && (
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/services'}
            >
              Browse Services
            </button>
          )}
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
                    onStatusChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                    canEdit={isSeller}
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
                  {isSeller && order.buyer && (
                    <div className="party-info">
                      <span className="party-label">Buyer:</span>
                      <span className="party-name">
                        {order.buyer.first_name} {order.buyer.last_name}
                      </span>
                    </div>
                  )}
                  {isBuyer && order.seller && (
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
              </div>

              <div className="order-card-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleViewOrder(order)}
                >
                  View Details
                </button>
                {isSeller && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleEditOrder(order)}
                  >
                    Manage Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList;
