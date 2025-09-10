import React from 'react';
import './CTA.css';

const CTA = () => {
  return (
    <section className="cta section">
      <div className="container">
        <div className="cta-content">
          <div className="cta-text">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-description">
              Join thousands of successful freelancers and businesses who trust FreelanceWork 
              for their projects. Start your journey today and experience the difference.
            </p>
            <div className="cta-actions">
              <button className="btn btn-primary btn-large">
                Start
              </button>
              <button className="btn btn-secondary btn-large">
                Become a Freelancer
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
                <input type="email" placeholder="Enter your email" className="form-input" />
                <input type="password" placeholder="Create a password" className="form-input" />
                <button className="form-btn">Sign Up Free</button>
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
