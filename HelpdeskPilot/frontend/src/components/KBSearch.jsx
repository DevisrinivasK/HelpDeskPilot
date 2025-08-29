import React, { useState } from 'react';
     import axios from 'axios';

     const KBSearch = () => {
       const [query, setQuery] = useState('');
       const [articles, setArticles] = useState([]);
       const [error, setError] = useState('');

       const handleSearch = async (e) => {
         e.preventDefault();
         try {
           const token = localStorage.getItem('token');
           const response = await axios.get(`http://localhost:8080/api/kb?query=${query}`, {
             headers: { Authorization: `Bearer ${token}` }
           });
           setArticles(response.data);
           setError('');
         } catch (err) {
           setError('Failed to search articles');
           console.error(err);
         }
       };

       return (
         <div className="container mx-auto p-4">
           <h2 className="text-2xl font-bold mb-4">Knowledge Base Search</h2>
           <form onSubmit={handleSearch} className="mb-4">
             <input
               type="text"
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               className="border rounded p-2 w-full md:w-1/2"
               placeholder="Search articles (e.g., billing)"
             />
             <button
               type="submit"
               className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
             >
               Search
             </button>
           </form>
           {error && <p className="text-red-500">{error}</p>}
           <div className="grid gap-4">
             {articles.map(article => (
               <div key={article._id} className="bg-white p-4 rounded shadow">
                 <h3 className="text-lg font-semibold">{article.title}</h3>
                 <p className="text-gray-600">{article.body}</p>
                 <p className="text-sm">Tags: {article.tags.join(', ')}</p>
               </div>
             ))}
           </div>
         </div>
       );
     };

     export default KBSearch;