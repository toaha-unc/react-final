# Service Listing and Filtering Frontend

This document describes the Service Listing and Filtering functionality implemented for the freelancer platform.

## Features Implemented

### 1. Service Listing
- **ServiceCard Component**: Displays individual services with title, description, price, delivery time, seller info, and ratings
- **ServiceList Component**: Main component that manages the service grid, pagination, and state
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### 2. Filtering System
- **ServiceFilters Component**: Provides comprehensive filtering options
  - Search by service title/description
  - Filter by category (dropdown with all available categories)
  - Price range filtering (min/max price inputs)
  - Quick price filters (Under $50, $50-$200, $200-$500, Over $500)
  - Clear all filters functionality

### 3. Sorting Options
- **ServiceSort Component**: Multiple sorting options
  - Newest First
  - Oldest First
  - Price: Low to High
  - Price: High to Low
  - Highest Rated
  - Most Popular
  - Fastest Delivery

### 4. Service Management (for Sellers)
- **ServiceForm Component**: Create and edit services
  - Title, description, price, category, delivery time
  - Form validation with error messages
  - Character count for description
  - Featured service option
- **ServiceDetails Component**: View detailed service information
  - Full service description
  - Seller information and stats
  - Reviews section with ratings
  - Order functionality (placeholder)

### 5. Navigation and Routing
- New `/services` route added to App.js
- Dashboard updated with links to service management
- State management for service viewing, editing, and creation

## Components Created

1. **ServiceCard.js** - Individual service display card
2. **ServiceList.js** - Main service listing with filters and pagination
3. **ServiceFilters.js** - Filtering interface
4. **ServiceSort.js** - Sorting interface
5. **ServiceForm.js** - Service creation/editing form
6. **ServiceDetails.js** - Detailed service view
7. **ServiceCard.css** - Styling for service cards
8. **ServiceList.css** - Styling for service listing
9. **ServiceFilters.css** - Styling for filters
10. **ServiceSort.css** - Styling for sorting
11. **ServiceForm.css** - Styling for service form
12. **ServiceDetails.css** - Styling for service details

## API Integration

The components integrate with the Django backend at `https://django-final.vercel.app/api`:

- `GET /services/` - Fetch services with filtering and pagination
- `GET /services/{id}/` - Fetch individual service details
- `POST /services/create/` - Create new service
- `PUT /services/{id}/update/` - Update existing service
- `DELETE /services/{id}/delete/` - Delete service
- `GET /categories/` - Fetch available categories
- `GET /services/{id}/reviews/` - Fetch service reviews

## Design System

All components follow the black and white design theme:
- Primary color: Black (#000)
- Background: White (#fff)
- Accent colors: Various shades of gray
- Consistent border styling with 2px solid black borders
- Rounded corners (8px-12px border-radius)
- Box shadows for depth
- Responsive grid layouts

## Usage

1. **For Buyers**: Navigate to `/services` to browse and filter services
2. **For Sellers**: Use the "Manage Services" button in the dashboard to create, edit, and delete services
3. **Service Details**: Click "View Details" on any service card to see full information
4. **Filtering**: Use the filter panel to narrow down services by category, price, or search terms
5. **Sorting**: Use the sort dropdown to organize services by various criteria

## Responsive Behavior

- **Desktop**: 3-4 column grid layout
- **Tablet**: 2 column grid layout
- **Mobile**: Single column layout with stacked filters
- All components adapt their layouts and interactions for different screen sizes

## Future Enhancements

- Order placement functionality
- Advanced filtering options (delivery time, rating)
- Service image uploads
- Real-time search suggestions
- Service comparison feature
- Wishlist/favorites functionality
