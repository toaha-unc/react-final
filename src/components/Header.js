import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h2>FreelanceWork</h2>
          </div>
          
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#services" className="nav-link">Services</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#testimonials" className="nav-link">Testimonials</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>

          <div className="header-actions">
            <button className="btn btn-secondary">Sign In</button>
            <button className="btn btn-primary">Get Started</button>
          </div>

          <button className="mobile-menu-btn" onClick={toggleMenu}>
            {isMenuOpen ? <XMarkIcon /> : <Bars3Icon />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
