import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { servicesAPI, ordersAPI } from '../services/api';
import './OrderForm.css';

const OrderForm = ({ onSuccess, onCancel }) => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    quantity: 1,
    requirements: '',
    total_amount: 0
  });

  useEffect(() => {
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  const fetchService = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await servicesAPI.getService(serviceId);
      const serviceData = response.data;
      setService(serviceData);
      setFormData(prev => ({
        ...prev,
        total_amount: serviceData.price
      }));
    } catch (error) {
      console.error('Error fetching service:', error);
      setError('Failed to load service details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Recalculate total amount when quantity changes
      if (name === 'quantity' && service) {
        newData.total_amount = service.price * parseInt(value) || 0;
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to place an order');
      return;
    }

    if (!formData.requirements.trim()) {
      alert('Please provide your project requirements');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const orderData = {
        service: serviceId,
        quantity: parseInt(formData.quantity),
        total_amount: formData.total_amount,
        requirements: formData.requirements.trim()
      };
      
      const response = await ordersAPI.createOrder(orderData);
      
      if (onSuccess) {
        onSuccess(response.data);
      } else {
        alert('Order placed successfully!');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Failed to place order. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="order-form-loading">
        <div className="loading-spinner"></div>
        <p>Loading service details...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="order-form-error">
        <h3>Error Loading Service</h3>
        <p>{error || 'Service not found'}</p>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="order-form">
      <div className="order-form-header">
        <h1>Place Order</h1>
        <p>Complete your order for: <strong>{service.title}</strong></p>
      </div>

      <div className="order-form-content">
        <div className="service-summary">
          <div className="service-info">
            <h3>{service.title}</h3>
            <p className="service-description">{service.description}</p>
            <div className="service-meta">
              <div className="meta-item">
                <span className="meta-label">Base Price:</span>
                <span className="meta-value">{formatPrice(service.price)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Delivery Time:</span>
                <span className="meta-value">{service.delivery_time} days</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Seller:</span>
                <span className="meta-value">
                  {service.seller?.first_name} {service.seller?.last_name}
                </span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="order-form-fields">
          <div className="form-group">
            <label htmlFor="quantity" className="form-label">
              Quantity *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              max="10"
              className="form-input"
              required
            />
            <small className="form-help">
              Select the number of units you need
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="requirements" className="form-label">
              Project Requirements *
            </label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              className="form-textarea"
              rows="6"
              placeholder="Please describe your project requirements in detail. Include any specific instructions, preferences, or materials needed..."
              required
            />
            <small className="form-help">
              Provide detailed information about what you need. The more specific you are, the better the seller can meet your expectations.
            </small>
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              <div className="summary-item">
                <span className="summary-label">Service:</span>
                <span className="summary-value">{service.title}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Quantity:</span>
                <span className="summary-value">{formData.quantity}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Unit Price:</span>
                <span className="summary-value">{formatPrice(service.price)}</span>
              </div>
              <div className="summary-item total">
                <span className="summary-label">Total Amount:</span>
                <span className="summary-value">{formatPrice(formData.total_amount)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="form-error">
              <p>{error}</p>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !formData.requirements.trim()}
            >
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
