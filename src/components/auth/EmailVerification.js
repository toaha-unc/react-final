import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../Header';
import './Auth.css';

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification, error, clearError } = useAuth();
  
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token) {
      handleVerification();
    }
  }, [token]);

  const handleVerification = async () => {
    try {
      setVerificationStatus('verifying');
      clearError();
      
      const result = await verifyEmail(token);
      
      if (result.success) {
        setVerificationStatus('success');
        setMessage(result.data.message || 'Email verified successfully! You can now log in.');
      } else {
        setVerificationStatus('error');
        setMessage(result.error || 'Email verification failed.');
      }
    } catch (error) {
      setVerificationStatus('error');
      setMessage('An unexpected error occurred during verification.');
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }

    setIsResending(true);
    const result = await resendVerification(email);
    
    if (result.success) {
      setMessage('Verification email sent successfully! Please check your inbox.');
    } else {
      setMessage(result.error || 'Failed to resend verification email.');
    }
    
    setIsResending(false);
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <div className="verification-content">
            <div className="loading-spinner"></div>
            <h1>Verifying Your Email</h1>
            <p>Please wait while we verify your email address...</p>
          </div>
        );

      case 'success':
        return (
          <div className="verification-content">
            <div className="success-icon">✓</div>
            <h1>Email Verified!</h1>
            <p>{message}</p>
            <div className="verification-actions">
              <Link to="/login" className="btn btn-primary">
                Go to Login
              </Link>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="verification-content">
            <div className="error-icon">✗</div>
            <h1>Verification Failed</h1>
            <p>{message}</p>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="resend-verification">
              <h3>Resend Verification Email</h3>
              <form onSubmit={handleResendVerification}>
                <div className="form-group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    disabled={isResending}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={isResending}
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </form>
            </div>

            <div className="verification-actions">
              <Link to="/login" className="btn btn-primary">
                Go to Login
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Register New Account
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="auth-page">
      <Header />
      <div className="auth-container">
        <div className="auth-card">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
