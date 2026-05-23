import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { adminAuthApi } from '../../services/adminApi';
import Logo from '../../assets/bloom-logo.png';
import './AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await adminAuthApi.logout();
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem("adminToken");
      navigate("/admin/login");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--light-bg)', fontFamily: 'var(--sans)' }}>
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ width: '250px', backgroundColor: '#fff', borderRight: '2px solid var(--primary-pink)', padding: '20px 0', display: 'flex', flexDirection: 'column' }}>
        <div className="admin-sidebar-brand">
          <img src={Logo} alt="Bloom Body Logo" />
          <h2 style={{ color: 'var(--deep-pink)', textAlign: 'center', margin: 0, fontSize: '28px' }}>Bloom Body</h2>
        </div>
        <hr className="admin-sidebar-divider" />
        
        <nav className="admin-sidebar-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
          <NavLink to="/admin/dashboard" style={({isActive}) => ({
            padding: '13px 20px', borderRadius: 0, textDecoration: 'none', display: 'block', width: '100%',
            backgroundColor: isActive ? 'var(--primary-pink)' : 'transparent',
            color: isActive ? 'var(--deep-pink)' : 'var(--text-dark)',
            fontWeight: isActive ? 'bold' : 'normal', transition: 'all 0.3s'
          })}>Dashboard</NavLink>

          <NavLink to="/admin/products" style={({isActive}) => ({
            padding: '13px 20px', borderRadius: 0, textDecoration: 'none', display: 'block', width: '100%',
            backgroundColor: isActive ? 'var(--primary-pink)' : 'transparent',
            color: isActive ? 'var(--deep-pink)' : 'var(--text-dark)',
            fontWeight: isActive ? 'bold' : 'normal', transition: 'all 0.3s'
          })}>Products</NavLink>

          <NavLink to="/admin/notifications" style={({isActive}) => ({
            padding: '13px 20px', borderRadius: 0, textDecoration: 'none', display: 'block', width: '100%',
            backgroundColor: isActive ? 'var(--primary-pink)' : 'transparent',
            color: isActive ? 'var(--deep-pink)' : 'var(--text-dark)',
            fontWeight: isActive ? 'bold' : 'normal', transition: 'all 0.3s'
          })}>Notifications</NavLink>

          <NavLink to="/admin/shop" style={({isActive}) => ({
            padding: '13px 20px', borderRadius: 0, textDecoration: 'none', display: 'block', width: '100%',
            backgroundColor: isActive ? 'var(--primary-pink)' : 'transparent',
            color: isActive ? 'var(--deep-pink)' : 'var(--text-dark)',
            fontWeight: isActive ? 'bold' : 'normal', transition: 'all 0.3s'
          })}>Shop (Orders)</NavLink>
        </nav>

        <hr className="admin-sidebar-divider" />
        <button onClick={handleLogout} className="delete-btn admin-logout" style={{ margin: 0, padding: '10px', backgroundColor: '#fff', color: 'var(--deep-pink)', borderRadius: 0,  border: '1px solid rgba(233, 30, 99, 0.18)', cursor: 'pointer' }}>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
