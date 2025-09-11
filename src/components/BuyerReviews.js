import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reviewsAPI } from '../services/api';
import './BuyerReviews.css';

const BuyerReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');

  useEffect(() => {
    fetchReviews();
  }, [filter, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Since we don't have a specific endpoint for buyer reviews, we'll fetch all reviews
      // and filter by the current user as the reviewer
      const response = await reviewsAPI.getServiceReviews();
      const allReviews = response.data?.results || response.data || [];
      
      // Filter reviews by current user
      const userReviews = allReviews.filter(review => review.reviewer?.id === user?.id);
      setReviews(Array.isArray(userReviews) ? userReviews : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`star ${index < rating ? 'filled' : 'empty'}`}
      >
        ★
      </span>
    ));
  };

  const getRatingText = (rating) => {
    const ratingTexts = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return ratingTexts[rating] || 'No Rating';
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewsAPI.deleteReview(reviewId);
        fetchReviews(); // Refresh the list
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Failed to delete review. Please try again.');
      }
    }
  };

  const handleEditReview = (review) => {
    // Navigate to edit review page or open edit modal
    window.location.href = `/reviews/${review.id}/edit`;
  };

  if (loading) {
    return (
      <div className="buyer-reviews-loading">
        <div className="loading-spinner"></div>
        <p>Loading your reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="buyer-reviews-error">
        <h3>Error Loading Reviews</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchReviews}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="buyer-reviews">
      <div className="reviews-header">
        <h2>My Reviews</h2>
        <p>Reviews you've left for services and sellers</p>
      </div>

      <div className="reviews-filters">
        <div className="filter-group">
          <label htmlFor="rating-filter">Filter by Rating:</label>
          <select
            id="rating-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
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
            <option value="rating">Rating</option>
            <option value="service">Service</option>
          </select>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <div className="no-reviews-icon">⭐</div>
          <h3>No Reviews Found</h3>
          <p>
            {filter === 'all' 
              ? 'You haven\'t left any reviews yet.' 
              : `No reviews found with ${filter} star${filter !== '1' ? 's' : ''} rating`
            }
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/orders'}
          >
            View My Orders
          </button>
        </div>
      ) : (
        <div className="reviews-grid">
          {reviews
            .filter(review => filter === 'all' || review.rating === parseInt(filter))
            .sort((a, b) => {
              switch (sortBy) {
                case 'rating':
                  return b.rating - a.rating;
                case 'service':
                  return (a.service?.title || '').localeCompare(b.service?.title || '');
                case 'created_at':
                default:
                  return new Date(b.created_at) - new Date(a.created_at);
              }
            })
            .map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="review-service">
                  <h3 className="service-title">
                    {review.service?.title || 'Service Review'}
                  </h3>
                  <p className="service-seller">
                    by {review.service?.seller?.first_name} {review.service?.seller?.last_name}
                  </p>
                </div>
                <div className="review-rating">
                  <div className="stars">
                    {renderStars(review.rating)}
                  </div>
                  <span className="rating-text">
                    {getRatingText(review.rating)}
                  </span>
                </div>
              </div>

              <div className="review-content">
                <div className="review-text">
                  <p>{review.comment}</p>
                </div>
                
                {review.images && review.images.length > 0 && (
                  <div className="review-images">
                    <h4>Images:</h4>
                    <div className="images-grid">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image.image_url}
                          alt={`Review image ${index + 1}`}
                          className="review-image"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="review-footer">
                <div className="review-meta">
                  <span className="review-date">
                    {formatDate(review.created_at)}
                  </span>
                  <span className="review-helpful">
                    {review.helpful_count || 0} helpful
                  </span>
                </div>
                
                <div className="review-actions">
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleEditReview(review)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteReview(review.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="reviews-summary">
        <h3>Review Summary</h3>
        <div className="summary-stats">
          <div className="summary-item">
            <span className="summary-label">Total Reviews:</span>
            <span className="summary-value">{reviews.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Average Rating Given:</span>
            <span className="summary-value">
              {reviews.length > 0 
                ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                : '0.0'
              }/5
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Most Recent:</span>
            <span className="summary-value">
              {reviews.length > 0 ? formatDate(reviews[0].created_at) : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerReviews;
