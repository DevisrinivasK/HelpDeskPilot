import React from 'react';
     import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
     import TicketList from './components/TicketList';
     import TicketForm from './components/TicketForm';
     import Login from './components/Login';
     import KBSearch from './components/KBSearch';
     import Notification from './components/Notification';

     const App = () => {
       return (
         <Router>
           <div className="min-h-screen bg-gray-100">
             <Notification />
             <Routes>
               <Route path="/login" element={<Login />} />
               <Route path="/tickets" element={<TicketList />} />
               <Route path="/tickets/:ticketId" element={<TicketForm />} />
               <Route path="/kb" element={<KBSearch />} />
               <Route path="/" element={<Login />} />
             </Routes>
           </div>
         </Router>
       );
     };

     export default App;