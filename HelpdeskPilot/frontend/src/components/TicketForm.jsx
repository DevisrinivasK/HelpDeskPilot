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
        if (!ticketId.match(/^[0-9a-fA-F]{24}$/)) {
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
        setAuditLogs(auditRes.data || []);
        setError('');
      } catch (err) {
        const message = err.response?.data?.message || err.message;
        setError(`Failed to fetch ticket or audit logs: ${message.includes('Network Error') ? 'Cannot reach server. Check if backend is running.' : message}`);
        console.error('Fetch ticket/audit error:', err);
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
      // Refresh audit logs
      const auditRes = await axios.get(`${apiUrl}/api/tickets/${ticketId}/audit`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuditLogs(auditRes.data || []);
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(`Failed to submit reply/status: ${message.includes('Network Error') ? 'Cannot reach server.' : message}`);
      console.error('Submit error:', err);
    }
  };

  if (!ticket && error) {
    return (
      <div className="container mx-auto p-4 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <p className="text-red-500 text-sm text-center" role="alert">{error}</p>
        <Button className="mt-2 w-full" onClick={() => navigate('/tickets')}>
          Back to Tickets
        </Button>
      </div>
    );
  }

  if (!ticket) return <div className="text-center text-gray-600">Loading...</div>;

  return (
    <div className="container mx-auto p-4 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
      <h2 className="text-2xl font-bold mb-4 text-center md:text-3xl">Ticket: {ticket.title}</h2>
      {error && <p className="text-red-500 text-sm mb-4 text-center" role="alert">{error}</p>}
      <div className="bg-white p-4 rounded shadow-md border border-gray-200">
        <p className="text-sm"><strong>Description:</strong> {ticket.description}</p>
        <p className="text-sm"><strong>Category:</strong> {ticket.category}</p>
        <p className="text-sm"><strong>Status:</strong> {ticket.status}</p>
        <p className="text-sm"><strong>Created By:</strong> {ticket.createdBy?.email || 'Unknown'}</p>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Audit Logs</h3>
        {auditLogs.length === 0 ? (
          <p className="text-gray-600 text-sm">No audit logs available</p>
        ) : (
          <ul className="list-disc pl-5 text-sm space-y-2">
            {auditLogs.map(log => (
              <li key={log._id} className="text-gray-700">
                {log.action} by {log.actor} at {new Date(log.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
      {localStorage.getItem('role') !== 'user' && (
        <form onSubmit={handleSubmit} className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Add Reply or Update Status</h3>
          <textarea
            className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Enter your reply..."
            rows="4"
            aria-label="Reply to ticket"
          />
          <select
            className="mt-2 w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Update ticket status"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="waiting_human">Waiting Human</option>
          </select>
          <Button type="submit" className="mt-2 w-full">
            Submit Reply/Status
          </Button>
        </form>
      )}
      <Button className="mt-4 w-full" onClick={() => navigate('/tickets')}>
        Back to Tickets
      </Button>
    </div>
  );
};

export default TicketForm;