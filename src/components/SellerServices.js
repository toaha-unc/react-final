import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './SellerServices.css';

const SellerServices = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');

  useEffect(() => {
    fetchServices();
  }, [filter, sortBy]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        seller: user?.id,
        ordering: sortBy === 'created_at' ? '-created_at' : sortBy,
      };

      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await servicesAPI.getServices(params);
      const servicesData = response.data?.results || response.data || [];
      setServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services. Please try again.');
      // Use fallback data
      setServices([
        {
          id: 1,
          title: 'Professional Web Development',
          description: 'Custom websites and web applications built with modern technologies like React, Node.js, and Python.',
          price: 500,
          delivery_time: 7,
          category: { id: 1, name: 'Web Development' },
          status: 'active',
          rating: 4.8,
          reviews_count: 25,
          orders_count: 50,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-20T15:30:00Z'
        },
        {
          id: 2,
          title: 'Logo Design & Branding',
          description: 'Professional logo design and complete branding solutions for your business.',
          price: 200,
          delivery_time: 3,
          category: { id: 2, name: 'Graphic Design' },
          status: 'active',
          rating: 4.9,
          reviews_count: 18,
          orders_count: 35,
          created_at: '2024-01-10T14:20:00Z',
          updated_at: '2024-01-18T09:15:00Z'
        },
        {
          id: 3,
          title: 'Digital Marketing Strategy',
          description: 'Comprehensive digital marketing strategies including SEO, social media, and content marketing.',
          price: 300,
          delivery_time: 5,
          category: { id: 3, name: 'Digital Marketing' },
          status: 'draft',
          rating: 0,
          reviews_count: 0,
          orders_count: 0,
          created_at: '2024-01-22T11:45:00Z',
          updated_at: '2024-01-22T11:45:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'active': '#28a745',
      'inactive': '#6c757d',
      'draft': '#ffc107',
      'pending': '#007bff'
    };
    return statusColors[status] || '#6c757d';
  };

  const handleEditService = (service) => {
    navigate(`/services/edit/${service.id}`);
  };

  const handleViewService = (service) => {
    navigate(`/services/${service.id}`);
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await servicesAPI.deleteService(serviceId);
        setServices(services.filter(service => service.id !== serviceId));
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Failed to delete service. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (service) => {
    const newStatus = service.status === 'active' ? 'inactive' : 'active';
    try {
      await servicesAPI.updateService(service.id, { status: newStatus });
      setServices(services.map(s => 
        s.id === service.id ? { ...s, status: newStatus } : s
      ));
    } catch (error) {
      console.error('Error updating service status:', error);
      alert('Failed to update service status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="seller-services-loading">
        <div className="loading-spinner"></div>
        <p>Loading your services...</p>
      </div>
    );
  }

  return (
    <div className="seller-services">
      <div className="services-header">
        <div className="header-content">
          <h2>My Services</h2>
          <p>Manage your service listings and track their performance</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/services/create')}
        >
          Create New Service
        </button>
      </div>

      <div className="services-filters">
        <div className="filter-group">
          <label htmlFor="status-filter">Filter by Status:</label>
          <select
            id="status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Services</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-filter">Sort by:</label>
          <select
            id="sort-filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="created_at">Date Created</option>
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="orders_count">Popularity</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="services-error">
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={fetchServices}>
            Try Again
          </button>
        </div>
      )}

      {services.length === 0 ? (
        <div className="no-services">
          <div className="no-services-content">
            <h3>No Services Found</h3>
            <p>
              {filter === 'all' 
                ? "You haven't created any services yet." 
                : `No services found with status: ${filter}`
              }
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/services/create')}
            >
              Create Your First Service
            </button>
          </div>
        </div>
      ) : (
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-card-header">
                <div className="service-info">
                  <h3 className="service-title">{service.title || 'Untitled Service'}</h3>
                  <p className="service-category">{service.category?.name || 'Uncategorized'}</p>
                </div>
                <div className="service-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(service.status) }}
                  >
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="service-card-content">
                <p className="service-description">{service.description || 'No description available'}</p>
                
                <div className="service-metrics">
                  <div className="metric">
                    <span className="metric-label">Price:</span>
                    <span className="metric-value">{formatPrice(service.price || 0)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Delivery:</span>
                    <span className="metric-value">{service.delivery_time || 0} days</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Orders:</span>
                    <span className="metric-value">{service.orders_count || 0}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Rating:</span>
                    <span className="metric-value">
                      {(service.rating || 0) > 0 ? `${service.rating}/5` : 'No ratings'}
                    </span>
                  </div>
                </div>

                <div className="service-dates">
                  <span className="date-created">
                    Created: {service.created_at ? formatDate(service.created_at) : 'Unknown'}
                  </span>
                  <span className="date-updated">
                    Updated: {service.updated_at ? formatDate(service.updated_at) : 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="service-card-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleViewService(service)}
                >
                  View
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleEditService(service)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => handleToggleStatus(service)}
                >
                  {service.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDeleteService(service.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="services-stats">
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-number">{services.length}</span>
            <span className="stat-label">Total Services</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {services.filter(s => s.status === 'active').length}
            </span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {services.reduce((sum, s) => sum + s.orders_count, 0)}
            </span>
            <span className="stat-label">Total Orders</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {services.length > 0 
                ? (services.reduce((sum, s) => sum + s.rating, 0) / services.filter(s => s.rating > 0).length).toFixed(1)
                : '0'
              }
            </span>
            <span className="stat-label">Avg Rating</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerServices;
