const { useState, useEffect, useCallback } = React;
const { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } = ReactRouterDOM;

// API Configuration
const API_URL = '';

// Auth Context
const AuthContext = React.createContext();

// Login Component
function Login({ setToken, setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Network error');
    }
  };

  return (
    <div className="auth-form">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      {isLogin && (
        <div className="demo-box">
          <h4>Demo Credentials</h4>
          <p><strong>Email:</strong> demo@gmail.com</p>
          <p><strong>Password:</strong> demo123</p>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
        )}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn">
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem', color: '#cbd5e1' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer' }}
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </div>
  );
}

// Navbar Component
function Navbar({ user, logout }) {
  return (
    <nav className="navbar">
      <h1>SlotSwapper</h1>
      <ul className="nav-links">
        <li><Link to="/calendar">My Calendar</Link></li>
        <li><Link to="/marketplace">Marketplace</Link></li>
        <li><Link to="/requests">Requests</Link></li>
        <li>
          <span style={{ color: '#cbd5e1', marginRight: '1rem' }}>Welcome, {user?.name}</span>
          <button onClick={logout} className="btn" style={{ padding: '0.5rem 1rem' }}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

// Calendar Component
function Calendar({ token }) {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    status: 'BUSY'
  });

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setFormData({ title: '', startTime: '', endTime: '', status: 'BUSY' });
        setShowForm(false);
        fetchEvents();
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const toggleSwappable = async (eventId, currentStatus) => {
    const newStatus = currentStatus === 'SWAPPABLE' ? 'BUSY' : 'SWAPPABLE';
    try {
      await fetch(`${API_URL}/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await fetch(`${API_URL}/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>My Calendar</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn">
          {showForm ? 'Cancel' : 'Add Event'}
        </button>
      </div>

      {showForm && (
        <div className="event-card" style={{ marginBottom: '2rem' }}>
          <h3>Create New Event</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn">Create Event</button>
          </form>
        </div>
      )}

      <div className="grid">
        {events.map(event => (
          <div key={event.id} className="event-card">
            <div className="event-header">
              <h3>{event.title}</h3>
              <span className={`status-badge status-${event.status.toLowerCase()}`}>
                {event.status}
              </span>
            </div>
            <p style={{ color: '#cbd5e1', marginBottom: '0.5rem' }}>
              <strong>Start:</strong> {new Date(event.startTime).toLocaleString()}
            </p>
            <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>
              <strong>End:</strong> {new Date(event.endTime).toLocaleString()}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {event.status !== 'SWAP_PENDING' && (
                <button
                  onClick={() => toggleSwappable(event.id, event.status)}
                  className={`btn ${event.status === 'SWAPPABLE' ? 'btn-danger' : 'btn-success'}`}
                >
                  {event.status === 'SWAPPABLE' ? 'Remove from Swap' : 'Make Swappable'}
                </button>
              )}
              <button onClick={() => deleteEvent(event.id)} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Marketplace Component
function Marketplace({ token }) {
  const [swappableSlots, setSwappableSlots] = useState([]);
  const [myEvents, setMyEvents] = useState([]);

  const fetchSwappableSlots = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/swappable-slots`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSwappableSlots(data);
    } catch (error) {
      console.error('Error fetching swappable slots:', error);
    }
  }, [token]);

  const fetchMyEvents = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMyEvents(data.filter(event => event.status === 'SWAPPABLE'));
    } catch (error) {
      console.error('Error fetching my events:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchSwappableSlots();
    fetchMyEvents();
  }, [fetchSwappableSlots, fetchMyEvents]);

  const requestSwap = async (theirSlotId, mySlotId) => {
    try {
      const response = await fetch(`${API_URL}/api/swap-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mySlotId, theirSlotId })
      });
      
      if (response.ok) {
        alert('Swap request sent!');
        fetchSwappableSlots();
        fetchMyEvents();
      }
    } catch (error) {
      console.error('Error requesting swap:', error);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>Marketplace</h2>
        <span style={{ color: '#06b6d4', fontWeight: '600' }}>Available Slots</span>
      </div>
      
      {swappableSlots.length === 0 ? (
        <div className="event-card" style={{ textAlign: 'center' }}>
          <h3>No Available Slots</h3>
          <p>No swappable slots available at the moment. Check back later!</p>
        </div>
      ) : (
        <div className="grid">
          {swappableSlots.map(slot => (
            <div key={slot.id} className="event-card">
              <div className="event-header">
                <h3>{slot.title}</h3>
                <span className="status-badge status-swappable">SWAPPABLE</span>
              </div>
              <p style={{ color: '#cbd5e1', marginBottom: '0.5rem' }}>
                <strong>Owner:</strong> {slot.owner.name}
              </p>
              <p style={{ color: '#cbd5e1', marginBottom: '0.5rem' }}>
                <strong>Start:</strong> {new Date(slot.startTime).toLocaleString()}
              </p>
              <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>
                <strong>End:</strong> {new Date(slot.endTime).toLocaleString()}
              </p>
              
              {myEvents.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ color: '#cbd5e1', fontWeight: '600' }}>Swap with my slot:</label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        requestSwap(slot.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                  >
                    <option value="">Select your slot to swap</option>
                    {myEvents.map(event => (
                      <option key={event.id} value={event.id}>
                        {event.title} - {new Date(event.startTime).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {myEvents.length === 0 && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                  <p style={{ color: '#ef4444', margin: 0 }}>
                    You need swappable slots to request a swap
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Requests Component
function Requests({ token }) {
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });

  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/swap-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const respondToRequest = async (requestId, accept) => {
    try {
      const response = await fetch(`${API_URL}/api/swap-response/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accept })
      });
      
      if (response.ok) {
        alert(accept ? 'Swap accepted!' : 'Swap rejected!');
        fetchRequests();
      }
    } catch (error) {
      console.error('Error responding to request:', error);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>Swap Requests</h2>
      </div>
      
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ color: '#f1f5f9', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Incoming Requests</h3>
        {requests.incoming.length === 0 ? (
          <div className="event-card" style={{ textAlign: 'center' }}>
            <h3>No Incoming Requests</h3>
            <p>You don't have any pending swap requests.</p>
          </div>
        ) : (
          requests.incoming.map(request => (
            <div key={request.id} className="event-card">
              <h4>Swap Request from {request.fromUser.name}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0' }}>
                <div style={{ background: '#334155', padding: '1rem', borderRadius: '8px' }}>
                  <h5 style={{ color: '#06b6d4' }}>Their Slot:</h5>
                  <p><strong>{request.mySlot.title}</strong></p>
                  <p>{new Date(request.mySlot.startTime).toLocaleString()} - {new Date(request.mySlot.endTime).toLocaleString()}</p>
                </div>
                <div style={{ background: '#334155', padding: '1rem', borderRadius: '8px' }}>
                  <h5 style={{ color: '#06b6d4' }}>Your Slot:</h5>
                  <p><strong>{request.theirSlot.title}</strong></p>
                  <p>{new Date(request.theirSlot.startTime).toLocaleString()} - {new Date(request.theirSlot.endTime).toLocaleString()}</p>
                </div>
              </div>
              <p><strong>Status:</strong> <span className={`status-badge status-${request.status.toLowerCase()}`}>{request.status}</span></p>
              {request.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    onClick={() => respondToRequest(request.id, true)}
                    className="btn btn-success"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondToRequest(request.id, false)}
                    className="btn btn-danger"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div>
        <h3 style={{ color: '#f1f5f9', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Outgoing Requests</h3>
        {requests.outgoing.length === 0 ? (
          <div className="event-card" style={{ textAlign: 'center' }}>
            <h3>No Outgoing Requests</h3>
            <p>You haven't sent any swap requests yet.</p>
          </div>
        ) : (
          requests.outgoing.map(request => (
            <div key={request.id} className="event-card">
              <h4>Swap Request to {request.toUser.name}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0' }}>
                <div style={{ background: '#334155', padding: '1rem', borderRadius: '8px' }}>
                  <h5 style={{ color: '#06b6d4' }}>Your Slot:</h5>
                  <p><strong>{request.mySlot.title}</strong></p>
                  <p>{new Date(request.mySlot.startTime).toLocaleString()} - {new Date(request.mySlot.endTime).toLocaleString()}</p>
                </div>
                <div style={{ background: '#334155', padding: '1rem', borderRadius: '8px' }}>
                  <h5 style={{ color: '#06b6d4' }}>Their Slot:</h5>
                  <p><strong>{request.theirSlot.title}</strong></p>
                  <p>{new Date(request.theirSlot.startTime).toLocaleString()} - {new Date(request.theirSlot.endTime).toLocaleString()}</p>
                </div>
              </div>
              <p><strong>Status:</strong> <span className={`status-badge status-${request.status.toLowerCase()}`}>{request.status}</span></p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Main App Component
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
    <BrowserRouter>
      <div className="App">
        <Navbar user={user} logout={logout} />
        <Routes>
          <Route path="/" element={<Navigate to="/calendar" />} />
          <Route path="/calendar" element={<Calendar token={token} />} />
          <Route path="/marketplace" element={<Marketplace token={token} />} />
          <Route path="/requests" element={<Requests token={token} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));