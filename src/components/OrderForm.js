import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { servicesAPI, ordersAPI, paymentAPI } from '../services/api';
import { formatPrice } from '../utils/formatting';
import Header from './Header';
import './OrderForm.css';

const OrderForm = ({ onSuccess, onCancel }) => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  console.log('OrderForm - Component rendered');
  console.log('OrderForm - serviceId from useParams:', serviceId);
  console.log('OrderForm - window.location.pathname:', window.location.pathname);
  console.log('OrderForm - user from useAuth:', user);
  console.log('OrderForm - localStorage access_token:', localStorage.getItem('access_token'));
  console.log('OrderForm - localStorage user_data:', localStorage.getItem('user_data'));
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [orderError, setOrderError] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
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
    console.log('OrderForm - useEffect triggered');
    console.log('OrderForm - serviceId:', serviceId);
    console.log('OrderForm - user:', user);
    console.log('OrderForm - user authenticated:', !!user);
    
    if (!serviceId) {
      console.error('OrderForm - No serviceId provided');
      setError('No service ID provided');
      setLoading(false);
      return;
    }
    
    if (!user) {
      console.error('OrderForm - User not authenticated');
      setError('Please log in to place an order');
      setLoading(false);
      return;
    }
    
    fetchService();
  }, [serviceId, user]);

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
      console.log('ServiceId type:', typeof serviceId);
      console.log('Full URL:', `https://django-final.vercel.app/api/services/${serviceId}/`);
      
      // Check if serviceId is valid
      if (!serviceId) {
        throw new Error('No service ID provided');
      }
      
      console.log('OrderForm - About to make API call to servicesAPI.getService');
      
      // Try to make the API call with better error handling
      let response;
      try {
        console.log('OrderForm - Attempting API call with axios');
        response = await servicesAPI.getService(serviceId);
        console.log('OrderForm - Axios API call succeeded');
      } catch (axiosError) {
        console.log('OrderForm - Axios failed, trying direct fetch:', axiosError.message);
        
        try {
          // Try direct fetch as fallback
          const fetchResponse = await fetch(`https://django-final.vercel.app/api/services/${serviceId}/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            mode: 'cors', // Explicitly set CORS mode
          });
          
          if (!fetchResponse.ok) {
            throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
          }
          
          const data = await fetchResponse.json();
          response = { data, status: fetchResponse.status, headers: {} };
          console.log('OrderForm - Direct fetch succeeded');
        } catch (fetchError) {
          console.log('OrderForm - Direct fetch also failed:', fetchError.message);
          
          // If both fail, try to provide a helpful error message
          if (fetchError.message.includes('CORS') || fetchError.message.includes('cors')) {
            throw new Error('CORS policy blocked the request. Please try again or contact support.');
          } else if (fetchError.message.includes('Network')) {
            throw new Error('Network error. Please check your internet connection.');
          } else {
            throw new Error(`Failed to load service: ${fetchError.message}`);
          }
        }
      }
      
      console.log('OrderForm - API call completed successfully');
      console.log('API Response:', response);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
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
      
      let errorMessage = 'Failed to load service details';
      
      if (error.response?.status === 404) {
        errorMessage = 'Service not found';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Please log in again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message.includes('Network Error') || error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS error. Please try again.';
      } else {
        errorMessage = `Failed to load service details: ${error.message}`;
      }
      
      console.error('Setting error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const retryFetchService = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    fetchService();
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
      setOrderError('Please login to place an order');
      return;
    }
    
    if (!localStorage.getItem('access_token')) {
      setOrderError('Authentication token not found. Please login again.');
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
      setOrderError(null);
      
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
      console.log('OrderForm - User authentication status:', !!user);
      console.log('OrderForm - User object:', user);
      console.log('OrderForm - Access token available:', !!localStorage.getItem('access_token'));
      console.log('OrderForm - Access token value:', localStorage.getItem('access_token'));
      console.log('OrderForm - User data from localStorage:', localStorage.getItem('user_data'));
      
      const response = await ordersAPI.createOrder(orderData);
      console.log('OrderForm - Order created successfully:', response.data);
      console.log('OrderForm - Created order total_amount:', response.data.total_amount, 'Type:', typeof response.data.total_amount);
      console.log('OrderForm - Created order ID:', response.data.id);
      console.log('OrderForm - Order creation response status:', response.status);
      console.log('OrderForm - Order creation response headers:', response.headers);
      
      if (!response.data) {
        throw new Error('Order creation failed: No response data');
      }
      
      // Handle case where backend doesn't return id field yet
      if (!response.data.id) {
        console.warn('Order created but no ID returned from backend. This may be a backend issue.');
        console.log('Full response data:', response.data);
        
        // Try to get the order ID from the response headers or create a temporary one
        const orderId = response.headers['x-order-id'] || response.data.service || 'temp-order-id';
        console.log('Using order ID:', orderId);
        
        // Create a temporary order object with the available data
        const tempOrder = {
          id: orderId,
          service: response.data.service,
          total_amount: finalTotalAmount,
          ...response.data
        };
        
        setCreatedOrder(tempOrder);
        setOrderError(null);
        
        // Try to initiate payment with the temporary order
        console.log('Attempting payment with temporary order:', tempOrder);
        await initiatePaymentDirectly(tempOrder);
        return;
      }
      
      setCreatedOrder(response.data);
      setOrderError(null); // Clear any previous order errors
      
      // Directly initiate payment after order creation
      console.log('OrderForm - About to initiate payment for order:', response.data.id);
      await initiatePaymentDirectly(response.data);
      
    } catch (error) {
      console.error('Error creating order:', error);
      console.error('Order creation error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Please log in again to place an order.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || 'Invalid order data. Please check your information.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      console.error('Setting order creation error message:', errorMessage);
      setOrderError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const submitSSLCommerzForm = (url, formData) => {
    // Create a form element
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    form.target = '_self';
    
    // Add all form data as hidden inputs
    Object.keys(formData).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = formData[key];
      form.appendChild(input);
    });
    
    // Add form to document and submit
    document.body.appendChild(form);
    form.submit();
    
    // Clean up
    document.body.removeChild(form);
  };

  const initiatePaymentDirectly = async (order) => {
    try {
      console.log('OrderForm - Initiating payment directly for order:', order.id);
      console.log('OrderForm - Order data:', order);
      console.log('OrderForm - Payment API URL:', `https://django-final.vercel.app/api/payments/initiate/${order.id}/`);
      console.log('OrderForm - Authentication token for payment:', localStorage.getItem('access_token'));
      
      const response = await paymentAPI.initiatePayment(order.id);
      console.log('OrderForm - Payment initiation response:', response);
      console.log('OrderForm - Payment response status:', response.status);
      console.log('OrderForm - Payment response headers:', response.headers);
      
      const data = response.data;

      console.log('Payment initiation response:', data);

      if (data.redirect_url) {
        console.log('Payment data received, redirect URL:', data.redirect_url);
        
        // For testing, redirect directly to success page
        // In production, you would redirect to SSLCommerz payment page
        console.log('Redirecting to payment success page for testing...');
        window.location.href = 'http://localhost:3000/payment-success';
      } else {
        console.error('No redirect URL in payment response:', data);
        setError('Payment initialization failed. Please try again.');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      let errorMessage = 'Failed to initiate payment. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Please log in again to continue with payment.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Order not found. Please try placing the order again.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || 'Invalid order data. Please check your information.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Payment service temporarily unavailable. Please try again later.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setOrderError(errorMessage);
    }
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
  console.log('User authentication - User:', !!user, 'Token:', !!localStorage.getItem('access_token'));
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
    console.log('OrderForm - Rendering service error state:', { error, service, loading });
    return (
      <div className="order-form-error">
        <h3>Error Loading Service</h3>
        <p>{error || 'Service not found'}</p>
        <div className="error-actions">
          <button className="btn btn-primary" onClick={retryFetchService} disabled={loading}>
            {loading ? 'Retrying...' : 'Try Again'}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
        {retryCount > 0 && (
          <p className="retry-info">Retry attempt: {retryCount}</p>
        )}
        <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
          <p>Debug Info:</p>
          <p>Service Error: {JSON.stringify(error)}</p>
          <p>Service: {service ? 'Loaded' : 'Not loaded'}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
        </div>
      </div>
    );
  }


  return (
    <div className="order-form">
      <Header />
      
      {orderError && (
        <div className="order-form-error" style={{ margin: '20px', padding: '15px' }}>
          <h3>Order Error</h3>
          <p>{orderError}</p>
          <div className="error-actions">
            <button className="btn btn-primary" onClick={() => setOrderError(null)}>
              Dismiss
            </button>
            {orderError.includes('login') && (
              <button className="btn btn-secondary" onClick={() => navigate('/login')}>
                Go to Login
              </button>
            )}
          </div>
        </div>
      )}
      <div className="order-form-header">
        <h1>Place Order</h1>
        <p>Complete your order for: <strong>{service.title}</strong></p>
        {!user && (
          <div style={{ backgroundColor: '#fff3cd', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
            <strong>⚠️ Authentication Required:</strong> Please login to place an order.
            <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ marginLeft: '10px' }}>
              Login
            </button>
          </div>
        )}
        
        {user && !localStorage.getItem('access_token') && (
          <div style={{ backgroundColor: '#f8d7da', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
            <strong>⚠️ Token Missing:</strong> You are logged in but the authentication token is missing. Please login again.
            <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ marginLeft: '10px' }}>
              Login Again
            </button>
          </div>
        )}
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
                  Phone # *
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
              {submitting ? 'Processing Payment...' : 'Place Order & Pay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
