import React, { useState, useEffect, useCallback } from 'react';
import { servicesAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './ServiceDetails.css';

const ServiceDetails = ({ serviceId, onBack, onEdit, onDelete }) => {
  const { isSeller, user } = useAuth();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails();
      fetchReviews();
    }
  }, [serviceId, fetchServiceDetails, fetchReviews]);

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
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [serviceId]);

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

  const handleOrderNow = () => {
    // This would typically navigate to an order form or checkout
    alert('Order functionality will be implemented in the next phase');
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
                    <div className="seller-name">
                      {service.seller?.first_name} {service.seller?.last_name}
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
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-content">
                {reviews.length === 0 ? (
                  <div className="no-reviews">
                    <h3>No Reviews Yet</h3>
                    <p>Be the first to review this service!</p>
                  </div>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((review) => (
                      <div key={review.id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <span className="reviewer-name">
                              {review.buyer?.first_name} {review.buyer?.last_name}
                            </span>
                            <div className="review-rating">
                              {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </div>
                          </div>
                          <div className="review-date">
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="review-content">
                          <p>{review.comment}</p>
                        </div>
                        {review.is_helpful > 0 && (
                          <div className="review-helpful">
                            {review.is_helpful} people found this helpful
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
              <button className="btn btn-primary order-btn" onClick={handleOrderNow}>
                Order Now
              </button>
            )}
            
            <div className="order-features">
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>24/7 Support</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>Money Back Guarantee</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✓</span>
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
