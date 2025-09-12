import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CTA.css';

const CTA = () => {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate('/login');
  };

  const handleSignUpClick = () => {
    navigate('/register');
  };

  const scrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="cta section">
      <div className="container">
        <div className="cta-content">
          <div className="cta-text">
            <h2 className="cta-title">Ready to Sign Up?</h2>
            <p className="cta-description">
              Join thousands of successful freelancers and businesses who trust FreelanceWork 
              for their projects. Start your journey today and experience the difference.
            </p>
            <div className="cta-actions">
              <button className="btn btn-primary btn-large" onClick={handleStartClick}>
                Start
              </button>
              <button className="btn btn-secondary btn-large" onClick={scrollToServices}>
                Browse Services
              </button>
            </div>
          </div>
          <div className="cta-visual">
            <div className="cta-card">
              <div className="card-header">
                <h3>Join FreelanceWork Today</h3>
                <p>Create your account in minutes</p>
              </div>
              <div className="card-form">
                <button className="form-btn" onClick={handleSignUpClick}>Sign Up</button>
              </div>
              <div className="card-footer">
                <p>Already have an account? <a href="#login">Sign in</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
