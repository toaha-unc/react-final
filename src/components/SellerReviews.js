import React, { useState, useEffect } from 'react';
import { reviewsAPI, servicesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './SellerReviews.css';

const SellerReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [ratingFilter, setRatingFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [filter, sortBy, ratingFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch seller's services first
      const servicesResponse = await servicesAPI.getSellerServices();
      const servicesData = servicesResponse.data?.results || servicesResponse.data || [];
      setServices(Array.isArray(servicesData) ? servicesData : []);

      // Use the dedicated seller reviews endpoint
      const reviewsResponse = await reviewsAPI.getSellerReviews(user?.id);
      const reviewsData = reviewsResponse.data?.results || reviewsResponse.data || [];
      
      // Add service title to each review
      const reviewsWithServiceTitle = reviewsData.map(review => ({
        ...review,
        service_id: review.service?.id,
        service_title: review.service?.title || 'Service Deleted'
      }));

      setReviews(reviewsWithServiceTitle);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews. Please try again.');
      // Use fallback data
      setReviews([
        {
          id: 1,
          service_id: 1,
          service_title: 'Professional Web Development',
          buyer: {
            id: 2,
            first_name: 'John',
            last_name: 'Doe'
          },
          rating: 5,
          comment: 'Excellent work! The website exceeded my expectations. Very professional and responsive.',
          created_at: '2024-01-18T14:30:00Z',
          is_helpful: 8,
          images: []
        },
        {
          id: 2,
          service_id: 1,
          service_title: 'Professional Web Development',
          buyer: {
            id: 3,
            first_name: 'Jane',
            last_name: 'Smith'
          },
          rating: 4,
          comment: 'Good quality work, delivered on time. Would recommend for future projects.',
          created_at: '2024-01-15T10:20:00Z',
          is_helpful: 5,
          images: []
        },
        {
          id: 3,
          service_id: 2,
          service_title: 'Logo Design & Branding',
          buyer: {
            id: 4,
            first_name: 'Mike',
            last_name: 'Johnson'
          },
          rating: 5,
          comment: 'Amazing logo design! Perfectly captured what I was looking for. Very creative and professional.',
          created_at: '2024-01-12T16:45:00Z',
          is_helpful: 12,
          images: []
        },
        {
          id: 4,
          service_id: 1,
          service_title: 'Professional Web Development',
          buyer: {
            id: 5,
            first_name: 'Sarah',
            last_name: 'Wilson'
          },
          rating: 3,
          comment: 'The work was decent but took longer than expected. Communication could be better.',
          created_at: '2024-01-10T09:15:00Z',
          is_helpful: 2,
          images: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#28a745';
    if (rating >= 3) return '#ffc107';
    return '#dc3545';
  };

  const filterReviews = (reviews) => {
    let filtered = [...reviews];

    // Filter by service
    if (filter !== 'all') {
      filtered = filtered.filter(review => review.service_id.toString() === filter);
    }

    // Filter by rating
    if (ratingFilter !== 'all') {
      filtered = filtered.filter(review => review.rating.toString() === ratingFilter);
    }

    // Sort reviews
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'rating':
          return b.rating - a.rating;
        case 'helpful':
          return b.is_helpful - a.is_helpful;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getReviewStats = () => {
    const total = reviews.length;
    const average = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    const ratingCounts = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };

    return { total, average, ratingCounts };
  };

  const stats = getReviewStats();
  const filteredReviews = filterReviews(reviews);

  if (loading) {
    return (
      <div className="seller-reviews-loading">
        <div className="loading-spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="seller-reviews">
      <div className="reviews-header">
        <div className="header-content">
          <h2>Reviews & Ratings</h2>
        </div>
      </div>

      {/* Review Statistics */}
      <div className="review-stats">
        <div className="stats-overview">
          <div className="overview-card">
            <div className="overview-content">
              <h3>Overall Rating</h3>
              <div className="rating-display">
                <span className="rating-number">{stats.average.toFixed(1)}</span>
                <div className="rating-stars">
                  {getRatingStars(Math.round(stats.average))}
                </div>
                <span className="rating-count">({stats.total} reviews)</span>
              </div>
            </div>
          </div>

          <div className="rating-breakdown">
            <h4>Rating Breakdown</h4>
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="rating-bar">
                <span className="rating-label">{rating} star</span>
                <div className="rating-progress">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${stats.total > 0 ? (stats.ratingCounts[rating] / stats.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="rating-count">{stats.ratingCounts[rating]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="reviews-filters">
        <div className="filter-group">
          <label htmlFor="service-filter">Filter by Service:</label>
          <select
            id="service-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Services</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="rating-filter">Filter by Rating:</label>
          <select
            id="rating-filter"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
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
            <option value="created_at">Most Recent</option>
            <option value="rating">Highest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="reviews-error">
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={fetchData}>
            Try Again
          </button>
        </div>
      )}

      {filteredReviews.length === 0 ? (
        <div className="no-reviews">
          <div className="no-reviews-content">
            <h3>No Reviews Found</h3>
            <p>
              {filter === 'all' && ratingFilter === 'all'
                ? "You haven't received any reviews yet." 
                : "No reviews match your current filters."
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="reviews-list">
          {filteredReviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {(review.buyer?.first_name?.charAt(0) || 'U')}{(review.buyer?.last_name?.charAt(0) || 'U')}
                  </div>
                  <div className="reviewer-details">
                    <h4 className="reviewer-name">
                      {review.buyer?.first_name || 'Anonymous'} {review.buyer?.last_name || 'User'}
                    </h4>
                    <p className="review-service">{review.service_title}</p>
                    <span className="review-date">{formatDate(review.created_at)}</span>
                  </div>
                </div>
                <div className="review-rating">
                  <div 
                    className="rating-stars"
                    style={{ color: getRatingColor(review.rating) }}
                  >
                    {getRatingStars(review.rating)}
                  </div>
                  <span className="rating-number">{review.rating}/5</span>
                </div>
              </div>

              <div className="review-content">
                <p className="review-comment">{review.comment}</p>
                
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

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerReviews;
