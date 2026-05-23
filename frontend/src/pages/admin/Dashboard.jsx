import React, { useEffect, useState } from 'react';
import { adminDashboardApi } from '../../services/adminApi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await adminDashboardApi.getAnalytics();
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (!analytics) return <div>Failed to load analytics</div>;

  const barChartData = {
    labels: analytics.topProducts.map(p => p.name),
    datasets: [
      {
        label: 'Total Sold',
        data: analytics.topProducts.map(p => p.sold),
        backgroundColor: '#e91e63',
        borderRadius: 5,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'High Demand Products' } },
  };

  const pieChartData = {
    labels: analytics.orderStatuses.map(s => s.status),
    datasets: [
      {
        data: analytics.orderStatuses.map(s => s.count),
        backgroundColor: ['#f8c8d0', '#e91e63', '#4caf50', '#ff9800', '#f44336'],
        borderWidth: 1,
      }
    ]
  };

  return (
    <div>
      <h1 style={{ color: 'var(--deep-pink)', marginBottom: '30px', fontSize: '32px' }}>Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow)', borderLeft: '4px solid var(--deep-pink)' }}>
          <h3 style={{ color: 'var(--text-dark)', fontSize: '16px', marginBottom: '10px' }}>Total Revenue</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--deep-pink)' }}>NGN {parseFloat(analytics.totalRevenue || 0).toLocaleString()}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow)', borderLeft: '4px solid var(--deep-pink)' }}>
          <h3 style={{ color: 'var(--text-dark)', fontSize: '16px', marginBottom: '10px' }}>Total Orders</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--deep-pink)' }}>{analytics.totalOrders}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow)', borderLeft: '4px solid var(--deep-pink)' }}>
          <h3 style={{ color: 'var(--text-dark)', fontSize: '16px', marginBottom: '10px' }}>Total Products</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--deep-pink)' }}>{analytics.totalProducts}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow)', borderLeft: '4px solid var(--deep-pink)' }}>
          <h3 style={{ color: 'var(--text-dark)', fontSize: '16px', marginBottom: '10px' }}>Featured Products</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--deep-pink)' }}>{analytics.featuredProducts}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
           <Bar options={barChartOptions} data={barChartData} />
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <h3 style={{ marginBottom: '20px', color: '#666', fontSize: '14px', fontWeight: 'bold' }}>Order Status Distribution</h3>
           <div style={{ width: '100%', maxWidth: '250px' }}>
             <Pie data={pieChartData} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
