import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import EmailVerification from './components/auth/EmailVerification';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './components/Dashboard';
import SellerDashboard from './components/SellerDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import ServiceList from './components/ServiceList';
import ServiceForm from './components/ServiceForm';
import ServiceDetails from './components/ServiceDetails';
import OrderList from './components/OrderList';
import OrderDetails from './components/OrderDetails';
import OrderForm from './components/OrderForm';
import Notifications from './components/Notifications';
import Recommendations from './components/Recommendations';
import './App.css';

// Placeholder component for profile
const Profile = () => (
  <div className="container" style={{ paddingTop: '100px', minHeight: '100vh' }}>
    <h1>Profile</h1>
    <p>Manage your profile settings here.</p>
  </div>
);

// Main Services component that handles state
const ServicesPage = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);

  const handleViewService = (service) => {
    setSelectedService(service);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setShowServiceForm(true);
  };


  const handleServiceSaved = () => {
    setShowServiceForm(false);
    setEditingService(null);
    // Refresh the service list
    window.location.reload();
  };

  const handleCancelForm = () => {
    setShowServiceForm(false);
    setEditingService(null);
  };

  const handleBackToList = () => {
    setSelectedService(null);
  };

  const handleServiceDeleted = () => {
    setSelectedService(null);
    // Refresh the service list
    window.location.reload();
  };

  if (showServiceForm) {
    return (
      <ServiceForm
        service={editingService}
        isEditing={!!editingService}
        onSave={handleServiceSaved}
        onCancel={handleCancelForm}
      />
    );
  }

  if (selectedService) {
    return (
      <ServiceDetails
        serviceId={selectedService.id}
        onBack={handleBackToList}
        onEdit={handleEditService}
        onDelete={handleServiceDeleted}
      />
    );
  }

  return (
    <ServiceList
      onEditService={handleEditService}
      onDeleteService={() => {}} // Handled in ServiceDetails
      onViewServiceDetails={handleViewService}
    />
  );
};

// Main Orders component that handles state
const OrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
    setEditingOrder(null);
  };

  if (selectedOrder) {
    return (
      <OrderDetails
        orderId={selectedOrder.id}
        onBack={handleBackToList}
        onEdit={handleEditOrder}
      />
    );
  }

  return (
    <OrderList
      onViewOrder={handleViewOrder}
      onEditOrder={handleEditOrder}
    />
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<EmailVerification />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller-dashboard" 
              element={
                <ProtectedRoute>
                  <SellerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/buyer-dashboard" 
              element={
                <ProtectedRoute>
                  <BuyerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/services" 
              element={
                <ProtectedRoute>
                  <ServicesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order-form/:serviceId" 
              element={
                <ProtectedRoute>
                  <OrderForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;