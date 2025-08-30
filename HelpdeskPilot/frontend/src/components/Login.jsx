import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        email,
        password
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      setError('');
      navigate('/tickets');
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(`Login failed: ${message.includes('Network Error') ? 'Cannot reach server. Check if backend is running.' : message}`);
      console.error('Login error:', err);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md sm:max-w-lg">
      <h2 className="text-2xl font-bold mb-4 text-center md:text-3xl">Login</h2>
      {error && <p className="text-red-500 text-sm mb-4 text-center" role="alert">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter your email"
            required
            aria-label="Email address"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter your password"
            required
            aria-label="Password"
          />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
    </div>
  );
};

export default Login;