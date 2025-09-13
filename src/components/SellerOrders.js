import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import OrderStatus from './OrderStatus';
import './SellerOrders.css';

const SellerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [filter, sortBy]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        seller: user?.id,
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
      // Use fallback data
      setOrders([
        {
          id: 1,
          service: {
            id: 1,
            title: 'Professional Web Development',
            price: 500
          },
          buyer: {
            id: 2,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com'
          },
          status: 'in_progress',
          total_amount: 500,
          quantity: 1,
          requirements: 'I need a modern website for my business with contact form and blog section.',
          created_at: '2024-01-20T10:00:00Z',
          delivery_date: '2024-01-27T10:00:00Z',
          updated_at: '2024-01-22T15:30:00Z'
        },
        {
          id: 2,
          service: {
            id: 2,
            title: 'Logo Design & Branding',
            price: 200
          },
          buyer: {
            id: 3,
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@example.com'
          },
          status: 'completed',
          total_amount: 200,
          quantity: 1,
          requirements: 'Logo design for a tech startup, modern and minimalist style.',
          created_at: '2024-01-15T14:20:00Z',
          delivery_date: '2024-01-18T14:20:00Z',
          updated_at: '2024-01-18T16:45:00Z'
        },
        {
          id: 3,
          service: {
            id: 1,
            title: 'Professional Web Development',
            price: 500
          },
          buyer: {
            id: 4,
            first_name: 'Mike',
            last_name: 'Johnson',
            email: 'mike.johnson@example.com'
          },
          status: 'pending',
          total_amount: 500,
          quantity: 1,
          requirements: 'E-commerce website with payment integration.',
          created_at: '2024-01-22T09:15:00Z',
          delivery_date: '2024-01-29T09:15:00Z',
          updated_at: '2024-01-22T09:15:00Z'
        }
      ]);
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
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
  };

  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const inProgress = orders.filter(o => o.status === 'in_progress').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const totalRevenue = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total_amount, 0);

    return { total, pending, inProgress, completed, totalRevenue };
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="seller-orders-loading">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="seller-orders">
      <div className="orders-header">
        <div className="header-content">
          <h2>Order Management</h2>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="order-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending</h3>
            <div className="stat-value">{stats.pending}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>In Progress</h3>
            <div className="stat-value">{stats.inProgress}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Completed</h3>
            <div className="stat-value">{stats.completed}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <div className="stat-value">{formatPrice(stats.totalRevenue)}</div>
          </div>
        </div>
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
            <option value="delivery_date">Delivery Date</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="orders-error">
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={fetchOrders}>
            Try Again
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-content">
            <h3>No Orders Found</h3>
            <p>
              {filter === 'all' 
                ? "You haven't received any orders yet." 
                : `No orders found with status: ${filter}`
              }
            </p>
          </div>
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
                    canEdit={true}
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
                    <span className="detail-value">{formatDate(order.placed_at)}</span>
                  </div>
                </div>

                <div className="buyer-info">
                  <div className="buyer-details">
                    <span className="buyer-label">Buyer:</span>
                    <span className="buyer-name">
                      {order.buyer.first_name} {order.buyer.last_name}
                    </span>
                    <span className="buyer-email">{order.buyer.email}</span>
                  </div>
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
                  {order.status === 'pending' && (
                    <button 
                      className="btn btn-success"
                      onClick={() => handleStatusChange(order.id, 'in_progress')}
                    >
                      Start Work
                    </button>
                  )}
                  {order.status === 'in_progress' && (
                    <button 
                      className="btn btn-success"
                      onClick={() => handleStatusChange(order.id, 'completed')}
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="order-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Order Details - #{selectedOrder.id}</h3>
              <button 
                className="modal-close"
                onClick={handleCloseOrderDetails}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="order-detail-section">
                <h4>Service Information</h4>
                <p><strong>Service:</strong> {selectedOrder.service?.title}</p>
                <p><strong>Price:</strong> {formatPrice(selectedOrder.total_amount)}</p>
                <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
              </div>
              
              <div className="order-detail-section">
                <h4>Buyer Information</h4>
                <p><strong>Name:</strong> {selectedOrder.buyer.first_name} {selectedOrder.buyer.last_name}</p>
                <p><strong>Email:</strong> {selectedOrder.buyer.email}</p>
              </div>
              
              <div className="order-detail-section">
                <h4>Order Timeline</h4>
                <p><strong>Ordered:</strong> {formatDate(selectedOrder.placed_at)}</p>
              </div>
              
              {selectedOrder.requirements && (
                <div className="order-detail-section">
                  <h4>Requirements</h4>
                  <p>{selectedOrder.requirements}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={handleCloseOrderDetails}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
