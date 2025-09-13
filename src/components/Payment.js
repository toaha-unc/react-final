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
        // Store payment data
        setPaymentData(data);
        console.log('Payment data stored, redirect URL:', data.redirect_url);
        
        // Redirect directly to SSLCommerz payment page
        console.log('Redirecting to SSLCommerz payment page...');
        window.location.href = data.redirect_url;
      } else {
        console.error('No redirect URL in payment response:', data);
        setError('Payment initialization failed. Please try again.');
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
            <div className="method-option selected">
              <div className="method-info">
                <div className="method-name">SSLCommerz</div>
                <div className="method-description">Credit/Debit Card, Mobile Banking, Bank Transfer</div>
                <div className="method-features">
                  <span className="feature">✓ Secure Payment</span>
                  <span className="feature">✓ Multiple Options</span>
                  <span className="feature">✓ Instant Processing</span>
                </div>
              </div>
            </div>
          </div>
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
          <button
            className="btn btn-primary"
            onClick={handlePaymentInitiation}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Pay ${formatPrice(displayPrice)}`}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Payment;
