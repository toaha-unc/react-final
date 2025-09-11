import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { servicesAPI, ordersAPI, paymentAPI } from '../services/api';
import { formatPrice } from '../utils/formatting';
import Payment from './Payment';
import './OrderForm.css';

const OrderForm = ({ onSuccess, onCancel }) => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [formData, setFormData] = useState({
    quantity: 1,
    requirements: '',
    total_amount: 0,
    buyer_name: '',
    buyer_phone: '',
    buyer_address: '',
    buyer_city: '',
    buyer_country: '',
    buyer_postal_code: ''
  });

  useEffect(() => {
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  // Update total amount when service or quantity changes
  useEffect(() => {
    if (service && service.price > 0) {
      const newTotal = service.price * formData.quantity;
      if (formData.total_amount !== newTotal) {
        console.log('OrderForm - Updating total amount:', formData.total_amount, '->', newTotal);
        setFormData(prev => ({
          ...prev,
          total_amount: newTotal
        }));
      }
    }
  }, [service, formData.quantity]);

  const fetchService = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching service with ID:', serviceId);
      console.log('Full URL:', `http://localhost:8000/api/services/${serviceId}/`);
      
      const response = await servicesAPI.getService(serviceId);
      console.log('API Response:', response);
      
      const serviceData = response.data;
      console.log('=== Service Data Debug ===');
      console.log('Service Data:', serviceData);
      console.log('Service price from API:', serviceData.price, 'Type:', typeof serviceData.price);
      console.log('Service title:', serviceData.title);
      console.log('=== End Service Data Debug ===');
      
      setService(serviceData);
      const servicePrice = serviceData.price || 0;
      console.log('Service price after fallback:', servicePrice, 'Type:', typeof servicePrice);
      
      setFormData(prev => {
        const newTotal = servicePrice * prev.quantity;
        console.log('OrderForm - Service loaded:', serviceData.title, 'Price:', servicePrice, 'Quantity:', prev.quantity, 'Initial total:', newTotal);
        return {
          ...prev,
          total_amount: newTotal
        };
      });
      
      // Force a re-render to update the display
      console.log('OrderForm - Service loaded, forcing re-render with price:', servicePrice);
    } catch (error) {
      console.error('Error fetching service:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      setError(`Failed to load service details: ${error.message}`);
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
        const quantity = parseInt(value) || 1;
        const servicePrice = service.price || 0;
        newData.total_amount = servicePrice * quantity;
        console.log('OrderForm - Quantity changed:', quantity, 'Service price:', servicePrice, 'New total:', newData.total_amount);
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

    if (!formData.buyer_name.trim()) {
      alert('Please provide your full name');
      return;
    }

    if (!formData.buyer_phone.trim()) {
      alert('Please provide your phone number');
      return;
    }

    if (!formData.buyer_address.trim()) {
      alert('Please provide your address');
      return;
    }

    if (!formData.buyer_city.trim()) {
      alert('Please provide your city');
      return;
    }

    if (!formData.buyer_country.trim()) {
      alert('Please provide your country');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const orderData = {
        service: serviceId,
        quantity: formData.quantity,
        requirements: formData.requirements.trim(),
        buyer_name: formData.buyer_name.trim(),
        buyer_phone: formData.buyer_phone.trim(),
        buyer_address: formData.buyer_address.trim(),
        buyer_city: formData.buyer_city.trim(),
        buyer_country: formData.buyer_country.trim(),
        buyer_postal_code: formData.buyer_postal_code.trim(),
        total_amount: finalTotalAmount
      };
      
      console.log('OrderForm - Creating order with data:', orderData);
      console.log('OrderForm - Total amount being sent:', finalTotalAmount, 'Type:', typeof finalTotalAmount);
      
      const response = await ordersAPI.createOrder(orderData);
      console.log('OrderForm - Order created successfully:', response.data);
      console.log('OrderForm - Created order total_amount:', response.data.total_amount, 'Type:', typeof response.data.total_amount);
      
      setCreatedOrder(response.data);
      setShowPayment(true);
      
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

  const handlePaymentSuccess = (paymentData) => {
    if (onSuccess) {
      onSuccess({ order: createdOrder, payment: paymentData });
    } else {
      navigate('/payment-success', { 
        state: { payment: paymentData, order: createdOrder } 
      });
    }
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setCreatedOrder(null);
  };

  // Debug: Log price information
  console.log('=== OrderForm Debug Info ===');
  console.log('Service object:', service);
  console.log('Service price:', service?.price, 'Type:', typeof service?.price);
  console.log('Form data:', formData);
  console.log('Form total_amount:', formData.total_amount, 'Type:', typeof formData.total_amount);
  console.log('Form quantity:', formData.quantity, 'Type:', typeof formData.quantity);
  
  // Ensure we have valid prices for display
  const servicePrice = service?.price || 0;
  const quantity = formData.quantity || 1;
  
  // Calculate total amount - always use service price * quantity if service is loaded
  let finalTotalAmount;
  if (service && servicePrice > 0) {
    finalTotalAmount = servicePrice * quantity;
  } else {
    finalTotalAmount = formData.total_amount || 0;
  }
  
  console.log('Calculated prices - Service:', servicePrice, 'Quantity:', quantity, 'Final Total:', finalTotalAmount);
  console.log('Formatted prices - Service:', formatPrice(servicePrice), 'Total:', formatPrice(finalTotalAmount));
  console.log('=== End Debug Info ===');


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

  if (showPayment && createdOrder) {
    return (
      <Payment
        order={createdOrder}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
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
                <span className="meta-value">{formatPrice(servicePrice)}</span>
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

          <div className="buyer-info-section">
            <h3>Contact Information</h3>
            <p className="section-description">
              Please provide your contact details for order processing and delivery.
            </p>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="buyer_name" className="form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="buyer_name"
                  name="buyer_name"
                  value={formData.buyer_name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="buyer_phone" className="form-label">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="buyer_phone"
                  name="buyer_phone"
                  value={formData.buyer_phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="buyer_address" className="form-label">
                Address *
              </label>
              <textarea
                id="buyer_address"
                name="buyer_address"
                value={formData.buyer_address}
                onChange={handleInputChange}
                className="form-textarea"
                rows="3"
                placeholder="Enter your complete address"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="buyer_city" className="form-label">
                  City *
                </label>
                <input
                  type="text"
                  id="buyer_city"
                  name="buyer_city"
                  value={formData.buyer_city}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your city"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="buyer_country" className="form-label">
                  Country *
                </label>
                <input
                  type="text"
                  id="buyer_country"
                  name="buyer_country"
                  value={formData.buyer_country}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your country"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="buyer_postal_code" className="form-label">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="buyer_postal_code"
                  name="buyer_postal_code"
                  value={formData.buyer_postal_code}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter postal/ZIP code"
                />
              </div>
            </div>
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
                <span className="summary-value">{formatPrice(servicePrice)}</span>
              </div>
              <div className="summary-item total">
                <span className="summary-label">Total Amount:</span>
                <span className="summary-value">{formatPrice(finalTotalAmount)}</span>
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
