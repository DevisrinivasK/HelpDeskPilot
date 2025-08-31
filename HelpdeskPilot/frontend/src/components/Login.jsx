import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      setError('');
      navigate('/tickets');
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(`Login failed: ${message.includes('Network Error') ? 'Cannot reach server.' : message}`);
      console.error('Login error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 2rem)', padding: '1rem', position: 'relative', background: '#c6dbef' }}>
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '5rem', height: '5rem', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '50%', animation: 'pulse 4s infinite' }}></div>
      <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', maxWidth: '28rem', width: '100%', padding: '1.5rem', position: 'relative', zIndex: 10 }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', background: 'linear-gradient(to right, #1e3a8a, #4c1d95)', padding: '1rem', borderRadius: '0.5rem 0.5rem 0 0', textAlign: 'center', marginBottom: '1.5rem', transition: 'transform 0.3s' }} onMouseOver={(e) => { e.target.style.transform = 'scale(1.02)'; }} onMouseOut={(e) => { e.target.style.transform = 'scale(1)'; }}>Login</h2>
        <p style={{ color: 'white', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1.5rem', fontStyle: 'italic' }}>Please enter your Login and your Password</p>
        {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }} role="alert" aria-live="assertive">{error}</p>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white', fontSize: '0.875rem', color: '#374151', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s' }}
            placeholder="Username or E-mail"
            required
            aria-label="Username or E-mail"
            onFocus={(e) => { e.target.style.borderColor = '#93c5fd'; e.target.style.boxShadow = '0 0 0 2px #93c5fd'; e.target.style.transform = 'scale(1.01)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; e.target.style.transform = 'scale(1)'; }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white', fontSize: '0.875rem', color: '#374151', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s' }}
            placeholder="Password"
            required
            aria-label="Password"
            onFocus={(e) => { e.target.style.borderColor = '#93c5fd'; e.target.style.boxShadow = '0 0 0 2px #93c5fd'; e.target.style.transform = 'scale(1.01)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; e.target.style.transform = 'scale(1)'; }}
          />
          <button
            type="submit"
            style={{ width: '100%', padding: '0.5rem', border: '2px solid #22c55e', color: '#22c55e', background: 'transparent', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.3s, color 0.3s, transform 0.3s', outline: 'none' }}
            onMouseOver={(e) => { e.target.style.backgroundColor = '#22c55e'; e.target.style.color = 'white'; e.target.style.transform = 'scale(1.05)'; }}
            onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#22c55e'; e.target.style.transform = 'scale(1)'; }}
          >
            Login
          </button>
        </form>
      </div>
      <style>
        {`@keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }`}
      </style>
    </div>
  );
};

export default Login;