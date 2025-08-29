import React, { useEffect, useState } from 'react';
     import io from 'socket.io-client';

     const socket = io('http://localhost:8080', { autoConnect: true });

     const Notification = () => {
       const [notifications, setNotifications] = useState([]);

       useEffect(() => {
         socket.on('ticketCreated', (ticket) => {
           setNotifications(prev => [...prev, `New ticket: ${ticket.title}`]);
         });
         socket.on('ticketUpdated', (ticket) => {
           setNotifications(prev => [...prev, `Ticket updated: ${ticket.title} (${ticket.status})`]);
         });
         return () => {
           socket.off('ticketCreated');
           socket.off('ticketUpdated');
         };
       }, []);

       return (
         <div className="fixed top-4 right-4 space-y-2">
           {notifications.map((msg, index) => (
             <div key={index} className="bg-green-500 text-white p-2 rounded shadow">
               {msg}
             </div>
           ))}
         </div>
       );
     };

     export default Notification;