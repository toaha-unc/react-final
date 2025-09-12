import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { servicesAPI } from '../services/api';
import ServiceCard from './ServiceCard';
import './Recommendations.css';

const Recommendations = ({ onViewService }) => {
  const { user, isBuyer } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchRecommendations();
    fetchCategories();
  }, [selectedCategory]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        featured: true,
        ordering: '-rating'
      };
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      const response = await servicesAPI.getServices(params);
      const servicesData = response.data?.results || response.data || [];
      setRecommendations(Array.isArray(servicesData) ? servicesData.slice(0, 6) : []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await servicesAPI.getCategories();
      const categoriesData = response.data?.results || response.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleViewService = (service) => {
    if (onViewService) {
      onViewService(service);
    }
  };

  if (!isBuyer) {
    return null; // Only show recommendations to buyers
  }

  if (loading) {
    return (
      <div className="recommendations-loading">
        <div className="loading-spinner"></div>
        <p>Loading recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-error">
        <h3>Error Loading Recommendations</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchRecommendations}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="recommendations">
      <div className="recommendations-header">
        <h2>Recommended for You</h2>
        <p>Discover services tailored to your interests</p>
      </div>

      {categories.length > 0 && (
        <div className="recommendations-filters">
          <div className="filter-group">
            <label htmlFor="category-filter">Category:</label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {recommendations.length === 0 ? (
        <div className="no-recommendations">
          <h3>No Recommendations Available</h3>
          <p>
            {selectedCategory === 'all' 
              ? 'We don\'t have any recommendations for you right now.' 
              : `No recommendations found in this category.`
            }
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/services'}
          >
            Browse All Services
          </button>
        </div>
      ) : (
        <div className="recommendations-grid">
          {recommendations.map((service) => (
            <div key={service.id} className="recommendation-item">
              <ServiceCard
                service={service}
                onViewDetails={() => handleViewService(service)}
                showActions={true}
              />
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Recommendations;
