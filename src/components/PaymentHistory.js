import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { paymentAPI } from '../services/api';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const { user, isSeller, isBuyer } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
    totalCount: 0
  });

  useEffect(() => {
    fetchPayments();
    fetchPaymentStats();
  }, [pagination.currentPage]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.currentPage,
        page_size: 50 // Show 50 payments per page
      };
      
      console.log('Fetching payments with params:', params);
      console.log('User role:', isSeller ? 'seller' : 'buyer');
      
      let response;
      if (isSeller) {
        response = await paymentAPI.getSellerPaymentHistory(params);
      } else {
        response = await paymentAPI.getBuyerPaymentHistory(params);
      }
      
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      const data = response.data;
      const paymentsList = data.results || data || [];
      
      console.log('Payments list:', paymentsList);
      console.log('Payments count:', paymentsList.length);
      
      setPayments(paymentsList);
      
      // Update pagination info - handle both paginated and non-paginated responses
      const totalCount = data.count || paymentsList.length;
      const totalPages = data.count ? Math.ceil(data.count / 50) : 1;
      
      console.log('Total count:', totalCount);
      console.log('Total pages:', totalPages);
      console.log('Current page:', pagination.currentPage);
      console.log('Data next:', data.next);
      console.log('Data previous:', data.previous);
      
      // Calculate pagination state based on current page and total pages
      const hasNext = pagination.currentPage < totalPages;
      const hasPrevious = pagination.currentPage > 1;
      
      console.log('Calculated hasNext:', hasNext);
      console.log('Calculated hasPrevious:', hasPrevious);
      
      setPagination(prev => ({
        ...prev,
        totalPages: totalPages,
        hasNext: hasNext,
        hasPrevious: hasPrevious,
        totalCount: totalCount
      }));
    } catch (error) {
      console.error('Error fetching payments:', error);
      console.error('Error response:', error.response);
      setError(`Failed to load payment history: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      let response;
      if (isSeller) {
        response = await paymentAPI.getSellerPaymentStats();
      } else {
        response = await paymentAPI.getBuyerPaymentStats();
      }
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching payment stats:', error);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'completed': 'Completed',
      'pending': 'Pending',
      'confirmed': 'Pending',
      'in_progress': 'In Progress',
      'review': 'In Review',
      'cancelled': 'Cancelled',
      'disputed': 'Disputed'
    };
    return statusTexts[status] || status;
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      'completed': 'status-completed',
      'pending': 'status-pending',
      'confirmed': 'status-pending',
      'in_progress': 'status-in-progress',
      'review': 'status-review',
      'cancelled': 'status-cancelled',
      'disputed': 'status-disputed'
    };
    return statusClasses[status] || 'status-unknown';
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
            <div className="stat-value">{isSeller ? stats.total_orders : stats.total_payments}</div>
            <div className="stat-label">{isSeller ? 'Total Orders' : 'Total Payments'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatPrice(isSeller ? stats.total_earnings : stats.total_amount)}</div>
            <div className="stat-label">{isSeller ? 'Total Earnings' : 'Total Amount'}</div>
          </div>
          {isSeller ? (
            <>
              <div className="stat-card">
                <div className="stat-value">{formatPrice(stats.net_earnings)}</div>
                <div className="stat-label">Net Earnings</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{formatPrice(stats.platform_fees)}</div>
                <div className="stat-label">Platform Fees</div>
              </div>
            </>
          ) : (
            <>
              <div className="stat-card">
                <div className="stat-value">{stats.successful_payments}</div>
                <div className="stat-label">Successful</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.pending_payments}</div>
                <div className="stat-label">Pending</div>
              </div>
            </>
          )}
        </div>
      )}


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
          <p>
            {isSeller 
              ? "You haven't received any payments yet. Payments will appear here once buyers complete their orders."
              : "You haven't made any payments yet. Payments will appear here once you complete an order."
            }
          </p>
          <div className="no-payments-help">
            <p><strong>Note:</strong> Only paid orders appear in payment history.</p>
            {!isSeller && (
              <p>To make a payment, browse services and place an order.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="payments-list">
          {payments.map((order) => (
            <div key={order.id} className="payment-item">
              <div className="payment-header">
                <div className="payment-title">
                  <h3>Order #{order.order_number}</h3>
                  <span className={`status ${getStatusClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="payment-amount">
                  {formatPrice(order.total_amount)}
                </div>
              </div>
              
              <div className="payment-content">
                <div className="service-info">
                  <h4>{order.service.title}</h4>
                  <p className="service-category">{order.service.category}</p>
                </div>
                
                <div className="user-info">
                  {isSeller ? (
                    <div className="buyer-info">
                      <strong>Buyer:</strong> {order.buyer.first_name} {order.buyer.last_name}
                    </div>
                  ) : (
                    <div className="seller-info">
                      <strong>Seller:</strong> {order.seller.first_name} {order.seller.last_name}
                    </div>
                  )}
                </div>
                
                <div className="payment-meta">
                  <div className="meta-item">
                    <span className="label">Payment Method:</span>
                    <span className="value">{order.payment_method || 'N/A'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Order Date:</span>
                    <span className="value">{formatDate(order.placed_at)}</span>
                  </div>
                  {order.confirmed_at && (
                    <div className="meta-item">
                      <span className="label">Confirmed:</span>
                      <span className="value">{formatDate(order.confirmed_at)}</span>
                    </div>
                  )}
                  {order.completed_at && (
                    <div className="meta-item">
                      <span className="label">Completed:</span>
                      <span className="value">{formatDate(order.completed_at)}</span>
                    </div>
                  )}
                </div>
                
                {isSeller && (
                  <div className="payment-earnings">
                    <div className="earnings-item">
                      <span className="label">Net Earnings:</span>
                      <span className="value">{formatPrice(order.total_amount * 0.9)}</span>
                    </div>
                    <div className="fee-note">After 10% platform fee</div>
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
