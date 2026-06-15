import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/PasswordInput';
import { adminAuthApi } from '../../services/adminApi';

const AdminLogin = () => {
  const [email, setEmail] = useState('admin@bloombody.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await adminAuthApi.login({ email, password });
      if (res.token) {
        localStorage.setItem('adminToken', res.token);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--light-bg)' }}>
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '15px', boxShadow: 'var(--shadow)', width: '100%', maxWidth: '400px', borderTop: '4px solid var(--deep-pink)' }}>
        <h1 style={{ textAlign: 'center', color: 'var(--text-dark)', marginBottom: '10px' }}>Bloom Body</h1>
        <p style={{ textAlign: 'center', color: 'var(--deep-pink)', marginBottom: '30px' }}>Admin Dashboard</p>

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-dark)' }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-dark)' }}>Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              inputStyle={{ width: '100%', padding: '10px 46px 10px 10px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' }}
            />
          </div>
          <button type="submit" className="view-btn" style={{ padding: '12px', border: 'none', backgroundColor: 'var(--deep-pink)', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', marginTop: '10px' }}>
            Secure Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
