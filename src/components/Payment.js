import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { paymentAPI } from '../services/api';
import { formatPrice, formatDate } from '../utils/formatting';
import './Payment.css';

const Payment = ({ order, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('sslcommerz');
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  useEffect(() => {
    if (order) {
      fetchPaymentMethods();
    }
  }, [order]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await paymentAPI.getPaymentMethods();
      setPaymentMethods(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const fetchSSLCommerzMethods = async (paymentId) => {
    try {
      console.log('Fetching SSLCommerz methods for payment ID:', paymentId);
      const response = await paymentAPI.getSSLCommerzMethods(paymentId);
      console.log('SSLCommerz methods response:', response.data);
      
      if (response.data.payment_methods) {
        setPaymentMethods(response.data.payment_methods);
        setShowPaymentMethods(true);
      } else {
        console.error('No payment methods found in response:', response.data);
        setError('No payment methods available. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching SSLCommerz payment methods:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Failed to load payment methods. Please try again.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 404) {
        errorMessage = 'Payment not found. Please try again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You are not authorized to view this payment.';
      }
      
      setError(errorMessage);
    }
  };

  const handlePaymentInitiation = async () => {
    if (!order) {
      setError('No order selected for payment');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await paymentAPI.initiatePayment(order.id);
      const data = response.data;

      console.log('Payment initiation response:', data);

      if (data.redirect_url) {
        // Store payment data and fetch SSLCommerz methods
        setPaymentData(data);
        console.log('Payment data stored, redirect URL:', data.redirect_url);
        
        if (data.payment_uuid) {
          await fetchSSLCommerzMethods(data.payment_uuid);
        } else {
          console.error('No payment UUID found in response:', data);
          setError('Payment initialization failed. Please try again.');
        }
      } else {
        console.warn('No redirect URL in payment response:', data);
        setPaymentData(data);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Failed to initiate payment. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = 'Payment service not available. Please try again later.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You are not authorized to make this payment.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid payment request. Please check your order details.';
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelect = (methodType, methodKey, gateway = null) => {
    setSelectedMethod(methodType);
    setSelectedGateway(gateway);
  };

  const handleProceedToPayment = () => {
    if (paymentData && paymentData.redirect_url) {
      // Check if it's a direct SSLCommerz URL or a Django redirect URL
      if (paymentData.redirect_url.includes('sslcommerz.com')) {
        // Direct SSLCommerz URL - redirect immediately
        console.log('Redirecting to SSLCommerz:', paymentData.redirect_url);
        window.location.href = paymentData.redirect_url;
      } else {
        // Django redirect URL - open in new window to handle form submission
        console.log('Opening payment redirect in new window:', paymentData.redirect_url);
        window.open(paymentData.redirect_url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
      }
    } else {
      console.error('No redirect URL available');
      setError('Payment redirect URL not available. Please try again.');
    }
  };


  // Test order data API call
  const testOrderData = async () => {
    try {
      const response = await fetch(`https://django-final.vercel.app/api/orders/${order.id}/test-data/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Order data from API:', data);
    } catch (error) {
      console.error('Error fetching order data:', error);
    }
  };
  
  // Call test function when component mounts
  useEffect(() => {
    if (order && order.id) {
      testOrderData();
    }
  }, [order]);

  // Debug: Log order details
  console.log('Order object:', order);
  console.log('Order total_amount:', order.total_amount, 'Type:', typeof order.total_amount);
  console.log('Order service price:', order.service?.price, 'Type:', typeof order.service?.price);
  
  // Ensure we have a valid price for display
  const displayPrice = order.total_amount || order.service?.price || 0;
  console.log('Display price:', displayPrice, 'Type:', typeof displayPrice);
  console.log('Formatted price:', formatPrice(displayPrice));

  if (!order) {
    return (
      <div className="payment-error">
        <h3>No Order Selected</h3>
        <p>Please select an order to proceed with payment.</p>
        <button className="btn btn-primary" onClick={onCancel}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="payment">
      <div className="payment-header">
        <h1>Payment</h1>
        <p>Complete your payment for order #{order.order_number}</p>
      </div>

      <div className="payment-content">
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-card">
            <div className="summary-item">
              <span className="label">Service:</span>
              <span className="value">{order.service?.title || 'Service'}</span>
            </div>
            <div className="summary-item">
              <span className="label">Order Date:</span>
              <span className="value">{formatDate(order.placed_at)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Seller:</span>
              <span className="value">
                {order.seller?.first_name} {order.seller?.last_name}
              </span>
            </div>
            <div className="summary-item total">
              <span className="label">Total Amount:</span>
              <span className="value">{formatPrice(displayPrice)}</span>
            </div>
          </div>
        </div>

        <div className="payment-methods">
          <h3>Payment Method</h3>
          <div className="method-options">
            <div className="method-option">
              <input
                type="radio"
                id="sslcommerz"
                name="paymentMethod"
                value="sslcommerz"
                checked={selectedMethod === 'sslcommerz'}
                onChange={(e) => setSelectedMethod(e.target.value)}
              />
              <label htmlFor="sslcommerz">
                <div className="method-info">
                  <div className="method-name">SSLCommerz</div>
                  <div className="method-description">Credit/Debit Card, Mobile Banking, Bank Transfer</div>
                </div>
              </label>
            </div>
          </div>

          {showPaymentMethods && paymentMethods && (
            <div className="sslcommerz-methods">
              <h4>Choose Payment Option</h4>
              
              {/* Card Payments */}
              {paymentMethods.cards && (
                <div className="method-category">
                  <h5>Credit/Debit Cards</h5>
                  <div className="method-grid">
                    {Object.entries(paymentMethods.cards).map(([key, method]) => (
                      <div key={key} className="method-card">
                        <input
                          type="radio"
                          id={`card-${key}`}
                          name="paymentGateway"
                          value={key}
                          checked={selectedGateway === key}
                          onChange={() => handlePaymentMethodSelect('card', key, method.gateways[0])}
                        />
                        <label htmlFor={`card-${key}`}>
                          <img src={method.logo} alt={method.name} className="method-logo" />
                          <span className="method-name">{method.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Banking */}
              {paymentMethods.mobile_banking && (
                <div className="method-category">
                  <h5>Mobile Banking</h5>
                  <div className="method-grid">
                    {Object.entries(paymentMethods.mobile_banking).map(([key, method]) => (
                      <div key={key} className="method-card">
                        <input
                          type="radio"
                          id={`mobile-${key}`}
                          name="paymentGateway"
                          value={key}
                          checked={selectedGateway === key}
                          onChange={() => handlePaymentMethodSelect('mobile', key, method.gateway)}
                        />
                        <label htmlFor={`mobile-${key}`}>
                          <img src={method.logo} alt={method.name} className="method-logo" />
                          <span className="method-name">{method.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Internet Banking */}
              {paymentMethods.internet_banking && (
                <div className="method-category">
                  <h5>Internet Banking</h5>
                  <div className="method-grid">
                    {Object.entries(paymentMethods.internet_banking).map(([key, method]) => (
                      <div key={key} className="method-card">
                        <input
                          type="radio"
                          id={`internet-${key}`}
                          name="paymentGateway"
                          value={key}
                          checked={selectedGateway === key}
                          onChange={() => handlePaymentMethodSelect('internet', key, method.gateway)}
                        />
                        <label htmlFor={`internet-${key}`}>
                          <img src={method.logo} alt={method.name} className="method-logo" />
                          <span className="method-name">{method.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="payment-error">
            <p>{error}</p>
          </div>
        )}

        <div className="payment-actions">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          {!showPaymentMethods ? (
            <button
              className="btn btn-primary"
              onClick={handlePaymentInitiation}
              disabled={loading || !selectedMethod}
            >
              {loading ? 'Processing...' : `Pay ${formatPrice(displayPrice)}`}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleProceedToPayment}
              disabled={loading || !selectedGateway}
            >
              {loading ? 'Processing...' : `Proceed to Payment - ${formatPrice(displayPrice)}`}
            </button>
          )}
        </div>

        {paymentData && (
          <div className="payment-data">
            <h4>Payment Information</h4>
            <p>Payment ID: {paymentData.payment_id}</p>
            {!showPaymentMethods && (
              <div>
                <p>Please complete the payment using the provided link.</p>
                <button 
                  className="btn btn-primary" 
                  onClick={handleProceedToPayment}
                  style={{ marginTop: '1rem' }}
                >
                  Proceed to Payment Gateway
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
