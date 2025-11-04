import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ user, logout }) {
  return (
    <nav className="navbar">
      <h1>SlotSwapper</h1>
      <ul className="nav-links">
        <li><Link to="/calendar">My Calendar</Link></li>
        <li><Link to="/marketplace">Marketplace</Link></li>
        <li><Link to="/requests">Requests</Link></li>
        <li>
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="btn" style={{ marginLeft: '1rem' }}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;