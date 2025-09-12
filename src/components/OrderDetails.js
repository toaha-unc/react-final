import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI, paymentAPI } from '../services/api';
import OrderStatus from './OrderStatus';
import Payment from './Payment';
import './OrderDetails.css';

const OrderDetails = ({ orderId, onBack, onEdit }) => {
  const { user, isSeller, isBuyer } = useAuth();
  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [payments, setPayments] = useState([]);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
      fetchMessages();
      fetchFiles();
      fetchPayments();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersAPI.getOrder(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await ordersAPI.getOrderMessages(orderId);
      const messagesData = response.data?.results || response.data || [];
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await ordersAPI.getOrderFiles(orderId);
      const filesData = response.data?.results || response.data || [];
      setFiles(Array.isArray(filesData) ? filesData : []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await paymentAPI.getPayments({ order: orderId });
      const paymentsData = response.data?.results || response.data || [];
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSendingMessage(true);
      await ordersAPI.createOrderMessage(orderId, {
        message: newMessage.trim()
      });
      setNewMessage('');
      fetchMessages(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', file.name);
      
      await ordersAPI.uploadOrderFile(orderId, formData);
      fetchFiles(); // Refresh files
      e.target.value = ''; // Clear file input
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await ordersAPI.updateOrder(orderId, { status: newStatus });
      fetchOrderDetails(); // Refresh order details
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="order-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-error">
        <h3>Error Loading Order</h3>
        <p>{error || 'Order not found'}</p>
        <button className="btn btn-primary" onClick={onBack}>
          Go Back
        </button>
      </div>
    );
  }

  const isOwner = (isSeller && user?.id === order.seller?.id) || 
                  (isBuyer && user?.id === order.buyer?.id);

  if (showPayment) {
    return (
      <Payment
        order={order}
        onSuccess={() => {
          setShowPayment(false);
          fetchOrderDetails();
          fetchPayments();
        }}
        onCancel={() => setShowPayment(false)}
      />
    );
  }

  return (
    <div className="order-details">
      <div className="order-details-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Orders
        </button>
        
      </div>

      <div className="order-details-content">
        <div className="order-main">
          <div className="order-header">
            <div className="order-title-section">
              <h1 className="order-title">
                {order.service?.title || 'Service Order'}
              </h1>
              <p className="order-id">Order #{order.id}</p>
            </div>
            <div className="order-status-section">
              <OrderStatus 
                status={order.status} 
                onStatusChange={handleStatusChange}
                canEdit={isSeller}
              />
            </div>
          </div>

          <div className="order-info-grid">
            <div className="info-card">
              <h3>Order Information</h3>
              <div className="info-items">
                <div className="info-item">
                  <span className="info-label">Order Date:</span>
                  <span className="info-value">{formatDate(order.created_at)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total Amount:</span>
                  <span className="info-value">{formatPrice(order.total_amount)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Quantity:</span>
                  <span className="info-value">{order.quantity}</span>
                </div>
                {order.delivery_date && (
                  <div className="info-item">
                    <span className="info-label">Delivery Date:</span>
                    <span className="info-value">{formatDate(order.delivery_date)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="info-card">
              <h3>
                {isSeller ? 'Buyer Information' : 'Seller Information'}
              </h3>
              <div className="info-items">
                {isSeller && order.buyer && (
                  <>
                    <div className="info-item">
                      <span className="info-label">Name:</span>
                      <span className="info-value">
                        {order.buyer.first_name} {order.buyer.last_name}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{order.buyer.email}</span>
                    </div>
                  </>
                )}
                {isBuyer && order.seller && (
                  <>
                    <div className="info-item">
                      <span className="info-label">Name:</span>
                      <span className="info-value">
                        {order.seller.first_name} {order.seller.last_name}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{order.seller.email}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {order.requirements && (
            <div className="requirements-section">
              <h3>Project Requirements</h3>
              <div className="requirements-content">
                <p>{order.requirements}</p>
              </div>
            </div>
          )}

          {isSeller && order.buyer_name && (
            <div className="buyer-contact-section">
              <h3>Buyer Contact Information</h3>
              <div className="contact-info-grid">
                <div className="contact-item">
                  <span className="contact-label">Full Name:</span>
                  <span className="contact-value">{order.buyer_name}</span>
                </div>
                {order.buyer_phone && (
                  <div className="contact-item">
                    <span className="contact-label">Phone:</span>
                    <span className="contact-value">{order.buyer_phone}</span>
                  </div>
                )}
                {order.buyer_address && (
                  <div className="contact-item">
                    <span className="contact-label">Address:</span>
                    <span className="contact-value">{order.buyer_address}</span>
                  </div>
                )}
                {order.buyer_city && (
                  <div className="contact-item">
                    <span className="contact-label">City:</span>
                    <span className="contact-value">{order.buyer_city}</span>
                  </div>
                )}
                {order.buyer_country && (
                  <div className="contact-item">
                    <span className="contact-label">Country:</span>
                    <span className="contact-value">{order.buyer_country}</span>
                  </div>
                )}
                {order.buyer_postal_code && (
                  <div className="contact-item">
                    <span className="contact-label">Postal Code:</span>
                    <span className="contact-value">{order.buyer_postal_code}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="communication-section">
            <h3>Communication</h3>
            
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="messages-list">
                  {messages.map((message) => (
                    <div key={message.id} className={`message ${message.sender?.id === user?.id ? 'own' : 'other'}`}>
                      <div className="message-header">
                        <span className="sender-name">
                          {message.sender?.first_name} {message.sender?.last_name}
                        </span>
                        <span className="message-date">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                      <div className="message-content">
                        <p>{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="message-form">
              <div className="message-input-group">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="message-input"
                  rows="3"
                  disabled={sendingMessage}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={sendingMessage || !newMessage.trim()}
                >
                  {sendingMessage ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>

          <div className="payment-section">
            <h3>Payment Information</h3>
            
            {!order.is_paid && isBuyer && (
              <div className="payment-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowPayment(true)}
                >
                  Pay Now
                </button>
              </div>
            )}

            {payments.length === 0 ? (
              <div className="no-payments">
                <p>No payments found for this order.</p>
              </div>
            ) : (
              <div className="payments-list">
                {payments.map((payment) => (
                  <div key={payment.id} className="payment-item">
                    <div className="payment-info">
                      <div className="payment-id">Payment #{payment.payment_id}</div>
                      <div className="payment-amount">{formatPrice(payment.amount)}</div>
                      <div className="payment-method">{payment.payment_method}</div>
                      <div className={`payment-status status-${payment.status}`}>
                        {payment.status_display}
                      </div>
                      <div className="payment-date">{formatDate(payment.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="files-section">
            <h3>Files</h3>
            
            <div className="file-upload">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileUpload}
                disabled={uploadingFile}
                className="file-input"
              />
              <label htmlFor="file-upload" className="file-upload-label">
                {uploadingFile ? 'Uploading...' : 'Upload File'}
              </label>
            </div>

            {files.length === 0 ? (
              <div className="no-files">
                <p>No files uploaded yet.</p>
              </div>
            ) : (
              <div className="files-list">
                {files.map((file) => (
                  <div key={file.id} className="file-item">
                    <div className="file-info">
                      <span className="file-name">{file.description || file.file_name}</span>
                      <span className="file-date">{formatDate(file.created_at)}</span>
                    </div>
                    <a 
                      href={file.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
