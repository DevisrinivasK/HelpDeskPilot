import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/tickets', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTickets(res.data);
      } catch (err) {
        setError(`Failed to fetch tickets: ${err.response?.data?.message || err.message}`);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div>
      <h2>My Tickets</h2>
      <Link to="/create-ticket">Create New Ticket</Link>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {tickets.map((ticket) => (
          <li key={ticket._id}>
            {ticket.title} - {ticket.status} ({ticket.category})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TicketList;