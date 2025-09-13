import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const TestPayment = () => {
  const { serviceId } = useParams();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, status, message) => {
    setTestResults(prev => [...prev, { test, status, message, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    // Test 1: Check if serviceId is available
    addResult('Service ID Check', serviceId ? 'PASS' : 'FAIL', 
      serviceId ? `Service ID: ${serviceId}` : 'No service ID provided');
    
    // Test 2: Test CORS with simple fetch
    try {
      addResult('CORS Test', 'TESTING', 'Testing CORS with simple fetch...');
      const response = await fetch(`https://django-final-delta.vercel.app/api/services/${serviceId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult('CORS Test', 'PASS', `Successfully fetched service: ${data.title}`);
      } else {
        addResult('CORS Test', 'FAIL', `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      addResult('CORS Test', 'FAIL', `Error: ${error.message}`);
    }
    
    // Test 3: Test with axios
    try {
      addResult('Axios Test', 'TESTING', 'Testing with axios...');
      const axios = (await import('axios')).default;
      const response = await axios.get(`https://django-final-delta.vercel.app/api/services/${serviceId}/`);
      addResult('Axios Test', 'PASS', `Successfully fetched service: ${response.data.title}`);
    } catch (error) {
      addResult('Axios Test', 'FAIL', `Error: ${error.message}`);
    }
    
    // Test 4: Test authentication
    try {
      addResult('Auth Test', 'TESTING', 'Testing authentication...');
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        addResult('Auth Test', 'PASS', `User authenticated: ${JSON.parse(userData).email}`);
      } else {
        addResult('Auth Test', 'FAIL', 'No authentication token found');
      }
    } catch (error) {
      addResult('Auth Test', 'FAIL', `Error: ${error.message}`);
    }
    
    // Test 5: Test payment initiation (if authenticated)
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        addResult('Payment Test', 'TESTING', 'Testing payment initiation...');
        const axios = (await import('axios')).default;
        
        // First create a test order
        const orderData = {
          service: serviceId,
          requirements: 'Test order for payment testing',
          buyer_name: 'Test User',
          buyer_phone: '1234567890',
          buyer_address: 'Test Address',
          buyer_city: 'Test City',
          buyer_country: 'Test Country',
          buyer_postal_code: '12345',
          total_amount: 100.00
        };
        
        const orderResponse = await axios.post('https://django-final-delta.vercel.app/api/orders/create/', orderData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        addResult('Order Creation', 'PASS', `Order created: ${orderResponse.data.id}`);
        
        // Now test payment initiation
        const paymentResponse = await axios.post(`https://django-final-delta.vercel.app/api/payments/initiate/${orderResponse.data.id}/`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (paymentResponse.data.redirect_url) {
          addResult('Payment Test', 'PASS', `Payment initiated successfully. Redirect URL: ${paymentResponse.data.redirect_url}`);
        } else {
          addResult('Payment Test', 'FAIL', 'No redirect URL in payment response');
        }
      } else {
        addResult('Payment Test', 'SKIP', 'Skipped - no authentication token');
      }
    } catch (error) {
      addResult('Payment Test', 'FAIL', `Error: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Payment Flow Test</h1>
      <p>Service ID: {serviceId || 'Not provided'}</p>
      
      <button 
        onClick={runTests} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Running Tests...' : 'Run Tests'}
      </button>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Test Results:</h2>
        {testResults.map((result, index) => (
          <div 
            key={index} 
            style={{
              padding: '10px',
              margin: '5px 0',
              backgroundColor: result.status === 'PASS' ? '#d4edda' : 
                             result.status === 'FAIL' ? '#f8d7da' : '#fff3cd',
              border: `1px solid ${result.status === 'PASS' ? '#c3e6cb' : 
                                 result.status === 'FAIL' ? '#f5c6cb' : '#ffeaa7'}`,
              borderRadius: '5px'
            }}
          >
            <strong>{result.test}:</strong> {result.status}
            <br />
            <small>{result.message}</small>
            <br />
            <small style={{ color: '#666' }}>{result.timestamp}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestPayment;
