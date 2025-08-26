import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import TicketList from './components/TicketList';
import TicketForm from './components/TicketForm';
import KBSearch from './components/KBSearch';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Smart Helpdesk</h1>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/tickets" element={<TicketList />} />
          <Route path="/create-ticket" element={<TicketForm />} />
          <Route path="/kb" element={<KBSearch />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;