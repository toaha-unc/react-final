import axios from 'axios';

const API_BASE_URL = 'https://django-final.vercel.app/api';

// CORS proxy for development/testing
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const USE_CORS_PROXY = false; // Set to true if CORS issues persist

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Disable credentials to avoid CORS issues
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      // Don't redirect to login for API calls that should work without auth
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  refreshToken: (refreshToken) => api.post('/auth/token/refresh/', { refresh: refreshToken }),
  logout: () => api.post('/auth/logout/'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}/`),
  resendVerification: () => api.post('/auth/resend-verification/'),
};

// Services API
export const servicesAPI = {
  getCategories: () => api.get('/categories/'),
  getServices: (params) => api.get('/services/', { params }),
  getService: (id) => {
    // Use authenticated API for sellers to view their own services
    return api.get(`/services/${id}/`);
  },
  createService: (serviceData) => api.post('/services/create/', serviceData),
  updateService: (id, serviceData) => api.put(`/services/${id}/update/`, serviceData),
  deleteService: (id) => api.delete(`/services/${id}/delete/`),
  getFeaturedServices: () => api.get('/services/?featured=true'),
  getServiceStats: (id) => api.get(`/services/${id}/stats/`),
  getSellerServices: (params) => api.get('/seller/services/', { params }),
};

// Reviews API
export const reviewsAPI = {
  getServiceReviews: (serviceId) => api.get(`/services/${serviceId}/reviews/`),
  createReview: (serviceId, reviewData) => api.post(`/services/${serviceId}/reviews/create/`, reviewData),
  updateReview: (id, reviewData) => api.put(`/reviews/${id}/update/`, reviewData),
  deleteReview: (id) => api.delete(`/reviews/${id}/delete/`),
  uploadReviewImage: (reviewId, imageData) => api.post(`/reviews/${reviewId}/images/`, imageData),
  getBuyerReviews: () => api.get('/buyer/review-history/'),
  getSellerReviews: (sellerId) => api.get(`/sellers/${sellerId}/reviews/`),
};

// Orders API
export const ordersAPI = {
  getOrders: (params) => api.get('/orders/', { params }),
  getOrder: (id) => api.get(`/orders/${id}/`),
  createOrder: (orderData) => api.post('/orders/create/', orderData),
  updateOrder: (id, orderData) => api.put(`/orders/${id}/update/`, orderData),
  getOrderMessages: (orderId) => api.get(`/orders/${orderId}/messages/`),
  createOrderMessage: (orderId, messageData) => api.post(`/orders/${orderId}/messages/create/`, messageData),
  getOrderFiles: (orderId) => api.get(`/orders/${orderId}/files/`),
  uploadOrderFile: (orderId, fileData) => api.post(`/orders/${orderId}/files/create/`, fileData),
};

// User Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile/'),
  updateProfile: (profileData) => api.put('/profile/', profileData),
  getSellerProfile: () => api.get('/seller/profile/'),
  updateSellerProfile: (profileData) => api.put('/seller/profile/update/', profileData),
  getBuyerProfile: () => api.get('/buyer/profile/'),
  updateBuyerProfile: (profileData) => api.put('/buyer/profile/update/', profileData),
};

// Dashboard API
export const dashboardAPI = {
  getSellerStats: () => api.get('/seller/dashboard-stats/'),
  getSellerEarnings: () => api.get('/seller/earnings/'),
  getSellerAnalytics: () => api.get('/seller/analytics/'),
  getBuyerStats: () => api.get('/buyer/dashboard-stats/?update=true'),
  getBuyerAnalytics: () => api.get('/buyer/analytics/'),
  getBuyerOrderHistory: () => api.get('/buyer/order-history/'),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications/', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/mark-read/`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read/'),
};

// Statistics API
export const statsAPI = {
  getServiceStats: () => api.get('/stats/'),
  getOrderStats: () => api.get('/order-stats/'),
};

// Payment API
export const paymentAPI = {
  getPayments: (params) => api.get('/payments/', { params }),
  getPayment: (id) => api.get(`/payments/${id}/`),
  createPayment: (paymentData) => api.post('/payments/create/', paymentData),
  getPaymentStats: () => api.get('/payments/stats/'),
  getPaymentMethods: () => api.get('/payments/methods/'),
  createPaymentMethod: (methodData) => api.post('/payments/methods/', methodData),
  updatePaymentMethod: (id, methodData) => api.put(`/payments/methods/${id}/`, methodData),
  deletePaymentMethod: (id) => api.delete(`/payments/methods/${id}/`),
  initiatePayment: (orderId) => api.post(`/payments/initiate/${orderId}/`),
  getSSLCommerzMethods: (paymentId) => api.get(`/payments/${paymentId}/methods/`),
  createRefund: (paymentId, refundData) => api.post(`/payments/${paymentId}/refund/`, refundData),
};

export default api;
