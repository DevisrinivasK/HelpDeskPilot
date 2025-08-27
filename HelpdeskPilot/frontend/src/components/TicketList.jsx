import { useState, useEffect } from 'react';
     import axios from 'axios';
     import { Link } from 'react-router-dom';

     function TicketList() {
       const [tickets, setTickets] = useState([]);
       const [error, setError] = useState('');
       const role = localStorage.getItem('role');

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
         <div className="min-h-screen bg-gray-100 p-6">
           <div className="max-w-4xl mx-auto">
             <h2 className="text-2xl font-bold mb-4 text-gray-800">My Tickets</h2>
             {role === 'user' && (
               <Link to="/create-ticket" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-700 transition">
                 Create New Ticket
               </Link>
             )}
             {error && <p className="text-red-500 mb-4">{error}</p>}
             <ul className="space-y-4">
               {tickets.map((ticket) => (
                 <li key={ticket._id} className="bg-white p-4 rounded-md shadow-md">
                   <span className="font-semibold text-gray-700">{ticket.title}</span> - {ticket.status} ({ticket.category})
                   {['admin', 'agent'].includes(role) && (
                     <Link to={`/tickets/${ticket._id}/audit`} className="ml-4 text-blue-600 hover:underline">
                       View Audit Logs
                     </Link>
                   )}
                 </li>
               ))}
             </ul>
           </div>
         </div>
       );
     }

     export default TicketList;