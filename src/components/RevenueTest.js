import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

const RevenueTest = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardAPI.getSellerStats();
      console.log('API Response:', response.data);
      setData(response.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Revenue Test Component</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Raw API Data:</h2>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Earnings Summary:</h2>
        <ul>
          <li><strong>Total Earnings:</strong> BDT {data.earnings_summary?.total_earnings || 'N/A'}</li>
          <li><strong>This Month:</strong> BDT {data.earnings_summary?.this_month || 'N/A'}</li>
          <li><strong>This Year:</strong> BDT {data.earnings_summary?.this_year || 'N/A'}</li>
          <li><strong>Pending Payout:</strong> BDT {data.earnings_summary?.pending_payout || 'N/A'}</li>
          <li><strong>Paid Out:</strong> BDT {data.earnings_summary?.paid_out || 'N/A'}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Analytics:</h2>
        <ul>
          <li><strong>Total Orders:</strong> {data.analytics?.total_orders || 'N/A'}</li>
          <li><strong>Completed Orders:</strong> {data.analytics?.completed_orders || 'N/A'}</li>
          <li><strong>Total Services:</strong> {data.analytics?.total_services || 'N/A'}</li>
          <li><strong>Active Services:</strong> {data.analytics?.active_services || 'N/A'}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Mapped Data (as used in SellerStats):</h2>
        <ul>
          <li><strong>Total Earnings:</strong> BDT {data.analytics?.total_earnings || data.earnings_summary?.total_earnings || 0}</li>
          <li><strong>Monthly Earnings:</strong> BDT {data.analytics?.earnings_this_month || data.earnings_summary?.this_month || 0}</li>
          <li><strong>Total Orders:</strong> {data.analytics?.total_orders || 0}</li>
          <li><strong>Completed Orders:</strong> {data.analytics?.completed_orders || 0}</li>
        </ul>
      </div>

      <button onClick={fetchData} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Refresh Data
      </button>
    </div>
  );
};

export default RevenueTest;
