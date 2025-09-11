import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentAPI } from '../services/api';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const orderId = searchParams.get('order_id');
    
    if (paymentId) {
      fetchPaymentDetails(paymentId);
    } else if (orderId) {
      // If we have order ID, we can fetch the latest payment for that order
      fetchOrderPayment(orderId);
    } else {
      setError('No payment information found');
      setLoading(false);
    }
  }, [searchParams]);

  const fetchPaymentDetails = async (paymentId) => {
    try {
      setLoading(true);
      const response = await paymentAPI.getPayment(paymentId);
      setPayment(response.data);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      setError('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderPayment = async (orderId) => {
    try {
      setLoading(true);
      const response = await paymentAPI.getPayments({ order: orderId });
      const payments = response.data.results || response.data || [];
      if (payments.length > 0) {
        setPayment(payments[0]);
      } else {
        setError('No payment found for this order');
      }
    } catch (error) {
      console.error('Error fetching order payment:', error);
      setError('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
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

  const handleViewOrder = () => {
    if (payment?.order?.id) {
      navigate(`/orders/${payment.order.id}`);
    } else {
      navigate('/orders');
    }
  };

  const handleViewPayments = () => {
    navigate('/payments');
  };

  if (loading) {
    return (
      <div className="payment-success-loading">
        <div className="loading-spinner"></div>
        <p>Processing your payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-success-error">
        <div className="error-icon">⚠️</div>
        <h2>Payment Error</h2>
        <p>{error}</p>
        <div className="error-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Go Home
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/orders')}>
            View Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success">
      <div className="success-header">
        <div className="success-icon">✅</div>
        <h1>Payment Successful!</h1>
        <p>Your payment has been processed successfully.</p>
      </div>

      {payment && (
        <div className="payment-details">
          <div className="details-card">
            <h3>Payment Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Payment ID:</span>
                <span className="value">{payment.payment_id}</span>
              </div>
              <div className="detail-item">
                <span className="label">Amount:</span>
                <span className="value amount">{formatPrice(payment.amount)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Payment Method:</span>
                <span className="value">{payment.payment_method}</span>
              </div>
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className={`value status status-${payment.status}`}>
                  {payment.status_display}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Payment Date:</span>
                <span className="value">{formatDate(payment.paid_at || payment.created_at)}</span>
              </div>
            </div>
          </div>

          {payment.order && (
            <div className="order-details">
              <h3>Order Information</h3>
              <div className="order-card">
                <div className="order-info">
                  <div className="order-title">{payment.order.service_title}</div>
                  <div className="order-number">Order #{payment.order.order_number}</div>
                  <div className="order-amount">{formatPrice(payment.order.total_amount)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="success-actions">
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          Continue Shopping
        </button>
        <button className="btn btn-primary" onClick={handleViewOrder}>
          View Order
        </button>
        <button className="btn btn-outline" onClick={handleViewPayments}>
          Payment History
        </button>
      </div>

      <div className="success-message">
        <p>
          Thank you for your payment! You will receive a confirmation email shortly. 
          The seller has been notified and will begin working on your order.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
