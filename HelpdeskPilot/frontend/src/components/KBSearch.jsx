import { useState } from 'react';
import axios from 'axios';

function KBSearch() {
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`http://localhost:8080/api/kb?query=${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setArticles(res.data);
    } catch (err) {
      setError(`Failed to search KB: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div>
      <h2>Knowledge Base Search</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search KB..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {articles.map((article) => (
          <li key={article._id}>
            {article.title} - {article.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default KBSearch;