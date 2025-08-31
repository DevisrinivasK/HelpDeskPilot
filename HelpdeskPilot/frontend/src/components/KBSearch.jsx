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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-80 h-80 bg-blue-800 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2 blur-sm"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-800 rounded-full opacity-30 translate-x-1/2 translate-y-1/2 blur-sm"></div>
      <div className="relative bg-white rounded-lg shadow-md max-w-4xl w-full p-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Knowledge Base Search</h2>
        <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 bg-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none flex-1"
            placeholder="Search articles (e.g., billing)"
            aria-label="Search knowledge base articles"
          />
          <Button
            type="submit"
            className="w-full sm:w-auto border-2 border-green-500 text-green-500 bg-transparent hover:bg-green-500 hover:text-white transition-colors duration-300 rounded-md py-2 text-sm font-bold focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            Search
          </Button>
        </form>
        {error && <p className="text-red-500 text-sm mb-4 text-center" role="alert">{error}</p>}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map(article => (
            <div key={article._id} className="bg-white p-4 rounded shadow-md border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">{article.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{article.body}</p>
              <p className="text-sm mt-1">Tags: {article.tags.join(', ')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KBSearch;