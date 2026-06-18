import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { adminAuthApi } from '../../services/adminApi';
import Logo from '../../assets/bloom-logo.png';
import Toast from '../Toast';
import './AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
    <div className="admin-layout-container">
      {/* Mobile top bar toggle button */}
      <div className="admin-mobile-bar">
        <button className="admin-mobile-toggle" onClick={() => setIsMobileOpen(true)} aria-label="Toggle navigation menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <span className="admin-mobile-title">Bloom Body Admin</span>
      </div>

      {/* Backdrop for mobile */}
      {isMobileOpen && <div className="admin-sidebar-overlay" onClick={() => setIsMobileOpen(false)}></div>}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <img src={Logo} alt="Bloom Body Logo" />
          {!isCollapsed && <h2>Bloom Body</h2>}
        </div>
        <hr className="admin-sidebar-divider" />
        
        <nav className="admin-sidebar-nav">
          <NavLink to="/admin/dashboard" onClick={() => setIsMobileOpen(false)} className="admin-nav-item">
            <i className="fas fa-chart-line"></i>
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink to="/admin/products" onClick={() => setIsMobileOpen(false)} className="admin-nav-item">
            <i className="fas fa-box"></i>
            {!isCollapsed && <span>Products</span>}
          </NavLink>

          <NavLink to="/admin/notifications" onClick={() => setIsMobileOpen(false)} className="admin-nav-item">
            <i className="fas fa-bell"></i>
            {!isCollapsed && <span>Notifications</span>}
          </NavLink>

          <NavLink to="/admin/shop" onClick={() => setIsMobileOpen(false)} className="admin-nav-item">
            <i className="fas fa-shopping-bag"></i>
            {!isCollapsed && <span>Shop (Orders)</span>}
          </NavLink>
        </nav>

        {/* Collapse Toggle Button (only on desktop) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="admin-collapse-toggle-btn"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'}`}></i>
        </button>

        <hr className="admin-sidebar-divider" />
        <button onClick={handleLogout} className="delete-btn admin-logout">
          <i className="fas fa-sign-out-alt"></i>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        <Outlet />
      </main>
      <Toast />
    </div>
  );
};

export default AdminLayout;
