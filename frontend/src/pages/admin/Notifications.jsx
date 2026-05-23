import React, { useEffect, useState } from 'react';
import { adminNotificationsApi } from '../../services/adminApi';

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', message: '', type: 'toast', image: '' });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await adminNotificationsApi.getAll();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminNotificationsApi.create(formData);
      setFormData({ title: '', message: '', type: 'toast', image: '' });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMediaUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const image = await fileToDataUrl(file);
    setFormData((current) => ({ ...current, image }));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this notification?")) {
      try {
        await adminNotificationsApi.delete(id);
        fetchNotifications();
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div>
      <h1 style={{ color: 'var(--deep-pink)', fontSize: '32px', marginBottom: '30px' }}>Notification Center</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
        
        {/* Create Notification Form */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow)', height: 'fit-content' }}>
          <h2 style={{ fontSize: '20px', color: 'var(--text-dark)', marginBottom: '20px' }}>Create New Notification</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder="Notification Title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <textarea placeholder="Message Body" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', minHeight: '80px' }}></textarea>
            
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
              <option value="toast">Toast Message (Frontend)</option>
              <option value="banner">Image Banner</option>
              <option value="video">Video Notification</option>
            </select>
            
            {(formData.type === 'banner' || formData.type === 'video') && (
              <>
                <input type="text" placeholder="Media URL (Image/Video)" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                <input type="file" accept={formData.type === 'video' ? 'video/*' : 'image/*'} onChange={handleMediaUpload} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: 'var(--light-bg)' }} />
              </>
            )}

            <div style={{ border: '1px solid var(--primary-pink)', backgroundColor: 'var(--light-bg)', borderRadius: '8px', padding: '12px' }}>
              <h3 style={{ color: 'var(--deep-pink)', marginBottom: '8px', fontSize: '16px' }}>Preview</h3>
              <p style={{ color: 'var(--text-dark)', fontWeight: 'bold' }}>{formData.title || 'Notification title'}</p>
              <p style={{ color: '#555', fontSize: '14px', marginTop: '4px' }}>{formData.message || 'Message preview will appear here.'}</p>
              {formData.type === 'banner' && formData.image && <img src={formData.image} alt="Notification preview" style={{ width: '100%', marginTop: '10px', borderRadius: '8px', maxHeight: '160px', objectFit: 'cover' }} />}
              {formData.type === 'video' && formData.image && <video src={formData.image} controls style={{ width: '100%', marginTop: '10px', borderRadius: '8px', maxHeight: '180px' }} />}
            </div>

            <button type="submit" className="view-btn" style={{ padding: '12px', border: 'none', backgroundColor: 'var(--deep-pink)', color: '#fff', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}>
              Send Notification
            </button>
          </form>
        </div>

        {/* Notification History */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
          <h2 style={{ fontSize: '20px', color: 'var(--text-dark)', marginBottom: '20px' }}>Active Notifications History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {notifications.map(notif => (
              <div key={notif.id} style={{ padding: '15px', border: '1px solid var(--primary-pink)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: 'var(--light-bg)' }}>
                <div>
                  <h3 style={{ fontWeight: 'bold', color: 'var(--deep-pink)', marginBottom: '5px' }}>{notif.title}</h3>
                  <p style={{ fontSize: '14px', color: '#555' }}>{notif.message}</p>
                  {notif.type === 'banner' && notif.image && <img src={notif.image} alt={notif.title} style={{ width: '160px', marginTop: '10px', borderRadius: '8px', objectFit: 'cover' }} />}
                  {notif.type === 'video' && notif.image && <video src={notif.image} controls style={{ width: '180px', marginTop: '10px', borderRadius: '8px' }} />}
                  <span style={{ display: 'inline-block', marginTop: '10px', fontSize: '12px', padding: '3px 8px', backgroundColor: '#e0e0e0', borderRadius: '20px' }}>Type: {notif.type}</span>
                </div>
                <button onClick={() => handleDelete(notif.id)} style={{ padding: '5px 10px', backgroundColor: 'transparent', color: '#f44336', border: '1px solid #f44336', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
              </div>
            ))}
            {notifications.length === 0 && <p style={{ color: '#888' }}>No active notifications.</p>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Notifications;
