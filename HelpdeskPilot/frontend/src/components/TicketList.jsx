import React, { useState, useEffect } from 'react';
     import axios from 'axios';
     import { useNavigate } from 'react-router-dom';

     const TicketList = () => {
       const [tickets, setTickets] = useState([]);
       const [error, setError] = useState('');
       const navigate = useNavigate();

       useEffect(() => {
         const fetchTickets = async () => {
           try {
             const token = localStorage.getItem('token');
             const response = await axios.get('http://localhost:8080/api/tickets', {
               headers: { Authorization: `Bearer ${token}` }
             });
             setTickets(response.data);
           } catch (err) {
             setError('Failed to fetch tickets');
             console.error(err);
           }
         };
         fetchTickets();
       }, []);

       const handleStatusUpdate = async (ticketId, status) => {
         try {
           const token = localStorage.getItem('token');
           await axios.post(
             `http://localhost:8080/api/tickets/${ticketId}/reply`,
             { status },
             { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
           );
           setTickets(tickets.map(t => t._id === ticketId ? { ...t, status } : t));
         } catch (err) {
           setError('Failed to update ticket status');
           console.error(err);
         }
       };

       return (
         <div className="container mx-auto p-4">
           <h2 className="text-2xl font-bold mb-4">Tickets</h2>
           {error && <p className="text-red-500">{error}</p>}
           <div className="grid gap-4">
             {tickets.map(ticket => (
               <div key={ticket._id} className="bg-white p-4 rounded shadow">
                 <h3 className="text-lg font-semibold">{ticket.title}</h3>
                 <p className="text-gray-600">{ticket.description}</p>
                 <p className="text-sm">Status: {ticket.status}</p>
                 <p className="text-sm">Category: {ticket.category}</p>
                 <button
                   className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                   onClick={() => navigate(`/tickets/${ticket._id}`)}
                 >
                   View Details
                 </button>
                 {localStorage.getItem('role') !== 'user' && (
                   <select
                     className="mt-2 border rounded p-2"
                     value={ticket.status}
                     onChange={(e) => handleStatusUpdate(ticket._id, e.target.value)}
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