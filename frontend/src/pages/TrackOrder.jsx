import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ordersApi } from '../services/api';
import './TrackOrder.css';

const statuses = ['Pending', 'Preparing', 'Order On The Way', 'Delivered'];

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const initialOrderNumber = searchParams.get('order') || localStorage.getItem('bloomLastOrderNumber') || '';
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [lookupValue, setLookupValue] = useState(initialOrderNumber);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const activeIndex = useMemo(() => {
    if (!order) return 0;
    if (order.status === 'Cancelled') return -1;
    return Math.max(statuses.indexOf(order.status), 0);
  }, [order]);

  useEffect(() => {
    if (!orderNumber) return;
    let mounted = true;
    const fetchOrder = async () => {
      try {
        const data = await ordersApi.trackOrder(orderNumber);
        if (mounted) {
          setOrder(data);
          setError('');
          localStorage.setItem('bloomLastOrderNumber', data.order_number);
        }
      } catch (err) {
        if (mounted) setError(err.message);
      }
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [orderNumber]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setOrderNumber(lookupValue.trim());
  };

  return (
    <main className="track-order-page">
      <header className="track-order-header">
        <h1>Track Your Order</h1>
        <hr />
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Enter order number"
          value={lookupValue}
          onChange={(event) => setLookupValue(event.target.value)}
          style={{ flex: 1, minWidth: '220px', padding: '10px', border: '1px solid var(--primary-pink)', borderRadius: '8px' }}
        />
        <button className="view-btn" type="submit" style={{ padding: '10px 18px', border: '1px solid var(--deep-pink)', background: '#fff', color: 'var(--deep-pink)', borderRadius: '8px', cursor: 'pointer' }}>
          Track
        </button>
      </form>

      <div className="track-order-content">
        {error && <p style={{ color: 'var(--deep-pink)', marginBottom: '18px' }}>{error}</p>}
        {order && (
          <p style={{ color: 'var(--text-dark)', marginBottom: '18px' }}>
            Order {order.order_number}: {order.status}
          </p>
        )}
        <div className="timeline">
          {order?.status === 'Cancelled' ? (
            <div className="timeline-item completed">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <p>Cancelled</p>
              </div>
            </div>
          ) : (
            statuses.map((status, index) => (
              <div className={`timeline-item ${index <= activeIndex ? 'completed' : ''}`} key={status}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <p>{status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default TrackOrder;
