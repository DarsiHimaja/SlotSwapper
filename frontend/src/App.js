import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Calendar from './pages/Calendar';
import Marketplace from './pages/Marketplace';
import Requests from './pages/Requests';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token]);

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <Login setToken={setToken} setUser={setUser} />;
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} logout={logout} />
        <div className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/calendar" />} />
            <Route path="/calendar" element={<Calendar token={token} />} />
            <Route path="/marketplace" element={<Marketplace token={token} />} />
            <Route path="/requests" element={<Requests token={token} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;