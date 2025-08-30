import React, { useState } from 'react';
import axios from 'axios';
import Button from './Button';

const KBSearch = () => {
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await axios.get(`${apiUrl}/api/kb?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArticles(response.data);
      setError('');
    } catch (err) {
      setError('Failed to search articles');
      console.error('Search error:', err);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h2 className="text-2xl font-bold mb-4 text-center md:text-3xl">Knowledge Base Search</h2>
      <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded p-2 text-sm w-full sm:w-1/2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Search articles (e.g., billing)"
          aria-label="Search knowledge base articles"
        />
        <Button type="submit" className="sm:w-auto">
          Search
        </Button>
      </form>
      {error && <p className="text-red-500 text-sm mb-4 text-center" role="alert">{error}</p>}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map(article => (
          <div key={article._id} className="bg-white p-4 rounded shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">{article.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{article.body}</p>
            <p className="text-sm mt-1">Tags: {article.tags.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KBSearch;