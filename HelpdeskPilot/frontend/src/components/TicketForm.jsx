import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Button from './Button';

const TicketForm = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          navigate('/login');
          return;
        }
        if (!ticketId || !/^[0-9a-fA-F]{24}$/.test(ticketId)) {
          setError('Invalid ticket ID');
          navigate('/tickets');
          return;
        }
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const [ticketRes, auditRes] = await Promise.all([
          axios.get(`${apiUrl}/api/tickets/${ticketId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${apiUrl}/api/tickets/${ticketId}/audit`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        if (!ticketRes.data || !ticketRes.data._id) {
          throw new Error('Invalid ticket data received');
        }
        setTicket(ticketRes.data);
        setStatus(ticketRes.data.status);
        setAuditLogs(Array.isArray(auditRes.data) ? auditRes.data : []);
        setError('');
      } catch (err) {
        const message = err.response?.data?.message || err.message;
        setError(`Failed to fetch ticket or audit logs: ${message.includes('Network Error') ? 'Cannot reach server.' : message}`);
        console.error('Fetch ticket/audit error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [ticketId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!reply.trim() && !status) {
        setError('Reply or status update required');
        return;
      }
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        navigate('/login');
        return;
      }
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const payload = {};
      if (reply.trim()) payload.reply = reply.trim();
      if (status && status !== ticket.status) payload.status = status;
      if (Object.keys(payload).length === 0) {
        setError('No changes to submit');
        return;
      }
      const response = await axios.post(
        `${apiUrl}/api/tickets/${ticketId}/reply`,
        payload,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      setTicket(response.data);
      setReply('');
      setStatus(response.data.status);
      setError('');
      const auditRes = await axios.get(`${apiUrl}/api/tickets/${ticketId}/audit`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuditLogs(Array.isArray(auditRes.data) ? auditRes.data : []);
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(`Failed to submit reply/status: ${message.includes('Network Error') ? 'Cannot reach server.' : message}`);
      console.error('Submit error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-800 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2 blur-sm"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-800 rounded-full opacity-30 translate-x-1/2 translate-y-1/2 blur-sm"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-500"></div>
      </div>
    );
  }

  if (!ticket && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-800 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2 blur-sm"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-800 rounded-full opacity-30 translate-x-1/2 translate-y-1/2 blur-sm"></div>
        <div className="bg-white rounded-lg shadow-md max-w-md w-full p-6 text-center">
          <p className="text-red-500 text-sm mb-4" role="alert">{error}</p>
          <Button
            className="w-full border-2 border-green-500 text-green-500 bg-transparent hover:bg-green-500 hover:text-white transition-colors duration-300 rounded-md py-2 text-sm font-bold focus:ring-2 focus:ring-green-500 focus:outline-none"
            onClick={() => navigate('/tickets')}
          >
            Back to Tickets
          </Button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-800 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2 blur-sm"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-800 rounded-full opacity-30 translate-x-1/2 translate-y-1/2 blur-sm"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-80 h-80 bg-blue-800 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2 blur-sm"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-800 rounded-full opacity-30 translate-x-1/2 translate-y-1/2 blur-sm"></div>
      <div className="relative bg-white rounded-lg shadow-md max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Ticket: {ticket.title}</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center" role="alert">{error}</p>}
        <div className="bg-gray-50 p-4 rounded shadow-md border border-gray-200 mb-6">
          <p className="text-sm text-gray-700"><strong className="font-semibold">Description:</strong> {ticket.description}</p>
          <p className="text-sm text-gray-700"><strong className="font-semibold">Category:</strong> {ticket.category}</p>
          <p className="text-sm text-gray-700"><strong className="font-semibold">Status:</strong> {ticket.status}</p>
          <p className="text-sm text-gray-700"><strong className="font-semibold">Created By:</strong> {ticket.createdBy?.email || 'Unknown'}</p>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Audit Logs</h3>
          {Array.isArray(auditLogs) && auditLogs.length === 0 ? (
            <p className="text-gray-600 text-sm">No audit logs available</p>
          ) : (
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {Array.isArray(auditLogs) && auditLogs.map((log) => (
                <li key={log._id}>{log.action} by {log.actor} at {new Date(log.timestamp).toLocaleString()}</li>
              ))}
            </ul>
          )}
        </div>
        {localStorage.getItem('role') !== 'user' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition-colors"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Enter your reply..."
              rows="4"
              aria-label="Reply to ticket"
            />
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition-colors"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Update ticket status"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="waiting_human">Waiting Human</option>
            </select>
            <Button
              type="submit"
              className="w-full border-2 border-green-500 text-green-500 bg-transparent hover:bg-green-500 hover:text-white transition-colors duration-300 rounded-md py-2 text-sm font-bold focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
              Submit Reply/Status
            </Button>
          </form>
        )}
        <Button
          className="mt-4 w-full border-2 border-green-500 text-green-500 bg-transparent hover:bg-green-500 hover:text-white transition-colors duration-300 rounded-md py-2 text-sm font-bold focus:ring-2 focus:ring-green-500 focus:outline-none"
          onClick={() => navigate('/tickets')}
        >
          Back to Tickets
        </Button>
      </div>
    </div>
  );
};

export default TicketForm;