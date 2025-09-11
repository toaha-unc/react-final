import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { paymentAPI } from '../services/api';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    payment_method: ''
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchPayments();
    fetchPaymentStats();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.payment_method) params.payment_method = filters.payment_method;
      
      const response = await paymentAPI.getPayments(params);
      setPayments(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to load payment history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const response = await paymentAPI.getPaymentStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      'completed': 'status-completed',
      'pending': 'status-pending',
      'failed': 'status-failed',
      'cancelled': 'status-cancelled',
      'refunded': 'status-refunded',
      'partially_refunded': 'status-partially-refunded'
    };
    return statusClasses[status] || 'status-unknown';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'completed': 'Completed',
      'pending': 'Pending',
      'failed': 'Failed',
      'cancelled': 'Cancelled',
      'refunded': 'Refunded',
      'partially_refunded': 'Partially Refunded'
    };
    return statusTexts[status] || status;
  };

  if (loading) {
    return (
      <div className="payment-history-loading">
        <div className="loading-spinner"></div>
        <p>Loading payment history...</p>
      </div>
    );
  }

  return (
    <div className="payment-history">
      <div className="payment-history-header">
        <h1>Payment History</h1>
        <p>View and manage your payment transactions</p>
      </div>

      {stats && (
        <div className="payment-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total_payments}</div>
            <div className="stat-label">Total Payments</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatPrice(stats.total_amount)}</div>
            <div className="stat-label">Total Amount</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.successful_payments}</div>
            <div className="stat-label">Successful</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.pending_payments}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      )}

      <div className="payment-filters">
        <div className="filter-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="payment_method">Method:</label>
          <select
            id="payment_method"
            name="payment_method"
            value={filters.payment_method}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Methods</option>
            <option value="sslcommerz">SSLCommerz</option>
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="payment-error">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchPayments}>
            Retry
          </button>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="no-payments">
          <h3>No Payments Found</h3>
          <p>You haven't made any payments yet.</p>
        </div>
      ) : (
        <div className="payments-list">
          {payments.map((payment) => (
            <div key={payment.id} className="payment-item">
              <div className="payment-main">
                <div className="payment-info">
                  <div className="payment-id">
                    Payment #{payment.payment_id}
                  </div>
                  <div className="payment-service">
                    {payment.service_title}
                  </div>
                  <div className="payment-order">
                    Order #{payment.order.order_number}
                  </div>
                </div>
                <div className="payment-amount">
                  {formatPrice(payment.amount)}
                </div>
              </div>
              <div className="payment-details">
                <div className="payment-meta">
                  <div className="payment-method">
                    <span className="label">Method:</span>
                    <span className="value">{payment.payment_method}</span>
                  </div>
                  <div className="payment-date">
                    <span className="label">Date:</span>
                    <span className="value">{formatDate(payment.created_at)}</span>
                  </div>
                  <div className="payment-status">
                    <span className={`status ${getStatusClass(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                  </div>
                </div>
                {payment.paid_at && (
                  <div className="payment-paid">
                    Paid on: {formatDate(payment.paid_at)}
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

export default PaymentHistory;
