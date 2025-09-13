import React, { useState, useEffect } from 'react';
import { ordersAPI, dashboardAPI, statsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import OrderStatus from './OrderStatus';
import './SellerOrders.css';

const SellerOrders = ({ dashboardData }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const ordersPerPage = 12;
  
  // Order statistics (totals across all pages)
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchOrders();
  }, [filter, sortBy, currentPage]);

  // Fetch stats separately - only when filter changes, not on page changes
  useEffect(() => {
    if (user?.id) {
      fetchOrderStats();
    }
  }, [filter, sortBy, user?.id]);

  // Reset to page 1 when filter or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, sortBy]);

  const fetchOrderStats = async () => {
    try {
      console.log('Fetching order stats for seller:', user?.id);
      
      // Try to get stats from the dedicated order-stats endpoint first
      try {
        const response = await statsAPI.getOrderStats();
        console.log('Order stats API response:', response.data);
        
        if (response.data) {
          const stats = {
            total: response.data.total_orders || 0,
            pending: response.data.pending_orders || 0,
            inProgress: response.data.in_progress_orders || 0,
            completed: response.data.completed_orders || 0,
            totalRevenue: response.data.net_revenue || 0
          };
          
          console.log('Using order stats API data:', stats);
          setOrderStats(stats);
          return;
        }
      } catch (apiError) {
        console.log('Order stats API failed, falling back to local calculation:', apiError.message);
      }
      
      // Fallback: Get all orders by fetching all pages
      let allOrders = [];
      let currentPage = 1;
      let hasMorePages = true;
      
      while (hasMorePages) {
        const params = {
          seller: user?.id,
          page: currentPage,
          page_size: 100, // Reasonable page size
        };

        const response = await ordersAPI.getOrders(params);
        const ordersData = response.data?.results || response.data || [];
        
        if (Array.isArray(ordersData) && ordersData.length > 0) {
          allOrders = [...allOrders, ...ordersData];
          currentPage++;
          
          // Check if there are more pages
          const totalCount = response.data?.count || 0;
          const totalPages = Math.ceil(totalCount / 100);
          hasMorePages = currentPage <= totalPages;
        } else {
          hasMorePages = false;
        }
      }
      
      console.log('All orders fetched for stats:', allOrders.length);
      
      if (allOrders.length > 0) {
        const stats = {
          total: allOrders.length,
          pending: allOrders.filter(o => o.status?.toString().toLowerCase().trim() === 'pending').length,
          inProgress: allOrders.filter(o => o.status?.toString().toLowerCase().trim() === 'in_progress').length,
          completed: allOrders.filter(o => o.status?.toString().toLowerCase().trim() === 'completed').length,
          totalRevenue: 0
        };

        // Calculate total revenue from completed orders
        stats.totalRevenue = allOrders
          .filter(o => o.status?.toString().toLowerCase().trim() === 'completed')
          .reduce((sum, o) => {
            const grossAmount = parseFloat(o.total_amount) || 0;
            const platformFee = grossAmount * 0.10; // 10% platform fee
            const netAmount = grossAmount - platformFee;
            return sum + netAmount;
          }, 0);

        console.log('Calculated stats from all orders:', stats);
        setOrderStats(stats);
      } else {
        console.log('No orders found');
        // Set empty stats
        setOrderStats({
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          totalRevenue: 0
        });
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Set empty stats on error
      setOrderStats({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        totalRevenue: 0
      });
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        seller: user?.id,
        ordering: sortBy === 'created_at' ? '-created_at' : sortBy,
        page: currentPage,
        page_size: ordersPerPage,
      };

      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await ordersAPI.getOrders(params);
      const ordersData = response.data?.results || response.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      
      // Update pagination info
      if (response.data?.count !== undefined) {
        setTotalOrders(response.data.count);
        setTotalPages(Math.ceil(response.data.count / ordersPerPage));
      }
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

  // Helper function to check if an order should show "Start Work" button
  const shouldShowStartWorkButton = (order) => {
    const normalizedStatus = order.status?.toString().toLowerCase().trim();
    
    // Check for exact matches
    const exactMatches = normalizedStatus === 'pending' || 
                        normalizedStatus === 'pending_approval' || 
                        normalizedStatus === 'awaiting_approval' ||
                        normalizedStatus === 'new' ||
                        normalizedStatus === 'created' ||
                        normalizedStatus === 'waiting' ||
                        normalizedStatus === 'initial' ||
                        normalizedStatus === 'submitted';
    
    // If exact match found, return true
    if (exactMatches) return true;
    
    // Fallback: Check if the OrderStatus component would display "Pending"
    // This mimics the logic from OrderStatus component
    const statusOptions = [
      { value: 'pending', label: 'Pending', color: '#ffc107' },
      { value: 'in_progress', label: 'In Progress', color: '#007bff' },
      { value: 'completed', label: 'Completed', color: '#28a745' },
      { value: 'delivered', label: 'Delivered', color: '#6f42c1' },
      { value: 'cancelled', label: 'Cancelled', color: '#dc3545' }
    ];
    
    const currentStatus = statusOptions.find(s => s.value === normalizedStatus);
    
    // If no exact match found in statusOptions, it will fall back to the first option (pending)
    // So if the status is not found, it means OrderStatus will show "Pending"
    const wouldShowPending = !currentStatus;
    
    
    return exactMatches || wouldShowPending;
  };

  const getOrderStats = () => {
    console.log('=== ORDER STATS DEBUG ===');
    console.log('Dashboard data:', dashboardData);
    console.log('OrderStats state:', orderStats);
    console.log('Orders on page:', orders.length);
    
    // Prioritize local orderStats state (fetched from order-stats API)
    if (orderStats.total !== undefined) {
      console.log('Using local orderStats state');
      return {
        total: orderStats.total || 0,
        pending: orderStats.pending || 0,
        inProgress: orderStats.inProgress || 0,
        completed: orderStats.completed || 0,
        totalRevenue: orderStats.totalRevenue || 0
      };
    }
    
    // Fallback to dashboard analytics data
    const analytics = dashboardData?.stats?.analytics || dashboardData?.analytics;
    console.log('Analytics found:', analytics);
    
    if (analytics && analytics.total_orders !== undefined) {
      console.log('Using backend analytics data');
      return {
        total: analytics.total_orders || 0,
        pending: analytics.pending_orders || 0,
        inProgress: analytics.in_progress_orders || 0,
        completed: analytics.completed_orders || 0,
        totalRevenue: analytics.total_earnings || 0
      };
    }
    
    console.log('No data available, returning zeros');
    return {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      totalRevenue: 0
    };
  };

  const stats = getOrderStats();

  const handleForceUpdateAnalytics = async () => {
    try {
      console.log('Force updating analytics...');
      const response = await dashboardAPI.forceUpdateAnalytics();
      console.log('Analytics update response:', response.data);
      
      if (response.data.updated) {
        alert(`Analytics updated! Old: ${response.data.old_total_orders}, New: ${response.data.new_total_orders}`);
        // Refresh the dashboard data
        window.location.reload();
      } else {
        alert('Failed to update analytics');
      }
    } catch (error) {
      console.error('Error updating analytics:', error);
      alert('Error updating analytics: ' + error.message);
    }
  };

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
        <>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>
              
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}

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
                  {shouldShowStartWorkButton(order) && (
                    <button 
                      className="btn btn-success"
                      onClick={() => handleStatusChange(order.id, 'in_progress')}
                    >
                      Start Work
                    </button>
                  )}
                  {order.status?.toString().toLowerCase().trim() === 'in_progress' && (
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
        </>
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
