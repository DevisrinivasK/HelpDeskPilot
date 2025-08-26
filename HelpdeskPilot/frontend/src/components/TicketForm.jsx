import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function TicketForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:8080/api/tickets',
        { title, description, category },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      navigate('/tickets');
    } catch (err) {
      setError(`Failed to create ticket: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div>
      <h2>Create Ticket</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="billing">Billing</option>
          <option value="tech">Tech</option>
          <option value="shipping">Shipping</option>
          <option value="other">Other</option>
        </select>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default TicketForm;