import React, { useState, useEffect, useCallback } from 'react';
import { servicesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import ServiceCard from './ServiceCard';
import ServiceFilters from './ServiceFilters';
import ServiceSort from './ServiceSort';
import './ServiceList.css';

const ServiceList = ({ onEditService, onDeleteService, onViewServiceDetails }) => {
  const { isSeller, user, isAuthenticated } = useAuth();
  
  console.log('ServiceList - User:', user);
  console.log('ServiceList - Is Authenticated:', isAuthenticated);
  console.log('ServiceList - Is Seller:', isSeller);
  const [allServices, setAllServices] = useState([]); // Store all services
  const [filteredServices, setFilteredServices] = useState([]); // Store filtered services
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: '',
  });
  const [sortBy, setSortBy] = useState('newest');
  const [totalCount, setTotalCount] = useState(0);

  const fetchAllServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching all services...');
      
      // Fetch all pages to get all services
      let allServicesData = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const params = { page, page_size: 10 };
        const response = await servicesAPI.getServices(params);
        console.log(`Page ${page} response:`, response.data);
        
        const servicesData = response.data.results || response.data;
        if (servicesData && servicesData.length > 0) {
          allServicesData = [...allServicesData, ...servicesData];
        }
        
        // Check if there are more pages
        hasMore = response.data.next !== null;
        page++;
      }
      
      console.log('All services fetched:', allServicesData);
      
      if (allServicesData.length > 0) {
        setAllServices(allServicesData);
        setTotalCount(allServicesData.length);
      } else {
        console.log('No services found, using fallback data');
        // Use fallback data if no services are returned
        const fallbackServices = [
          {
            id: 1,
            title: 'Web Development',
            description: 'Custom websites, web applications, and e-commerce solutions built with modern technologies.',
            price: 500,
            delivery_time: 7,
            category: 'Web Development',
            seller: { id: 1, first_name: 'John', last_name: 'Doe' },
            rating: 4.8,
            reviews_count: 25,
            orders_count: 50,
            is_featured: true
          },
          {
            id: 2,
            title: 'Graphic Design',
            description: 'Professional logo design, branding, and visual identity solutions for your business.',
            price: 200,
            delivery_time: 3,
            category: 'Graphic Design',
            seller: { id: 2, first_name: 'Jane', last_name: 'Smith' },
            rating: 4.9,
            reviews_count: 18,
            orders_count: 35,
            is_featured: false
          },
          {
            id: 3,
            title: 'Digital Marketing',
            description: 'Social media management, SEO optimization, and content marketing strategies.',
            price: 300,
            delivery_time: 5,
            category: 'Digital Marketing',
            seller: { id: 3, first_name: 'Mike', last_name: 'Johnson' },
            rating: 4.7,
            reviews_count: 12,
            orders_count: 28,
            is_featured: false
          },
          {
            id: 4,
            title: 'Content Writing',
            description: 'High-quality blog posts, articles, and copywriting services for your business.',
            price: 100,
            delivery_time: 2,
            category: 'Writing',
            seller: { id: 4, first_name: 'Sarah', last_name: 'Wilson' },
            rating: 4.6,
            reviews_count: 15,
            orders_count: 22,
            is_featured: false
          },
          {
            id: 5,
            title: 'Video Production',
            description: 'Professional video editing, animation, and motion graphics for your projects.',
            price: 400,
            delivery_time: 10,
            category: 'Video & Animation',
            seller: { id: 5, first_name: 'David', last_name: 'Brown' },
            rating: 4.8,
            reviews_count: 8,
            orders_count: 15,
            is_featured: false
          },
          {
            id: 6,
            title: 'Business Consulting',
            description: 'Strategic business advice, market analysis, and growth planning services.',
            price: 250,
            delivery_time: 7,
            category: 'Business',
            seller: { id: 6, first_name: 'Lisa', last_name: 'Davis' },
            rating: 4.9,
            reviews_count: 20,
            orders_count: 30,
            is_featured: true
          }
        ];
        setAllServices(fallbackServices);
        setTotalCount(fallbackServices.length);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services. Please try again.');
      // Even on error, show fallback data
      const fallbackServices = [
        {
          id: 1,
          title: 'Web Development',
          description: 'Custom websites, web applications, and e-commerce solutions built with modern technologies.',
          price: 500,
          delivery_time: 7,
          category: 'Web Development',
          seller: { id: 1, first_name: 'John', last_name: 'Doe' },
          rating: 4.8,
          reviews_count: 25,
          orders_count: 50,
          is_featured: true
        },
        {
          id: 2,
          title: 'Graphic Design',
          description: 'Professional logo design, branding, and visual identity solutions for your business.',
          price: 200,
          delivery_time: 3,
          category: 'Graphic Design',
          seller: { id: 2, first_name: 'Jane', last_name: 'Smith' },
          rating: 4.9,
          reviews_count: 18,
          orders_count: 35,
          is_featured: false
        }
      ];
      setAllServices(fallbackServices);
      setTotalCount(fallbackServices.length);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort services based on current filters and sortBy
  const applyFiltersAndSort = useCallback((services, currentFilters, currentSortBy) => {
    let filtered = [...services];

    // Filter out deleted/inactive services (only show if explicitly true)
    console.log('Before filtering - services:', services.map(s => ({ id: s.id, title: s.title, is_active: s.is_active })));
    filtered = filtered.filter(service => service.is_active === true);
    console.log('After filtering - services:', filtered.map(s => ({ id: s.id, title: s.title, is_active: s.is_active })));

    // Apply search filter
    if (currentFilters.search) {
      const searchTerm = currentFilters.search.toLowerCase();
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(searchTerm) ||
        service.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (currentFilters.category) {
      filtered = filtered.filter(service => 
        service.category && service.category.id.toString() === currentFilters.category.toString()
      );
    }

    // Apply price filters
    if (currentFilters.minPrice) {
      filtered = filtered.filter(service => 
        parseFloat(service.price) >= parseFloat(currentFilters.minPrice)
      );
    }

    if (currentFilters.maxPrice) {
      filtered = filtered.filter(service => 
        parseFloat(service.price) <= parseFloat(currentFilters.maxPrice)
      );
    }

    // Apply sorting
    const sortOrdering = getSortOrdering(currentSortBy);
    if (sortOrdering) {
      filtered.sort((a, b) => {
        const [field, direction] = sortOrdering.startsWith('-') 
          ? [sortOrdering.substring(1), 'desc'] 
          : [sortOrdering, 'asc'];

        let aValue = a[field];
        let bValue = b[field];

        // Handle nested fields
        if (field === 'created_at') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else if (field === 'price') {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }

        if (direction === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  }, []);

  // Apply filters and sort whenever allServices, filters, or sortBy changes
  useEffect(() => {
    if (allServices.length > 0) {
      const filtered = applyFiltersAndSort(allServices, filters, sortBy);
      setFilteredServices(filtered);
    }
  }, [allServices, filters, sortBy, applyFiltersAndSort]);

  useEffect(() => {
    fetchAllServices();
  }, [fetchAllServices]);

  // Listen for service review updates
  useEffect(() => {
    const handleServiceReviewUpdate = (event) => {
      console.log('Service review submitted, refreshing services...', event.detail);
      fetchAllServices();
    };

    window.addEventListener('serviceReviewSubmitted', handleServiceReviewUpdate);
    
    return () => {
      window.removeEventListener('serviceReviewSubmitted', handleServiceReviewUpdate);
    };
  }, [fetchAllServices]);

  const getSortOrdering = (sortValue) => {
    const sortMap = {
      'newest': '-created_at',
      'oldest': 'created_at',
      'price_low': 'price',
      'price_high': '-price',
      'rating': '-rating',
      'popular': '-orders_count',
      'delivery_fast': 'delivery_time',
    };
    return sortMap[sortValue] || '-created_at';
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  const handleEditService = (service) => {
    if (onEditService) {
      onEditService(service);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await servicesAPI.deleteService(serviceId);
        setAllServices(allServices.filter(service => service.id !== serviceId));
        setTotalCount(totalCount - 1);
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Failed to delete service. Please try again.');
      }
    }
  };

  const handleViewServiceDetails = (service) => {
    if (onViewServiceDetails) {
      onViewServiceDetails(service);
    }
  };


  if (loading && allServices.length === 0) {
    return (
      <div className="service-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="service-list-error">
        <h3>Error Loading Services</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchAllServices}>
          Try Again
        </button>
      </div>
    );
  }

  console.log('ServiceList rendering - filteredServices:', filteredServices.length, 'allServices:', allServices.length, 'loading:', loading, 'error:', error);

  return (
    <div className="service-list">
      <Header />
      <div className="service-list-header">
        <h1>Services</h1>
      </div>

      <div className="filters-sort-container">
        <div className="filters-container">
          <ServiceFilters
            onFiltersChange={handleFiltersChange}
            currentFilters={filters}
          />
        </div>

        <div className="sort-container">
          <ServiceSort
            currentSort={sortBy}
            onSortChange={handleSortChange}
            resultsCount={filteredServices.length}
          />
        </div>
      </div>

      <div className="service-list-content">
        <div className="service-list-stats">
          <p>
            Showing {filteredServices.length} of {totalCount} services
            {filters.search && ` for "${filters.search}"`}
          </p>
        </div>

        {filteredServices.length === 0 ? (
          <div className="no-services">
            <h3>No Services Found</h3>
            <p>
              {filters.search || filters.category || filters.minPrice || filters.maxPrice
                ? 'Try adjusting your filters to see more results.'
                : 'No services are available at the moment.'}
            </p>
            {(filters.search || filters.category || filters.minPrice || filters.maxPrice) && (
              <button
                className="btn btn-primary"
                onClick={() => handleFiltersChange({
                  category: '',
                  minPrice: '',
                  maxPrice: '',
                  search: '',
                })}
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="services-grid">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onEdit={isSeller && user && service.seller && service.seller.id === user.id ? handleEditService : null}
                  onDelete={isSeller && user && service.seller && service.seller.id === user.id ? handleDeleteService : null}
                  onViewDetails={handleViewServiceDetails}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ServiceList;
