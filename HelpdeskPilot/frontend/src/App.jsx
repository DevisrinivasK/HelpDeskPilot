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
      <div style={{ background: '#c6dbef', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '20rem', height: '20rem', background: '#a3bffa', borderRadius: '9999px', opacity: 0.3, transform: 'translate(-50%, -50%)', filter: 'blur(1rem)' }}></div>
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '20rem', height: '20rem', background: '#7aa3cc', borderRadius: '9999px', opacity: 0.3, transform: 'translate(50%, 50%)', filter: 'blur(1rem)' }}></div>
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