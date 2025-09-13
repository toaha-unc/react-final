import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentFailed.css';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleTryAgain = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="payment-failed-container">
      <div className="payment-failed-card">
        <div className="failed-icon">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" fill="#EF4444" />
            <path
              d="M15 9l-6 6M9 9l6 6"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        <h1 className="failed-title">Payment Failed</h1>
        <p className="failed-message">
          Unfortunately, your payment could not be processed. This could be due to insufficient funds, incorrect card details, or a technical issue.
        </p>
        
        <div className="failed-details">
          <p>Please try again or contact support if the problem persists.</p>
          <p>Redirecting to homepage in {countdown} seconds...</p>
        </div>
        
        <div className="button-group">
          <button onClick={handleTryAgain} className="try-again-btn">
            Try Again
          </button>
          <button onClick={handleGoHome} className="go-home-btn">
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;