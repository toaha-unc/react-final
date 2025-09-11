import React from 'react';
import './ServiceSort.css';

const ServiceSort = ({ currentSort, onSortChange, resultsCount }) => {
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'delivery_fast', label: 'Fastest Delivery' },
  ];

  const handleSortChange = (e) => {
    onSortChange(e.target.value);
  };

  return (
    <div className="service-sort">
      <div className="sort-header">
        <h3>Sort By</h3>
        <span className="results-count">
          {resultsCount} results
        </span>
      </div>
      
      <div className="sort-options">
        <select
          className="sort-select"
          value={currentSort}
          onChange={handleSortChange}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ServiceSort;
