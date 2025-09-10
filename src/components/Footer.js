import React from 'react';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import './Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">FreelanceWork</h3>
            <p className="footer-description">
              Connecting talented freelancers with businesses worldwide. 
              Your success is our mission.
            </p>
            <div className="footer-contact">
              <div className="contact-item">
                <EnvelopeIcon className="contact-icon" />
                <span>hello@freelancework.com</span>
              </div>
              <div className="contact-item">
                <PhoneIcon className="contact-icon" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <MapPinIcon className="contact-icon" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-subtitle">For Freelancers</h4>
            <ul className="footer-links">
              <li><a href="#how-to-start">How to Start</a></li>
              <li><a href="#find-work">Find Work</a></li>
              <li><a href="#freelancer-guide">Freelancer Guide</a></li>
              <li><a href="#success-stories">Success Stories</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-subtitle">For Clients</h4>
            <ul className="footer-links">
              <li><a href="#how-to-hire">How to Hire</a></li>
              <li><a href="#talent">Find Talent</a></li>
              <li><a href="#enterprise">Enterprise</a></li>
              <li><a href="#case-studies">Case Studies</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-subtitle">Company</h4>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#press">Press</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-subtitle">Support</h4>
            <ul className="footer-links">
              <li><a href="#help">Help Center</a></li>
              <li><a href="#community">Community</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#status">Status</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © 2024 FreelanceWork. All rights reserved.
            </p>
            <div className="footer-legal">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
          <button className="scroll-to-top" onClick={scrollToTop}>
            <ArrowUpIcon className="scroll-icon" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
