import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI, reviewsAPI } from '../services/api';
import Header from './Header';
import OrderStatus from './OrderStatus';
import OrderDetails from './OrderDetails';
import ReviewForm from './ReviewForm';
import './Orders.css';

const Orders = () => {
  const { user, isSeller, isBuyer } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Review functionality
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [orderReviewStatus, setOrderReviewStatus] = useState({});
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const ordersPerPage = 12;

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  useEffect(() => {
    if (orders.length > 0 && isBuyer) {
      checkReviewStatus();
    }
  }, [orders, isBuyer]);

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

  const checkReviewStatus = async () => {
    if (!isBuyer) return;
    
    const reviewStatus = {};
    
    for (const order of orders) {
      if (order.status === 'completed' || order.status === 'delivered') {
        try {
          // Check if user has already reviewed this service
          const reviewsResponse = await reviewsAPI.getServiceReviews(order.service?.id);
          const reviewsData = reviewsResponse.data?.results || reviewsResponse.data || [];
          const userReviews = Array.isArray(reviewsData) ? 
            reviewsData.filter(review => review.buyer?.id === user.id) : [];
          
          reviewStatus[order.id] = {
            canReview: userReviews.length === 0,
            hasReviewed: userReviews.length > 0
          };
        } catch (error) {
          console.error('Error checking review status for order:', order.id, error);
          reviewStatus[order.id] = {
            canReview: false,
            hasReviewed: false
          };
        }
      } else {
        reviewStatus[order.id] = {
          canReview: false,
          hasReviewed: false
        };
      }
    }
    
    setOrderReviewStatus(reviewStatus);
  };

  const handleLeaveReview = (order) => {
    setReviewingOrder(order);
    setShowReviewForm(true);
  };

  const handleReviewSubmit = async (reviewData) => {
    if (!reviewingOrder) return;
    
    try {
      // Generate title based on rating
      const ratingTitles = {
        1: 'Poor experience',
        2: 'Fair service',
        3: 'Good service',
        4: 'Very good service',
        5: 'Excellent service'
      };
      
      // Create the review first
      const reviewResponse = await reviewsAPI.createReview(reviewingOrder.service.id, {
        rating: reviewData.rating,
        title: ratingTitles[reviewData.rating] || 'Service review',
        comment: reviewData.comment
      });
      
      // Upload images if any
      if (reviewData.images && reviewData.images.length > 0) {
        const reviewId = reviewResponse.data.id;
        for (const imageFile of reviewData.images) {
          const formData = new FormData();
          formData.append('image', imageFile);
          await reviewsAPI.uploadReviewImage(reviewId, formData);
        }
      }
      
      // Update review status for this order
      setOrderReviewStatus(prev => ({
        ...prev,
        [reviewingOrder.id]: {
          canReview: false,
          hasReviewed: true
        }
      }));
      
      setShowReviewForm(false);
      setReviewingOrder(null);
      
      // Trigger service data refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent('serviceReviewSubmitted', {
        detail: {
          serviceId: reviewingOrder.service.id,
          rating: reviewData.rating
        }
      }));
      
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleReviewCancel = () => {
    setShowReviewForm(false);
    setReviewingOrder(null);
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
                        
                        {/* Review button for completed orders (buyers only) */}
                        {isBuyer && (order.status === 'completed' || order.status === 'delivered') && (
                          <>
                            {orderReviewStatus[order.id]?.canReview && (
                              <button 
                                className="btn btn-secondary"
                                onClick={() => handleLeaveReview(order)}
                              >
                                Leave Review
                              </button>
                            )}
                            {orderReviewStatus[order.id]?.hasReviewed && (
                              <span className="review-status">
                                ✓ Reviewed
                              </span>
                            )}
                          </>
                        )}
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

      {/* Review Form Modal */}
      {showReviewForm && reviewingOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Leave a Review</h3>
              <p>Review for: {reviewingOrder.service?.title}</p>
            </div>
            <ReviewForm
              onSubmit={handleReviewSubmit}
              onCancel={handleReviewCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
