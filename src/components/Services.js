import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { servicesAPI } from '../services/api';
import './Services.css';

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        console.log('Fetching services from API...');
        
        // First try to test if API is reachable
        try {
          const testResponse = await fetch('https://django-final.vercel.app/api/test-simple/');
          console.log('API test response:', testResponse);
        } catch (testErr) {
          console.log('API test failed:', testErr);
        }
        
        const response = await servicesAPI.getServices({ limit: 6 });
        console.log('API Response:', response);
        console.log('Services data:', response.data);
        
        // Handle different response structures
        const servicesData = response.data.results || response.data;
        console.log('Processed services:', servicesData);
        
        if (servicesData && servicesData.length > 0) {
          // Filter out deleted/inactive services (only show if explicitly true)
          const activeServices = servicesData.filter(service => service.is_active === true);
          setServices(activeServices);
        } else {
          console.log('No services found in API response, using fallback');
          // Use fallback data instead of throwing error
          setServices([
            {
              id: 1,
              title: 'Web Development',
              description: 'Custom websites, web applications, and e-commerce solutions',
              price: 500,
              features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Mobile Friendly'],
              featured: true
            },
            {
              id: 2,
              title: 'Graphic Design',
              description: 'Logo design, branding, and visual identity solutions',
              price: 200,
              features: ['Logo Design', 'Brand Identity', 'Print Materials', 'Digital Assets'],
              featured: false
            },
            {
              id: 3,
              title: 'Digital Marketing',
              description: 'Social media management, SEO, and content marketing',
              price: 300,
              features: ['Social Media', 'SEO Strategy', 'Content Creation', 'Analytics'],
              featured: false
            },
            {
              id: 4,
              title: 'Writing & Translation',
              description: 'Content writing, copywriting, and translation services',
              price: 100,
              features: ['Blog Writing', 'Copywriting', 'Translation', 'Proofreading'],
              featured: false
            },
            {
              id: 5,
              title: 'Video & Animation',
              description: 'Video production, animation, and motion graphics',
              price: 400,
              features: ['Video Editing', 'Animation', 'Motion Graphics', 'Post Production'],
              featured: false
            },
            {
              id: 6,
              title: 'Business Services',
              description: 'Consulting, virtual assistance, and business development',
              price: 150,
              features: ['Consulting', 'Virtual Assistant', 'Data Entry', 'Research'],
              featured: false
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services from API, using fallback data');
        // Fallback to static data if API fails
        setServices([
          {
            id: 1,
            title: 'Web Development',
            description: 'Custom websites, web applications, and e-commerce solutions',
            price: 500,
            features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Mobile Friendly'],
            featured: true
          },
          {
            id: 2,
            title: 'Graphic Design',
            description: 'Logo design, branding, and visual identity solutions',
            price: 200,
            features: ['Logo Design', 'Brand Identity', 'Print Materials', 'Digital Assets'],
            featured: false
          },
          {
            id: 3,
            title: 'Digital Marketing',
            description: 'Social media management, SEO, and content marketing',
            price: 300,
            features: ['Social Media', 'SEO Strategy', 'Content Creation', 'Analytics'],
            featured: false
          },
          {
            id: 4,
            title: 'Writing & Translation',
            description: 'Content writing, copywriting, and translation services',
            price: 100,
            features: ['Blog Writing', 'Copywriting', 'Translation', 'Proofreading'],
            featured: false
          },
          {
            id: 5,
            title: 'Video & Animation',
            description: 'Video production, animation, and motion graphics',
            price: 400,
            features: ['Video Editing', 'Animation', 'Motion Graphics', 'Post Production'],
            featured: false
          },
          {
            id: 6,
            title: 'Business Services',
            description: 'Consulting, virtual assistance, and business development',
            price: 150,
            features: ['Consulting', 'Virtual Assistant', 'Data Entry', 'Research'],
            featured: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Listen for service review updates
  useEffect(() => {
    const handleServiceReviewUpdate = (event) => {
      console.log('Service review submitted, refreshing services...', event.detail);
      // Re-run the fetchServices function
      const fetchServices = async () => {
        try {
          setLoading(true);
          const response = await servicesAPI.getServices({ limit: 6 });
          const servicesData = response.data.results || response.data;
          if (servicesData && servicesData.length > 0) {
            const activeServices = servicesData.filter(service => service.is_active === true);
            setServices(activeServices);
          }
        } catch (error) {
          console.error('Error refreshing services:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchServices();
    };

    window.addEventListener('serviceReviewSubmitted', handleServiceReviewUpdate);
    
    return () => {
      window.removeEventListener('serviceReviewSubmitted', handleServiceReviewUpdate);
    };
  }, []);

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `Starting at BDT ${price}`;
    }
    return price;
  };

  const getServiceFeatures = (service) => {
    // If the service has features from API, use them
    if (service.features && Array.isArray(service.features)) {
      return service.features;
    }
    // Otherwise, use default features based on service title
    const defaultFeatures = {
      'Web Development': ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Mobile Friendly'],
      'Graphic Design': ['Logo Design', 'Brand Identity', 'Print Materials', 'Digital Assets'],
      'Digital Marketing': ['Social Media', 'SEO Strategy', 'Content Creation', 'Analytics'],
      'Writing & Translation': ['Blog Writing', 'Copywriting', 'Translation', 'Proofreading'],
      'Video & Animation': ['Video Editing', 'Animation', 'Motion Graphics', 'Post Production'],
      'Business Services': ['Consulting', 'Virtual Assistant', 'Data Entry', 'Research']
    };
    return defaultFeatures[service.title] || ['Professional Service', 'Quality Work', 'On-time Delivery', '24/7 Support'];
  };

  if (loading) {
    return (
      <section id="services" className="services section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular Services</h2>
            <p className="section-subtitle">
              Discover the most in-demand services from our talented freelancers
            </p>
          </div>
          <div className="loading-message">Loading services...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="services" className="services section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular Services</h2>
            <p className="section-subtitle">
              Discover the most in-demand services from our talented freelancers
            </p>
          </div>
          <div className="error-message">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="services section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Popular Services</h2>
          <p className="section-subtitle">
            Discover the most in-demand services from our talented freelancers
          </p>
        </div>
        
        <div className="services-grid">
          {services.slice(0, 6).map((service, index) => (
            <div key={service.id || index} className={`service-card ${service.featured ? 'popular' : ''}`}>
              {service.featured && <div className="popular-badge">Most Popular</div>}
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              <div className="service-price">{formatPrice(service.price)}</div>
              <ul className="service-features">
                {getServiceFeatures(service).map((feature, featureIndex) => (
                  <li key={featureIndex} className="service-feature">
                    <span className="feature-check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                className="service-btn"
                onClick={() => navigate('/services')}
              >
                Browse Services
                <ArrowRightIcon className="btn-icon" />
              </button>
            </div>
          ))}
        </div>
        
        <div className="services-cta">
          <button 
            className="view-all-btn"
            onClick={() => navigate('/services')}
          >
            View All Services
            <ArrowRightIcon className="btn-icon" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;
