import React, { useEffect, useMemo, useState } from 'react';
import { adminOrdersApi } from '../../services/adminApi';
import { toast } from '../../utils/toast';
import './Shop.css';

const statusOptions = ['Pending', 'Preparing', 'Order On The Way', 'Delivered', 'Cancelled'];

const parseShippingAddress = (shippingAddress = '') => {
  const details = {
    fullName: '',
    phone: '',
    state: '',
    city: '',
    address: shippingAddress || '',
    note: '',
  };

  shippingAddress.split('\n').forEach((line) => {
    const [rawLabel, ...valueParts] = line.split(':');
    const label = rawLabel.trim().toLowerCase();
    const value = valueParts.join(':').trim();

    if (label === 'full name') details.fullName = value;
    if (label === 'phone') details.phone = value;
    if (label === 'state') details.state = value;
    if (label === 'city/area') details.city = value;
    if (label === 'address') details.address = value;
    if (label === 'delivery note') details.note = value;
  });

  return details;
};

const formatDateTime = (value) => {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatMoney = (value) => `NGN ${parseFloat(value || 0).toLocaleString()}`;

const getPaymentMethod = (order) => {
  const gateway = order.payment?.gateway;
  if (!gateway) return 'Not recorded';
  return gateway === 'bank' ? 'Bank Transfer' : 'Card';
};

const getProductsText = (order) => (
  order.items?.length
    ? order.items.map((item) => `${item.product?.name || 'Product'} x ${item.quantity}`).join(', ')
    : 'No products listed'
);

const getMapLink = (details) => {
  const query = [details.address, details.city, details.state].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

const getDispatchSummary = (order) => {
  const details = parseShippingAddress(order.shipping_address);

  return [
    `Customer Name: ${details.fullName || order.user?.name || 'Guest'}`,
    `Phone Number: ${details.phone || 'Not provided'}`,
    `Delivery Address: ${details.address || order.shipping_address || 'Not provided'}`,
    `Products Ordered: ${getProductsText(order)}`,
    `Quantity: ${(order.items || []).map((item) => item.quantity).join(', ') || 'Not listed'}`,
    `Order ID: ${order.order_number}`,
    `Google Maps: ${getMapLink(details)}`,
  ].join('\n');
};

const Shop = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryGroup, setDeliveryGroup] = useState('sun_wed');
  const [scheduling, setScheduling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dispatchOrder, setDispatchOrder] = useState(null);

  const fetchOrders = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await adminOrdersApi.getAll({
        deliveryDate,
        status: statusFilter,
        paymentMethod: paymentFilter,
      });
      setOrders(data);
    } catch (e) {
      console.error(e);
      toast(e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);
  }, [deliveryDate, statusFilter, paymentFilter]);

  useEffect(() => {
    const interval = window.setInterval(() => fetchOrders(), 15000);
    return () => window.clearInterval(interval);
  }, [deliveryDate, statusFilter, paymentFilter]);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return orders;

    return orders.filter((order) => {
      const details = parseShippingAddress(order.shipping_address);
      return [
        order.order_number,
        order.user?.name,
        details.fullName,
        details.phone,
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));
    });
  }, [orders, searchQuery]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updatedOrder = await adminOrdersApi.updateStatus(id, newStatus);
      setOrders((current) => current.map((order) => order.id === id ? updatedOrder : order));
      setSelectedOrder((current) => current?.id === id ? updatedOrder : current);
      setDispatchOrder((current) => current?.id === id ? updatedOrder : current);
      toast('Order status updated');
    } catch (e) {
      console.error(e);
      toast(e.message || 'Failed to update order status');
    }
  };

  const handleProceedDelivery = async () => {
    setScheduling(true);
    try {
      const result = await adminOrdersApi.scheduleDelivery(deliveryGroup);
      await fetchOrders();
      toast(`${result.count || 0} order${result.count === 1 ? '' : 's'} marked for delivery.`);
    } catch (e) {
      console.error(e);
      toast(e.message || 'Failed to update delivery schedule');
    } finally {
      setScheduling(false);
    }
  };

  const copyText = async (text, message) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(message);
    } catch (e) {
      console.error(e);
      toast('Copy failed. Please try again.');
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

      <section style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow)', padding: '16px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <div>
            <h2 style={{ color: 'var(--text-dark)', fontSize: '22px', margin: 0 }}>Recent Orders</h2>
            <p style={{ color: '#777', fontSize: '13px', margin: '4px 0 0' }}>Order history updates automatically every 15 seconds.</p>
          </div>
          <span style={{ color: 'var(--deep-pink)', fontWeight: 'bold', fontSize: '14px' }}>{filteredOrders.length} order{filteredOrders.length === 1 ? '' : 's'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, or order ID"
            style={{ flex: '1 1 240px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #eee', outline: 'none' }}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ flex: '1 1 180px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #eee', background: '#fff', color: 'var(--text-dark)' }}>
            <option value="">All Status</option>
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} style={{ flex: '1 1 180px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #eee', background: '#fff', color: 'var(--text-dark)' }}>
            <option value="">All Payment Methods</option>
            <option value="card">Card</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>
      </section>

      <div className="admin-orders-cards">
        {filteredOrders.map((order) => {
          const details = parseShippingAddress(order.shipping_address);
          return (
            <article
              key={order.id}
              className="admin-order-card"
              onClick={() => { setSelectedOrder(order); setDispatchOrder(null); }}
            >
              <div className="admin-order-card-header">
                <div>
                  <div className="admin-order-card-id">{order.order_number}</div>
                  <div className="admin-order-card-date">{formatDateTime(order.created_at)}</div>
                </div>
                <strong style={{ color: 'var(--deep-pink)', fontSize: '14px' }}>{formatMoney(order.total_amount)}</strong>
              </div>
              {[
                ['Customer', details.fullName || order.user?.name || 'Guest'],
                ['Phone', details.phone || 'Not provided'],
                ['Address', details.address || order.shipping_address || 'Not provided'],
                ['State', details.state || 'Not provided'],
                ['City', details.city || 'Not provided'],
                ['Products', getProductsText(order)],
                ['Payment', getPaymentMethod(order)],
              ].map(([label, value]) => (
                <div key={label} className="admin-order-card-row">
                  <span className="admin-order-card-label">{label}</span>
                  <span className="admin-order-card-value">{value}</span>
                </div>
              ))}
              <div className="admin-order-card-status" onClick={(e) => e.stopPropagation()}>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </article>
          );
        })}
        {filteredOrders.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#888', backgroundColor: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
            No orders found.
          </div>
        )}
      </div>

      <div className="admin-orders-table-wrap" style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1280px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--primary-pink)', color: 'var(--deep-pink)', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>Order ID</th>
              <th style={{ padding: '15px' }}>Date & Time</th>
              <th style={{ padding: '15px' }}>Customer</th>
              <th style={{ padding: '15px' }}>Phone</th>
              <th style={{ padding: '15px' }}>Address</th>
              <th style={{ padding: '15px' }}>State</th>
              <th style={{ padding: '15px' }}>City</th>
              <th style={{ padding: '15px' }}>Products</th>
              <th style={{ padding: '15px' }}>Total</th>
              <th style={{ padding: '15px' }}>Payment</th>
              <th style={{ padding: '15px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => {
              const details = parseShippingAddress(order.shipping_address);
              return (
                <tr key={order.id} onClick={() => { setSelectedOrder(order); setDispatchOrder(null); }} style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{order.order_number}</td>
                  <td style={{ padding: '15px' }}>{formatDateTime(order.created_at)}</td>
                  <td style={{ padding: '15px' }}>{details.fullName || order.user?.name || 'Guest'}</td>
                  <td style={{ padding: '15px' }}>{details.phone || 'Not provided'}</td>
                  <td style={{ padding: '15px', maxWidth: '220px' }}>{details.address || order.shipping_address || 'Not provided'}</td>
                  <td style={{ padding: '15px' }}>{details.state || 'Not provided'}</td>
                  <td style={{ padding: '15px' }}>{details.city || 'Not provided'}</td>
                  <td style={{ padding: '15px', maxWidth: '220px' }}>{getProductsText(order)}</td>
                  <td style={{ padding: '15px' }}>{formatMoney(order.total_amount)}</td>
                  <td style={{ padding: '15px' }}>{getPaymentMethod(order)}</td>
                  <td style={{ padding: '15px' }}>
                    <select
                      value={order.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{ padding: '8px', borderRadius: '5px', border: '1px solid var(--deep-pink)', backgroundColor: 'var(--light-bg)', color: 'var(--deep-pink)', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
            {filteredOrders.length === 0 && (
              <tr><td colSpan="11" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (() => {
        const details = parseShippingAddress(selectedOrder.shipping_address);
        const dispatchSummary = getDispatchSummary(selectedOrder);
        const mapLink = getMapLink(details);

        return (
          <div className="admin-order-modal-overlay" onClick={() => { setSelectedOrder(null); setDispatchOrder(null); }}>
            <div className="admin-order-modal" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <h2 style={{ color: 'var(--deep-pink)', margin: 0, fontSize: '24px' }}>Order Details</h2>
                  <p style={{ color: '#777', margin: '4px 0 0', fontSize: '13px' }}>{selectedOrder.order_number} - {formatDateTime(selectedOrder.created_at)}</p>
                </div>
                <button type="button" onClick={() => { setSelectedOrder(null); setDispatchOrder(null); }} style={{ border: 'none', background: 'transparent', color: 'var(--deep-pink)', cursor: 'pointer', fontSize: '22px', lineHeight: 1 }}>x</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                {[
                  ['Full Name', details.fullName || selectedOrder.user?.name || 'Guest'],
                  ['Phone Number', details.phone || 'Not provided'],
                  ['State', details.state || 'Not provided'],
                  ['City', details.city || 'Not provided'],
                  ['Delivery Address', details.address || selectedOrder.shipping_address || 'Not provided'],
                  ['Delivery Note', details.note || 'Not provided'],
                  ['Payment Method', getPaymentMethod(selectedOrder)],
                  ['Total Paid', formatMoney(selectedOrder.total_amount)],
                  ['Current Status', selectedOrder.status],
                ].map(([label, value]) => (
                  <div key={label} style={{ border: '1px solid rgba(233, 30, 99, 0.14)', borderRadius: '8px', padding: '12px', background: '#fff' }}>
                    <span style={{ display: 'block', color: '#888', fontSize: '12px', marginBottom: '5px' }}>{label}</span>
                    <strong style={{ color: 'var(--text-dark)', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{value}</strong>
                  </div>
                ))}
              </div>

              <div style={{ border: '1px solid rgba(233, 30, 99, 0.14)', borderRadius: '8px', padding: '12px', marginBottom: '18px' }}>
                <h3 style={{ color: 'var(--text-dark)', fontSize: '16px', margin: '0 0 10px' }}>Products Ordered</h3>
                {(selectedOrder.items || []).map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', padding: '8px 0', borderTop: '1px solid #f5f5f5' }}>
                    <span style={{ color: 'var(--text-dark)' }}>{item.product?.name || 'Product'}</span>
                    <strong style={{ color: 'var(--deep-pink)' }}>Qty: {item.quantity}</strong>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: dispatchOrder ? '14px' : 0 }}>
                <button type="button" className="view-btn" onClick={() => setDispatchOrder(selectedOrder)} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'var(--deep-pink)', color: '#fff', cursor: 'pointer' }}>
                  Generate Dispatch Details
                </button>
                <a href={mapLink} target="_blank" rel="noreferrer" className="view-btn" style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--deep-pink)', background: '#fff', color: 'var(--deep-pink)', textDecoration: 'none' }}>
                  Open Google Maps
                </a>
                <button type="button" className="view-btn" onClick={() => copyText(mapLink, 'Google Maps link copied')} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--deep-pink)', background: '#fff', color: 'var(--deep-pink)', cursor: 'pointer' }}>
                  Copy Map Link
                </button>
              </div>

              {dispatchOrder && (
                <div style={{ border: '1px solid rgba(233, 30, 99, 0.18)', borderRadius: '8px', padding: '12px', background: 'var(--light-bg)' }}>
                  <h3 style={{ color: 'var(--deep-pink)', fontSize: '16px', margin: '0 0 10px' }}>Dispatch Details</h3>
                  <textarea readOnly value={dispatchSummary} style={{ width: '100%', minHeight: '150px', resize: 'vertical', borderRadius: '8px', border: '1px solid var(--primary-pink)', padding: '10px', color: 'var(--text-dark)', background: '#fff' }} />
                  <button type="button" className="view-btn" onClick={() => copyText(dispatchSummary, 'Dispatch details copied')} style={{ marginTop: '10px', padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'var(--deep-pink)', color: '#fff', cursor: 'pointer' }}>
                    Copy Dispatch Details
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Shop;
