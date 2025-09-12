import React, { useState, useEffect } from 'react';
import { servicesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ServiceForm from './ServiceForm';
import ServiceCard from './ServiceCard';
import './SellerServices.css';

const SellerServices = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  // Listen for service review updates
  useEffect(() => {
    const handleServiceReviewUpdate = (event) => {
      console.log('Service review submitted, refreshing seller services...', event.detail);
      fetchServices();
    };

    window.addEventListener('serviceReviewSubmitted', handleServiceReviewUpdate);
    
    return () => {
      window.removeEventListener('serviceReviewSubmitted', handleServiceReviewUpdate);
    };
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await servicesAPI.getSellerServices({ _t: timestamp });
      const servicesData = response.data?.results || response.data || [];
      console.log('Seller services data:', servicesData);
      console.log('Services with is_active status:', servicesData.map(s => ({ id: s.id, title: s.title, is_active: s.is_active })));
      // Filter out deleted/inactive services (only show if explicitly true)
      const activeServices = Array.isArray(servicesData) 
        ? servicesData.filter(service => service.is_active === true)
        : [];
      console.log('Filtered active services:', activeServices);
      setServices(activeServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services. Please try again.');
      // Use fallback data
      const fallbackServices = [
        {
          id: 1,
          title: 'Professional Web Development',
          description: 'Custom website development using modern technologies',
          price: 500,
          category: { name: 'Web Development' },
          delivery_time: 7,
          is_active: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          title: 'Logo Design & Branding',
          description: 'Creative logo design and brand identity package',
          price: 200,
          category: { name: 'Design' },
          delivery_time: 3,
          is_active: true,
          created_at: '2024-01-10T14:30:00Z',
          updated_at: '2024-01-10T14:30:00Z'
        },
        {
          id: 3,
          title: 'Deleted Service Test',
          description: 'This service should not be visible',
          price: 100,
          category: { name: 'Test' },
          delivery_time: 1,
          is_active: false,
          created_at: '2024-01-05T10:00:00Z',
          updated_at: '2024-01-05T10:00:00Z'
        }
      ];
      // Filter out deleted/inactive services from fallback data too
      const activeFallbackServices = fallbackServices.filter(service => service.is_active === true);
      console.log('Fallback services before filtering:', fallbackServices);
      console.log('Fallback services after filtering:', activeFallbackServices);
      setServices(activeFallbackServices);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        console.log('Attempting to delete service with ID:', serviceId);
        const response = await servicesAPI.deleteService(serviceId);
        console.log('Delete response:', response);
        
        // Refresh the services list to get the latest data from the backend
        console.log('Refreshing services list after delete...');
        await fetchServices();
        alert('Service deleted successfully!');
      } catch (error) {
        console.error('Error deleting service:', error);
        console.error('Error response:', error.response);
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           'Failed to delete service. Please try again.';
        alert(errorMessage);
      }
    }
  };

  const handleFormSubmit = async (serviceData) => {
    try {
      // The ServiceForm component already handles the API call
      // We just need to handle the UI updates and refresh
      if (editingService) {
        alert('Service updated successfully!');
      } else {
        alert('Service created successfully!');
      }
      setShowForm(false);
      setEditingService(null);
      // Refresh the services list to get the latest data from the backend
      await fetchServices();
    } catch (error) {
      console.error('Error in form submission:', error);
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         'An error occurred. Please try again.';
      alert(errorMessage);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingService(null);
  };


  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return `BDT ${0}`;
    }
    
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numericPrice)) {
      return `BDT ${0}`;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericPrice);
  };

  if (loading) {
    return (
      <div className="seller-services-loading">
        <div className="loading-spinner"></div>
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <div className="seller-services">
      <div className="services-header">
        <div className="header-content">
          <h2>My Services</h2>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={handleCreateService}
          >
            + Add New Service
          </button>
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
            <h3>No Services Yet</h3>
            <p>Create your first service to start earning on the platform.</p>
            <button 
              className="btn btn-primary"
              onClick={handleCreateService}
            >
              Create Service
            </button>
          </div>
        </div>
      ) : (
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-card-header">
                <h3 className="service-title">{service.title}</h3>
                <div className="service-status">
                  <span className={`status-badge ${service.is_active ? 'active' : 'inactive'}`}>
                    {service.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="service-card-content">
                <p className="service-description">{service.description}</p>
                
                <div className="service-details">
                  <div className="detail-item">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value">{formatPrice(service.price)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{typeof service.category === 'string' ? service.category : service.category?.name || 'Uncategorized'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Delivery:</span>
                    <span className="detail-value">{service.delivery_time} days</span>
                  </div>
                </div>

                <div className="service-card-actions">
                  <div className="action-buttons">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleEditService(service)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Form Modal */}
      {showForm && (
        <div className="service-form-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingService ? 'Edit Service' : 'Create New Service'}</h3>
              <button 
                className="modal-close"
                onClick={handleFormCancel}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <ServiceForm
                service={editingService}
                onSave={handleFormSubmit}
                onCancel={handleFormCancel}
                isEditing={!!editingService}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerServices;
