import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
    setShowUserMenu(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    navigate('/');
    scrollToTop();
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.nav') && !event.target.closest('.mobile-menu-btn')) {
        setIsMenuOpen(false);
      }
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, showUserMenu]);

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <button onClick={handleLogoClick} className="logo-btn">
                <h2>FreelanceWork</h2>
              </button>
            </div>
            
            <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
              {isAuthenticated ? (
                <>
                  <button 
                    className="nav-link"
                    onClick={() => handleNavigation('/dashboard')}
                  >
                    Dashboard
                  </button>
                  <button 
                    className="nav-link"
                    onClick={() => handleNavigation('/services')}
                  >
                    Services
                  </button>
                  <button 
                    className="nav-link"
                    onClick={() => handleNavigation('/orders')}
                  >
                    Orders
                  </button>
                  <button 
                    className="nav-link"
                    onClick={() => handleNavigation('/reviews')}
                  >
                    Reviews
                  </button>
                  <button 
                    className="nav-link"
                    onClick={() => handleNavigation('/profile')}
                  >
                    Profile
                  </button>
                  <button 
                    className="nav-link logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a href="#features" className="nav-link" onClick={() => setIsMenuOpen(false)}>Features</a>
                  <a href="#services" className="nav-link" onClick={() => setIsMenuOpen(false)}>Services</a>
                  <a href="#how-it-works" className="nav-link" onClick={() => setIsMenuOpen(false)}>How It Works</a>
                  <a href="#testimonials" className="nav-link" onClick={() => setIsMenuOpen(false)}>Testimonials</a>
                </>
              )}
            </nav>

            <div className="header-actions">
              {isAuthenticated ? (
                <div className="user-menu">
                  <button 
                    className="user-menu-btn"
                    onClick={toggleUserMenu}
                    aria-label="User menu"
                  >
                    <UserIcon className="user-icon" />
                    <span className="user-name">
                      {user?.first_name || user?.email}
                    </span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="user-dropdown">
                      <div className="user-info">
                        <div className="user-email">{user?.email}</div>
                        <div className="user-role">
                          {user?.role === 'seller' ? 'Service Provider' : 'Buyer'}
                        </div>
                      </div>
                      <div className="dropdown-divider"></div>
                      <button 
                        className="dropdown-item"
                        onClick={() => handleNavigation('/dashboard')}
                      >
                        Dashboard
                      </button>
                      <button 
                        className="dropdown-item"
                        onClick={() => handleNavigation('/reviews')}
                      >
                        Reviews
                      </button>
                      <button 
                        className="dropdown-item"
                        onClick={() => handleNavigation('/profile')}
                      >
                        Profile
                      </button>
                      <div className="dropdown-divider"></div>
                      <button 
                        className="dropdown-item logout"
                        onClick={handleLogout}
                      >
                        <ArrowRightOnRectangleIcon className="logout-icon" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleNavigation('/login')}
                  >
                    Sign In
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleNavigation('/register')}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            <button className="mobile-menu-btn" onClick={toggleMenu}>
              {isMenuOpen ? <XMarkIcon /> : <Bars3Icon />}
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Backdrop */}
      {isMenuOpen && <div className="mobile-backdrop" onClick={() => setIsMenuOpen(false)}></div>}
    </>
  );
};

export default Header;