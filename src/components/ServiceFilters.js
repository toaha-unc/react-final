import React, { useState, useEffect } from 'react';
import { servicesAPI } from '../services/api';
import './ServiceFilters.css';

const ServiceFilters = ({ onFiltersChange, currentFilters }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: currentFilters?.category || '',
    minPrice: currentFilters?.minPrice || '',
    maxPrice: currentFilters?.maxPrice || '',
    search: currentFilters?.search || '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching categories...');
      const response = await servicesAPI.getCategories();
      console.log('Categories response:', response);
      
      // Handle paginated response format
      const categoriesData = response.data.results || response.data;
      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : [];
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Use fallback categories if API fails
      const fallbackCategories = [
        { id: 1, name: 'Graphic Design' },
        { id: 2, name: 'Web Development' },
        { id: 3, name: 'Content Writing' },
        { id: 4, name: 'Digital Marketing' },
        { id: 5, name: 'Video & Animation' },
        { id: 6, name: 'Programming' }
      ];
      setCategories(fallbackCategories);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleQuickFilter = (minPrice, maxPrice) => {
    const newFilters = { 
      ...filters, 
      minPrice: minPrice, 
      maxPrice: maxPrice 
    };
    console.log('Quick filter clicked:', { minPrice, maxPrice, newFilters });
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      search: '',
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  console.log('ServiceFilters render - filters:', filters);

  return (
    <div className="service-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        {hasActiveFilters && (
          <button 
            className="btn-clear-filters"
            onClick={clearFilters}
          >
            Clear All
          </button>
        )}
      </div>

      <div className="filters-content">
        {/* Search Filter */}
        <div className="filter-group">
          <label className="filter-label">Search</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Search services..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="filter-group">
          <label className="filter-label">Category</label>
          <select
            className="filter-select"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {loading ? (
              <option disabled>Loading categories...</option>
            ) : (
              Array.isArray(categories) && categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="filter-group">
          <label className="filter-label">Price Range</label>
          <div className="price-range">
            <input
              type="number"
              className="filter-input price-input"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              min="0"
            />
            <span className="price-separator">to</span>
            <input
              type="number"
              className="filter-input price-input"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              min="0"
            />
          </div>
        </div>

        {/* Quick Price Filters */}
        <div className="filter-group">
          <label className="filter-label">Quick Filters</label>
          <div className="quick-filters">
            <button
              className={`quick-filter-btn ${filters.minPrice === '' && filters.maxPrice === '50' ? 'active' : ''}`}
              onClick={() => handleQuickFilter('', '50')}
            >
              Under BDT 50
            </button>
            <button
              className={`quick-filter-btn ${filters.minPrice === '50' && filters.maxPrice === '200' ? 'active' : ''}`}
              onClick={() => handleQuickFilter('50', '200')}
            >
              BDT 50 - BDT 200
            </button>
            <button
              className={`quick-filter-btn ${filters.minPrice === '200' && filters.maxPrice === '500' ? 'active' : ''}`}
              onClick={() => handleQuickFilter('200', '500')}
            >
              BDT 200 - BDT 500
            </button>
            <button
              className={`quick-filter-btn ${filters.minPrice === '500' && filters.maxPrice === '' ? 'active' : ''}`}
              onClick={() => handleQuickFilter('500', '')}
            >
              Over BDT 500
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceFilters;
