import React, { useEffect, useState } from 'react';
import { adminOrdersApi } from '../../services/adminApi';

const Shop = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryGroup, setDeliveryGroup] = useState('sun_wed');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    fetchOrders(deliveryDate);
  }, [deliveryDate]);

  const fetchOrders = async (date = '') => {
    try {
      const data = await adminOrdersApi.getAll(date);
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminOrdersApi.updateStatus(id, newStatus);
      fetchOrders(deliveryDate);
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  const handleProceedDelivery = async () => {
    setScheduling(true);
    try {
      const result = await adminOrdersApi.scheduleDelivery(deliveryGroup);
      await fetchOrders(deliveryDate);
      alert(`${result.count || 0} order${result.count === 1 ? '' : 's'} marked for delivery.`);
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setScheduling(false);
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      <h1 style={{ color: 'var(--deep-pink)', fontSize: '32px', marginBottom: '10px' }}>Shop & Order Management</h1>

      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <label style={{ color: 'var(--text-dark)' }}>Filter by delivery date:</label>
        <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
        {deliveryDate && (
          <button type="button" onClick={() => setDeliveryDate('')} className="delete-btn" style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid var(--deep-pink)', background: '#fff', color: 'var(--deep-pink)', cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '14px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
        <label style={{ color: 'var(--text-dark)' }}>Mark delivery for orders made:</label>
        <select value={deliveryGroup} onChange={e => setDeliveryGroup(e.target.value)} style={{ padding: '8px', borderRadius: '5px', border: '1px solid var(--primary-pink)', backgroundColor: 'var(--light-bg)', color: 'var(--deep-pink)', outline: 'none', cursor: 'pointer' }}>
          <option value="sun_wed">Sunday to Wednesday</option>
          <option value="thu_sat">Thursday to Saturday</option>
        </select>
        <button type="button" className="view-btn" onClick={handleProceedDelivery} disabled={scheduling} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--deep-pink)', background: '#fff', color: 'var(--deep-pink)', cursor: 'pointer' }}>
          {scheduling ? 'Processing...' : 'Proceed'}
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--primary-pink)', color: 'var(--deep-pink)', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>Order #</th>
              <th style={{ padding: '15px' }}>Date</th>
              <th style={{ padding: '15px' }}>Delivery</th>
              <th style={{ padding: '15px' }}>Customer Info</th>
              <th style={{ padding: '15px' }}>Total Amount</th>
              <th style={{ padding: '15px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{order.order_number}</td>
                <td style={{ padding: '15px' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '15px' }}>{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'Not selected'}</td>
                <td style={{ padding: '15px' }}>
                  {order.user ? order.user.name : 'Guest'}<br/>
                  <span style={{ fontSize: '12px', color: '#666' }}>{order.shipping_address}</span>
                </td>
                <td style={{ padding: '15px' }}>NGN {parseFloat(order.total_amount).toLocaleString()}</td>
                <td style={{ padding: '15px' }}>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid var(--deep-pink)', backgroundColor: 'var(--light-bg)', color: 'var(--deep-pink)', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Order On The Way">Order On The Way</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Shop;
