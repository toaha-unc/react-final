import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Connect with the world's best
              <span className="highlight"> freelancers</span>
            </h1>
            <p className="hero-description">
              Find talented professionals for your projects or showcase your skills 
              to clients worldwide. Join thousands of successful freelancers and 
              businesses on our platform.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-large">
                Start
              </button>
              <button className="btn btn-secondary btn-large">
                Watch Demo
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Active Freelancers</span>
              </div>
              <div className="stat">
                <span className="stat-number">100K+</span>
                <span className="stat-label">Projects Completed</span>
              </div>
              <div className="stat">
                <span className="stat-number">4.9★</span>
                <span className="stat-label">Average Rating</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="card-header">
                <div className="card-avatar"></div>
                <div className="card-info">
                  <h4>Sarah Johnson</h4>
                  <p>UI/UX Designer</p>
                </div>
                <div className="card-rating">★★★★★</div>
              </div>
              <div className="card-content">
                <h3>Modern Website Design</h3>
                <p>Creating stunning, responsive websites that convert visitors into customers.</p>
                <div className="card-tags">
                  <span className="tag">Web Design</span>
                  <span className="tag">UI/UX</span>
                  <span className="tag">Figma</span>
                </div>
                <div className="card-price">$2,500</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
