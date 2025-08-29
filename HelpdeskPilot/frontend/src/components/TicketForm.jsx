import React, { useState, useEffect } from 'react';
     import axios from 'axios';
     import { useParams, useNavigate } from 'react-router-dom';

     const TicketForm = () => {
       const { ticketId } = useParams();
       const [ticket, setTicket] = useState(null);
       const [auditLogs, setAuditLogs] = useState([]);
       const [reply, setReply] = useState('');
       const [error, setError] = useState('');
       const navigate = useNavigate();

       useEffect(() => {
         const fetchTicket = async () => {
           try {
             const token = localStorage.getItem('token');
             const [ticketRes, auditRes] = await Promise.all([
               axios.get(`http://localhost:8080/api/tickets/${ticketId}`, {
                 headers: { Authorization: `Bearer ${token}` }
               }),
               axios.get(`http://localhost:8080/api/tickets/${ticketId}/audit`, {
                 headers: { Authorization: `Bearer ${token}` }
               })
             ]);
             setTicket(ticketRes.data);
             setAuditLogs(auditRes.data);
           } catch (err) {
             setError('Failed to fetch ticket or audit logs');
             console.error(err);
           }
         };
         fetchTicket();
       }, [ticketId]);

       const handleReply = async () => {
         try {
           const token = localStorage.getItem('token');
           await axios.post(
             `http://localhost:8080/api/tickets/${ticketId}/reply`,
             { reply, status: ticket.status },
             { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
           );
           setReply('');
           navigate('/tickets');
         } catch (err) {
           setError('Failed to submit reply');
           console.error(err);
         }
       };

       if (!ticket) return <div>Loading...</div>;

       return (
         <div className="container mx-auto p-4">
           <h2 className="text-2xl font-bold mb-4">Ticket: {ticket.title}</h2>
           {error && <p className="text-red-500">{error}</p>}
           <div className="bg-white p-4 rounded shadow">
             <p><strong>Description:</strong> {ticket.description}</p>
             <p><strong>Category:</strong> {ticket.category}</p>
             <p><strong>Status:</strong> {ticket.status}</p>
           </div>
           <div className="mt-4">
             <h3 className="text-lg font-semibold">Audit Logs</h3>
             <ul className="list-disc pl-5">
               {auditLogs.map(log => (
                 <li key={log._id}>
                   {log.action} by {log.actor} at {new Date(log.timestamp).toLocaleString()}
                 </li>
               ))}
             </ul>
           </div>
           {localStorage.getItem('role') !== 'user' && (
             <div className="mt-4">
               <h3 className="text-lg font-semibold">Add Reply</h3>
               <textarea
                 className="w-full border rounded p-2"
                 value={reply}
                 onChange={(e) => setReply(e.target.value)}
                 placeholder="Enter your reply..."
               />
               <button
                 className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                 onClick={handleReply}
               >
                 Submit Reply
               </button>
             </div>
           )}
         </div>
       );
     };

     export default TicketForm;