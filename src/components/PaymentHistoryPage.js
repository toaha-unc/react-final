import React from 'react';
import Header from './Header';
import PaymentHistory from './PaymentHistory';
import './PaymentHistoryPage.css';

const PaymentHistoryPage = () => {
  return (
    <div className="payment-history-page">
      <Header />
      <div className="container">
        <div className="payment-history-header">
          <h1>Payment History</h1>
        </div>
        <PaymentHistory />
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
