/**
 * Utility functions for formatting data consistently across the application
 */

/**
 * Format a price value as BDT currency
 * @param {number|string|null|undefined} price - The price value to format
 * @returns {string} Formatted price string (e.g., "BDT 1,000")
 */
export const formatPrice = (price) => {
  // Debug logging
  console.log('formatPrice input:', price, 'type:', typeof price);
  
  // Handle null, undefined, or empty values
  if (price === null || price === undefined || price === '') {
    console.warn('Invalid price value (null/undefined/empty):', price);
    return `BDT ${0}`;
  }
  
  // Convert to number if it's a string
  let numericPrice;
  if (typeof price === 'string') {
    // Remove any non-numeric characters except decimal point
    const cleanPrice = price.replace(/[^0-9.-]/g, '');
    numericPrice = parseFloat(cleanPrice);
  } else {
    numericPrice = Number(price);
  }
  
  // Check if conversion was successful
  if (isNaN(numericPrice) || numericPrice < 0) {
    console.warn('Price could not be converted to number:', price, '->', numericPrice);
    return `BDT ${0}`;
  }
  
  // Ensure we have a valid positive number
  if (numericPrice === 0) {
    console.warn('Price is zero:', price);
    return `BDT ${0}`;
  }
  
  console.log('formatPrice output:', numericPrice);
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericPrice);
};

/**
 * Format a date string for display
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) {
    return 'N/A';
  }
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.warn('Error formatting date:', dateString, error);
    return 'Invalid Date';
  }
};

/**
 * Format a date string for short display
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
export const formatShortDate = (dateString) => {
  if (!dateString) {
    return 'N/A';
  }
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.warn('Error formatting short date:', dateString, error);
    return 'Invalid Date';
  }
};

/**
 * Validate and clean a price value
 * @param {any} price - The price value to validate
 * @returns {number|null} Cleaned price value or null if invalid
 */
export const validatePrice = (price) => {
  if (price === null || price === undefined) {
    return null;
  }
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice) || numericPrice < 0) {
    return null;
  }
  
  return numericPrice;
};

/**
 * Format a number with commas for thousands
 * @param {number|string} number - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  
  const numericNumber = typeof number === 'string' ? parseFloat(number) : number;
  
  if (isNaN(numericNumber)) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-US').format(numericNumber);
};
