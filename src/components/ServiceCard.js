import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ServiceCard.css';

const ServiceCard = ({ service, onEdit, onDelete, onViewDetails }) => {
  const navigate = useNavigate();
  const { isSeller, user } = useAuth();

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

  const formatDeliveryTime = (days) => {
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.ceil(days / 7)} week${Math.ceil(days / 7) > 1 ? 's' : ''}`;
    return `${Math.ceil(days / 30)} month${Math.ceil(days / 30) > 1 ? 's' : ''}`;
  };

  const truncateDescription = (description, maxLength = 150) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  const handleOrderNow = () => {
    if (!user) {
      alert('Please login to place an order');
      return;
    }
    
    // Navigate to order form
    navigate(`/order-form/${service.id}`);
  };

  return (
    <div className="service-card">
      <div className="service-card-header">
        <div className="service-category">
          {typeof service.category === 'string' ? service.category : service.category?.name || 'Uncategorized'}
        </div>
        {onEdit && onDelete && (
          <div className="service-actions">
            <button 
              className="btn-icon" 
              onClick={() => onEdit(service)}
              title="Edit Service"
            >
              ✏️
            </button>
            <button 
              className="btn-icon" 
              onClick={() => onDelete(service.id)}
              title="Delete Service"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      <div className="service-content">
        <h3 className="service-title">{service.title}</h3>
        <p className="service-description">
          {truncateDescription(service.description)}
        </p>
        
        <div className="service-meta">
          <div className="service-price">
            {formatPrice(service.price)}
          </div>
          <div className="service-delivery">
            <span className="delivery-label">Delivery:</span>
            <span className="delivery-time">
              {formatDeliveryTime(service.delivery_time)}
            </span>
          </div>
        </div>

        <div className="service-footer">
          <div className="service-seller">
            <span className="seller-name">
              {service.seller?.first_name} {service.seller?.last_name}
            </span>
          </div>
          
          <div className="service-stats">
            <div className="stat">
              <span className="stat-value">{service.average_rating || 0}</span>
              <span className="stat-label">⭐</span>
            </div>
            <div className="stat">
              <span className="stat-value">{service.total_reviews || 0}</span>
              <span className="stat-label">reviews</span>
            </div>
            <div className="stat">
              <span className="stat-value">{service.orders_count || 0}</span>
              <span className="stat-label">orders</span>
            </div>
          </div>
        </div>
      </div>

      <div className="service-card-actions">
        <button 
          className="btn btn-primary"
          onClick={() => onViewDetails(service)}
        >
          View Details
        </button>
        {!isSeller && (
          <button className="btn btn-secondary" onClick={handleOrderNow}>
            Order Now
          </button>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;
