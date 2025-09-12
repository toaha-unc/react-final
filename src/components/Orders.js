import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';
import Header from './Header';
import OrderStatus from './OrderStatus';
import OrderDetails from './OrderDetails';
import './Orders.css';

const Orders = () => {
  const { user, isSeller, isBuyer } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const ordersPerPage = 12;

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        page_size: ordersPerPage,
      };
      
      // Add role-specific filters
      if (isSeller) {
        params.seller = user?.id;
      } else if (isBuyer) {
        params.buyer = user?.id;
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
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrder(orderId, { status: newStatus });
      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };


  const handleBackToList = () => {
    setSelectedOrder(null);
  };



  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return 'BDT 0';
    }
    
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numericPrice)) {
      return 'BDT 0';
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
      day: 'numeric'
    });
  };


  if (selectedOrder) {
    return (
      <OrderDetails
        orderId={selectedOrder.id}
        onBack={handleBackToList}
      />
    );
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-loading">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-error">
          <h3>Error Loading Orders</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchOrders}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <Header />
      <div className="orders-header">
        <div className="header-content">
          <h1>Orders</h1>
        </div>
      </div>

      <div className="filters-sort-container">
        <div className="filters-container">
          {/* Filters will be added here */}
        </div>
        <div className="sort-container">
          {/* Sort will be added here */}
        </div>
      </div>

      <div className="orders-content">
        <div className="orders-main">
          <div className="orders-stats">
            <p>
              Showing {orders.length} of {totalOrders} orders
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="no-orders">
              <div className="no-orders-content">
                <div className="no-orders-icon">📦</div>
                <h3>No Orders Found</h3>
                <p>You haven't placed any orders yet.</p>
                {isBuyer && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => window.location.href = '/services'}
                  >
                    Browse Services
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="orders-container">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-card-header">
                      <div className="order-info">
                        <h3 className="order-title">
                          {order.service?.title || 'Service Order'}
                        </h3>
                        <p className="order-id">#{order.id}</p>
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
                          <span className="detail-label">Amount:</span>
                          <span className="detail-value">{formatPrice(order.total_amount)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Date:</span>
                          <span className="detail-value">{formatDate(order.placed_at)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">
                            {isSeller ? 'Buyer:' : 'Seller:'}
                          </span>
                          <span className="detail-value">
                            {isSeller 
                              ? `${order.buyer?.first_name || ''} ${order.buyer?.last_name || ''}`.trim() || 'Anonymous User'
                              : `${order.seller?.first_name || ''} ${order.seller?.last_name || ''}`.trim() || 'Anonymous User'
                            }
                          </span>
                        </div>
                      </div>

                      {order.requirements && (
                        <div className="order-requirements">
                          <p className="requirements-text">
                            {order.requirements.length > 100 
                              ? `${order.requirements.substring(0, 100)}...` 
                              : order.requirements
                            }
                          </p>
                        </div>
                      )}

                      <div className="order-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleViewOrder(order)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
