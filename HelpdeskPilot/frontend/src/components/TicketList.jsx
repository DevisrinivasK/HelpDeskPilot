import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', category: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          navigate('/login');
          return;
        }
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const response = await axios.get(`${apiUrl}/api/tickets`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(response.data || []);
        setError(response.data.length === 0 ? 'No tickets found' : '');
      } catch (err) {
        const message = err.response?.data?.message || err.message;
        setError(`Failed to fetch tickets: ${message.includes('Network Error') ? 'Cannot reach server.' : message}`);
        console.error('Fetch tickets error:', err);
      }
    };
    fetchTickets();
  }, [navigate]);

  const handleStatusUpdate = async (ticketId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        navigate('/login');
        return;
      }
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      await axios.post(
        `${apiUrl}/api/tickets/${ticketId}/reply`,
        { status },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      setTickets(tickets.map(t => t._id === ticketId ? { ...t, status } : t));
      setError('');
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(`Failed to update ticket status: ${message.includes('Network Error') ? 'Cannot reach server.' : message}`);
      console.error('Status update error:', err);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const { title, description, category } = newTicket;
      if (!title || !description || !category) {
        setError('Title, description, and category are required');
        return;
      }
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication ticket found. Please log in.');
        navigate('/login');
        return;
      }
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await axios.post(
        `${apiUrl}/api/tickets`,
        { title, description, category },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      setTickets([...tickets, response.data]);
      setNewTicket({ title: '', description: '', category: '' });
      setShowCreateForm(false);
      setError('');
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(`Failed to create ticket: ${message.includes('Network Error') ? 'Cannot reach server.' : message}`);
      console.error('Create ticket error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 2rem)', padding: '1rem', position: 'relative' }}>
      <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', maxWidth: '48rem', width: '100%', padding: '1.5rem', position: 'relative', zIndex: 10 }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', background: 'linear-gradient(to right, #1e3a8a, #4c1d95)', padding: '1rem', borderRadius: '0.5rem 0.5rem 0 0', textAlign: 'center', marginBottom: '1.5rem' }}>Tickets</h2>
        {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }} role="alert">{error}</p>}
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ width: '100%', maxWidth: '15rem', margin: '0 auto 1rem auto', display: 'block' }}
        >
          {showCreateForm ? 'Cancel' : 'Create New Ticket'}
        </Button>
        {showCreateForm && (
          <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              value={newTicket.title}
              onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white', fontSize: '0.875rem', color: '#374151', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              placeholder="Title"
              required
              aria-label="Ticket title"
              onFocus={(e) => { e.target.style.borderColor = '#93c5fd'; e.target.style.boxShadow = '0 0 0 2px #93c5fd'; }}
              onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
            />
            <textarea
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white', fontSize: '0.875rem', color: '#374151', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              placeholder="Description"
              rows="4"
              required
              aria-label="Ticket description"
              onFocus={(e) => { e.target.style.borderColor = '#93c5fd'; e.target.style.boxShadow = '0 0 0 2px #93c5fd'; }}
              onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
            />
            <select
              value={newTicket.category}
              onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white', fontSize: '0.875rem', color: '#374151', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              required
              aria-label="Ticket category"
              onFocus={(e) => { e.target.style.borderColor = '#93c5fd'; e.target.style.boxShadow = '0 0 0 2px #93c5fd'; }}
              onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
            >
              <option value="">Select a category</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="account">Account</option>
            </select>
            <Button
              type="submit"
              style={{ width: '100%', maxWidth: '15rem', margin: '0 auto', display: 'block' }}
            >
              Create Ticket
            </Button>
          </form>
        )}
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))' }}>
          {tickets.map(ticket => (
            <div key={ticket._id} style={{ background: 'white', borderRadius: '0.375rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '0.5rem' }}>{ticket.title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>{ticket.description}</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Status: {ticket.status}</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Category: {ticket.category}</p>
              <Button
                onClick={() => navigate(`/tickets/${ticket._id}`)}
                style={{ width: '100%', marginTop: '0.75rem' }}
              >
                View Details
              </Button>
              {localStorage.getItem('role') !== 'user' && (
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusUpdate(ticket._id, e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white', fontSize: '0.875rem', color: '#374151', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                  onFocus={(e) => { e.target.style.borderColor = '#93c5fd'; e.target.style.boxShadow = '0 0 0 2px #93c5fd'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="waiting_human">Waiting Human</option>
                </select>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TicketList;