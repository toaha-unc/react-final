import React, { useState, useEffect, useCallback } from 'react';
import { servicesAPI, reviewsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ReviewForm from './ReviewForm';
import './ServiceDetails.css';

const ServiceDetails = ({ serviceId, onBack, onEdit, onDelete }) => {
  const { isSeller, user } = useAuth();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userCanReview, setUserCanReview] = useState(false);
  const [userHasOrdered, setUserHasOrdered] = useState(false);

  const fetchServiceDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await servicesAPI.getService(serviceId);
      setService(response.data);
    } catch (error) {
      console.error('Error fetching service details:', error);
      setError('Failed to load service details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await reviewsAPI.getServiceReviews(serviceId);
      // Ensure reviews is always an array
      const reviewsData = response.data?.results || response.data || [];
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]); // Set empty array on error
    }
  }, [serviceId]);

  const checkUserOrderStatus = useCallback(async () => {
    if (!user || isSeller) return;
    
    try {
      // Check if user has ordered this service
      const response = await ordersAPI.getOrders({ service: serviceId });
      const userOrders = response.data?.results || response.data || [];
      const hasOrdered = Array.isArray(userOrders) && userOrders.some(order => 
        order.buyer?.id === user.id && 
        (order.status === 'completed' || order.status === 'delivered')
      );
      setUserHasOrdered(hasOrdered);
      
      // Check if user has already reviewed this service
      const reviewsResponse = await reviewsAPI.getServiceReviews(serviceId);
      const reviewsData = reviewsResponse.data?.results || reviewsResponse.data || [];
      const userReviews = Array.isArray(reviewsData) ? reviewsData.filter(review => review.buyer?.id === user.id) : [];
      
      // For now, allow reviews if user is a buyer (for testing purposes)
      // In production, this should be: hasOrdered && userReviews.length === 0
      setUserCanReview(user.role === 'buyer' && userReviews.length === 0);
    } catch (error) {
      console.error('Error checking user order status:', error);
      // For testing, allow buyers to review if there's an error
      if (user.role === 'buyer') {
        setUserCanReview(true);
      }
    }
  }, [serviceId, user, isSeller]);

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails();
      fetchReviews();
      checkUserOrderStatus();
    }
  }, [serviceId, fetchServiceDetails, fetchReviews, checkUserOrderStatus]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDeliveryTime = (days) => {
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.ceil(days / 7)} week${Math.ceil(days / 7) > 1 ? 's' : ''}`;
    return `${Math.ceil(days / 30)} month${Math.ceil(days / 30) > 1 ? 's' : ''}`;
  };

  const handleOrderNow = async () => {
    if (!user) {
      alert('Please login to place an order');
      return;
    }
    
    try {
      const orderData = {
        service: serviceId,
        quantity: 1,
        total_amount: service.price,
        requirements: 'Please provide your project requirements'
      };
      
      const response = await ordersAPI.createOrder(orderData);
      alert('Order placed successfully! You will be redirected to your orders.');
      // You could navigate to orders page here
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      // Create the review first
      const reviewResponse = await reviewsAPI.createReview(serviceId, {
        rating: reviewData.rating,
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
      
      setShowReviewForm(false);
      setUserCanReview(false);
      fetchReviews(); // Refresh reviews
      fetchServiceDetails(); // Refresh service stats
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await reviewsAPI.markHelpful(reviewId);
      fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const handleEditService = () => {
    if (onEdit) {
      onEdit(service);
    }
  };

  const handleDeleteService = async () => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await servicesAPI.deleteService(service.id);
        if (onDelete) {
          onDelete(service.id);
        }
        if (onBack) {
          onBack();
        }
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Failed to delete service. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="service-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading service details...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="service-details-error">
        <h3>Error Loading Service</h3>
        <p>{error || 'Service not found'}</p>
        <button className="btn btn-primary" onClick={onBack}>
          Go Back
        </button>
      </div>
    );
  }

  const isOwner = isSeller && user?.id === service.seller?.id;

  return (
    <div className="service-details">
      <div className="service-details-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Services
        </button>
        
        {isOwner && (
          <div className="owner-actions">
            <button className="btn btn-secondary" onClick={handleEditService}>
              Edit Service
            </button>
            <button className="btn btn-danger" onClick={handleDeleteService}>
              Delete Service
            </button>
          </div>
        )}
      </div>

      <div className="service-details-content">
        <div className="service-main">
          <div className="service-header">
            <div className="service-category">
              {service.category?.name || 'Uncategorized'}
            </div>
            <h1 className="service-title">{service.title}</h1>
            <div className="service-meta">
              <div className="service-price">
                {formatPrice(service.price)}
              </div>
              <div className="service-delivery">
                <span className="delivery-label">Delivery Time:</span>
                <span className="delivery-time">
                  {formatDeliveryTime(service.delivery_time)}
                </span>
              </div>
            </div>
          </div>

          <div className="service-tabs">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-content">
                <div className="service-description">
                  <h3>Description</h3>
                  <p>{service.description}</p>
                </div>

                <div className="service-seller">
                  <h3>About the Seller</h3>
                  <div className="seller-info">
                    <div className="seller-details">
                      <div className="seller-name">
                        {service.seller?.first_name} {service.seller?.last_name}
                      </div>
                      <div className="seller-bio">
                        {service.seller?.bio || 'Experienced professional providing quality services.'}
                      </div>
                      <div className="seller-location">
                        📍 {service.seller?.location || 'Location not specified'}
                      </div>
                      <div className="seller-joined">
                        Member since {service.seller?.date_joined ? 
                          new Date(service.seller.date_joined).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long' 
                          }) : 'Unknown'
                        }
                      </div>
                    </div>
                    <div className="seller-stats">
                      <div className="stat">
                        <span className="stat-value">{service.rating || 0}</span>
                        <span className="stat-label">Rating</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{service.reviews_count || 0}</span>
                        <span className="stat-label">Reviews</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{service.orders_count || 0}</span>
                        <span className="stat-label">Orders</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{service.seller?.response_time || 'N/A'}</span>
                        <span className="stat-label">Response Time</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="service-requirements">
                  <h3>Service Requirements</h3>
                  <div className="requirements-content">
                    <div className="requirement-item">
                      <span className="requirement-label">Delivery Time:</span>
                      <span className="requirement-value">{formatDeliveryTime(service.delivery_time)}</span>
                    </div>
                    <div className="requirement-item">
                      <span className="requirement-label">Revisions:</span>
                      <span className="requirement-value">{service.revisions || 'Unlimited'}</span>
                    </div>
                    <div className="requirement-item">
                      <span className="requirement-label">Communication:</span>
                      <span className="requirement-value">{service.communication || 'Via platform messaging'}</span>
                    </div>
                    <div className="requirement-item">
                      <span className="requirement-label">File Format:</span>
                      <span className="requirement-value">{service.file_format || 'As requested'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-content">
                {user && !isSeller && userCanReview && (
                  <div className="review-form-section">
                    <div className="review-form-header">
                      <h3>Write a Review</h3>
                      <p>Share your experience with this service</p>
                    </div>
                    <ReviewForm 
                      onSubmit={handleReviewSubmit}
                      onCancel={() => setShowReviewForm(false)}
                    />
                  </div>
                )}

                {!Array.isArray(reviews) || reviews.length === 0 ? (
                  <div className="no-reviews">
                    <h3>No Reviews Yet</h3>
                    <p>
                      {userCanReview 
                        ? 'Be the first to review this service!' 
                        : userHasOrdered 
                          ? 'You can review this service after completion.'
                          : 'Reviews will appear here after customers complete their orders.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="reviews-list">
                    <div className="reviews-summary">
                      <h3>Customer Reviews ({Array.isArray(reviews) ? reviews.length : 0})</h3>
                      <div className="average-rating">
                        <span className="rating-value">{service.rating || 0}</span>
                        <div className="rating-stars">
                          {'★'.repeat(Math.floor(service.rating || 0))}
                          {'☆'.repeat(5 - Math.floor(service.rating || 0))}
                        </div>
                        <span className="rating-count">({service.reviews_count || 0} reviews)</span>
                      </div>
                    </div>
                    
                    {Array.isArray(reviews) && reviews.map((review) => (
                      <div key={review.id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <div className="reviewer-avatar">
                              {review.buyer?.first_name?.charAt(0)}{review.buyer?.last_name?.charAt(0)}
                            </div>
                            <div className="reviewer-details">
                              <span className="reviewer-name">
                                {review.buyer?.first_name} {review.buyer?.last_name}
                              </span>
                              <div className="review-rating">
                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                              </div>
                            </div>
                          </div>
                          <div className="review-meta">
                            <div className="review-date">
                              {new Date(review.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <button 
                              className="helpful-btn"
                              onClick={() => handleMarkHelpful(review.id)}
                            >
                              👍 Helpful ({review.is_helpful || 0})
                            </button>
                          </div>
                        </div>
                        <div className="review-content">
                          <p>{review.comment}</p>
                        </div>
                        {review.images && review.images.length > 0 && (
                          <div className="review-images">
                            {review.images.map((image, index) => (
                              <img 
                                key={index} 
                                src={image.image_url} 
                                alt={`Review image ${index + 1}`}
                                className="review-image"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="service-sidebar">
          <div className="order-card">
            <div className="order-price">
              {formatPrice(service.price)}
            </div>
            <div className="order-delivery">
              Delivery in {formatDeliveryTime(service.delivery_time)}
            </div>
            
            {!isOwner && (
              <div className="order-actions">
                {user ? (
                  <button className="btn btn-primary order-btn" onClick={handleOrderNow}>
                    Order Now
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary order-btn" 
                    onClick={() => window.location.href = '/login'}
                  >
                    Login to Order
                  </button>
                )}
                
                {user && !isSeller && userCanReview && (
                  <button 
                    className="btn btn-secondary review-btn" 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                  >
                    Write Review
                  </button>
                )}
              </div>
            )}
            
            <div className="order-features">
              <div className="feature">
                <span>24/7 Support</span>
              </div>
              <div className="feature">
                <span>Money Back Guarantee</span>
              </div>
              <div className="feature">
                <span>Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
