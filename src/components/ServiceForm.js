import React, { useState, useEffect } from 'react';
import { servicesAPI } from '../services/api';
import Header from './Header';
import './ServiceForm.css';

const ServiceForm = ({ service, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    delivery_time: '',
    is_featured: false,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchCategories();
    if (isEditing && service) {
      setFormData({
        title: service.title || '',
        description: service.description || '',
        price: service.price || '',
        category: service.category?.id || '',
        delivery_time: service.delivery_time || '',
        is_featured: service.is_featured || false,
      });
    }
  }, [service, isEditing]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await servicesAPI.getCategories();
      // Handle paginated response format
      const categoriesData = response.data.results || response.data;
      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : [];
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Set empty array as fallback
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.delivery_time || formData.delivery_time <= 0) {
      newErrors.delivery_time = 'Delivery time must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price),
        delivery_time: parseInt(formData.delivery_time),
        category: parseInt(formData.category),
      };

      let response;
      if (isEditing) {
        response = await servicesAPI.updateService(service.id, serviceData);
      } else {
        response = await servicesAPI.createService(serviceData);
      }

      onSave(response.data);
    } catch (error) {
      console.error('Error saving service:', error);
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         'Failed to save service. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="service-form-container">
      <Header />
      <div className="service-form">
        <div className="form-header">
          <h2>{isEditing ? 'Edit Service' : 'Create New Service'}</h2>
          <p>
            {isEditing 
              ? 'Update your service details below.' 
              : 'Fill in the details to create a new service listing.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="service-form-content">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Service Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="e.g., Professional Logo Design"
              maxLength={100}
            />
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Describe your service in detail..."
              rows={6}
              maxLength={2000}
            />
            <div className="char-count">
              {formData.description.length}/2000 characters
            </div>
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price" className="form-label">
                Price (USD) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={`form-input ${errors.price ? 'error' : ''}`}
                placeholder="0"
                min="1"
                step="0.01"
              />
              {errors.price && (
                <span className="error-message">{errors.price}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="delivery_time" className="form-label">
                Delivery Time (Days) *
              </label>
              <input
                type="number"
                id="delivery_time"
                name="delivery_time"
                value={formData.delivery_time}
                onChange={handleInputChange}
                className={`form-input ${errors.delivery_time ? 'error' : ''}`}
                placeholder="0"
                min="1"
              />
              {errors.delivery_time && (
                <span className="error-message">{errors.delivery_time}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`form-select ${errors.category ? 'error' : ''}`}
              disabled={loadingCategories}
            >
              <option value="">
                {loadingCategories ? 'Loading categories...' : 'Select a category'}
              </option>
              {Array.isArray(categories) && categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="error-message">{errors.category}</span>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleInputChange}
                className="checkbox-input"
              />
              <span className="checkbox-text">
                Feature this service (may require additional fees)
              </span>
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Service' : 'Create Service')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
