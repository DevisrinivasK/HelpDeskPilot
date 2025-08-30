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
        setError(`Failed to fetch tickets: ${message.includes('Network Error') ? 'Cannot reach server. Check if backend is running.' : message}`);
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
        setError('No authentication token found. Please log in.');
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
    <div className="container mx-auto p-4 max-w-4xl">
      <h2 className="text-2xl font-bold mb-4 text-center md:text-3xl">Tickets</h2>
      {error && <p className="text-red-500 text-sm mb-4 text-center" role="alert">{error}</p>}
      <Button
        className="mb-4 w-full sm:w-auto"
        onClick={() => setShowCreateForm(!showCreateForm)}
        aria-label={showCreateForm ? 'Cancel ticket creation' : 'Create new ticket'}
      >
        {showCreateForm ? 'Cancel' : 'Create New Ticket'}
      </Button>
      {showCreateForm && (
        <form onSubmit={handleCreateTicket} className="bg-white p-4 rounded shadow-md border border-gray-200 mb-4">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              id="title"
              type="text"
              value={newTicket.title}
              onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
              className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter ticket title"
              required
              aria-label="Ticket title"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter ticket description"
              rows="4"
              required
              aria-label="Ticket description"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category"
              value={newTicket.category}
              onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
              className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              aria-label="Ticket category"
            >
              <option value="">Select a category</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="account">Account</option>
            </select>
          </div>
          <Button type="submit" className="w-full">
            Create Ticket
          </Button>
        </form>
      )}
      {tickets.length === 0 && !error && <p className="text-gray-600 text-center">No tickets available</p>}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {tickets.map(ticket => (
          <div key={ticket._id} className="bg-white p-4 rounded shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">{ticket.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{ticket.description}</p>
            <p className="text-sm mt-1">Status: {ticket.status}</p>
            <p className="text-sm">Category: {ticket.category}</p>
            <Button
              className="mt-2 w-full"
              onClick={() => navigate(`/tickets/${ticket._id}`)}
              aria-label={`View details for ticket ${ticket.title}`}
            >
              View Details
            </Button>
            {localStorage.getItem('role') !== 'user' && (
              <select
                className="mt-2 w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={ticket.status}
                onChange={(e) => handleStatusUpdate(ticket._id, e.target.value)}
                aria-label={`Update status for ticket ${ticket.title}`}
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
  );
};

export default TicketList;