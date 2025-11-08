const { useState, useEffect, useCallback } = React;

// API Configuration
const API_URL = '';

// Simple Router Component
function SimpleRouter({ currentPage, setCurrentPage, token }) {
  switch (currentPage) {
    case 'calendar':
      return React.createElement(Calendar, { token, setCurrentPage });
    case 'marketplace':
      return React.createElement(Marketplace, { token, setCurrentPage });
    case 'requests':
      return React.createElement(Requests, { token, setCurrentPage });
    default:
      return React.createElement(Calendar, { token, setCurrentPage });
  }
}

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

  return React.createElement('div', { className: 'auth-form' },
    React.createElement('h2', null, isLogin ? 'Login' : 'Sign Up'),
    isLogin && React.createElement('div', { className: 'demo-box' },
      React.createElement('h4', null, 'Demo Credentials'),
      React.createElement('p', null, React.createElement('strong', null, 'Email:'), ' demo@gmail.com'),
      React.createElement('p', null, React.createElement('strong', null, 'Password:'), ' demo123')
    ),
    React.createElement('form', { onSubmit: handleSubmit },
      !isLogin && React.createElement('div', { className: 'form-group' },
        React.createElement('label', null, 'Name'),
        React.createElement('input', {
          type: 'text',
          value: formData.name,
          onChange: (e) => setFormData({ ...formData, name: e.target.value }),
          required: true
        })
      ),
      React.createElement('div', { className: 'form-group' },
        React.createElement('label', null, 'Email'),
        React.createElement('input', {
          type: 'email',
          value: formData.email,
          onChange: (e) => setFormData({ ...formData, email: e.target.value }),
          required: true
        })
      ),
      React.createElement('div', { className: 'form-group' },
        React.createElement('label', null, 'Password'),
        React.createElement('input', {
          type: 'password',
          value: formData.password,
          onChange: (e) => setFormData({ ...formData, password: e.target.value }),
          required: true
        })
      ),
      React.createElement('button', { type: 'submit', className: 'btn' },
        isLogin ? 'Login' : 'Sign Up'
      )
    ),
    React.createElement('p', { style: { textAlign: 'center', marginTop: '1rem', color: '#cbd5e1' } },
      isLogin ? "Don't have an account? " : "Already have an account? ",
      React.createElement('button', {
        type: 'button',
        onClick: () => setIsLogin(!isLogin),
        style: { background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer' }
      }, isLogin ? 'Sign Up' : 'Login')
    )
  );
}

// Navbar Component
function Navbar({ user, logout, currentPage, setCurrentPage }) {
  return React.createElement('nav', { className: 'navbar' },
    React.createElement('h1', null, 'SlotSwapper'),
    React.createElement('ul', { className: 'nav-links' },
      React.createElement('li', null,
        React.createElement('button', {
          onClick: () => setCurrentPage('calendar'),
          style: { background: 'none', border: 'none', color: currentPage === 'calendar' ? '#06b6d4' : '#cbd5e1', cursor: 'pointer', padding: '0.75rem 1.25rem', borderRadius: '8px' }
        }, 'My Calendar')
      ),
      React.createElement('li', null,
        React.createElement('button', {
          onClick: () => setCurrentPage('marketplace'),
          style: { background: 'none', border: 'none', color: currentPage === 'marketplace' ? '#06b6d4' : '#cbd5e1', cursor: 'pointer', padding: '0.75rem 1.25rem', borderRadius: '8px' }
        }, 'Marketplace')
      ),
      React.createElement('li', null,
        React.createElement('button', {
          onClick: () => setCurrentPage('requests'),
          style: { background: 'none', border: 'none', color: currentPage === 'requests' ? '#06b6d4' : '#cbd5e1', cursor: 'pointer', padding: '0.75rem 1.25rem', borderRadius: '8px' }
        }, 'Requests')
      ),
      React.createElement('li', null,
        React.createElement('span', { style: { color: '#cbd5e1', marginRight: '1rem' } }, `Welcome, ${user?.name}`),
        React.createElement('button', { onClick: logout, className: 'btn', style: { padding: '0.5rem 1rem' } }, 'Logout')
      )
    )
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

  return React.createElement('div', { className: 'container' },
    React.createElement('div', { className: 'page-header' },
      React.createElement('h2', null, 'My Calendar'),
      React.createElement('button', {
        onClick: () => setShowForm(!showForm),
        className: 'btn'
      }, showForm ? 'Cancel' : 'Add Event')
    ),
    showForm && React.createElement('div', { className: 'event-card', style: { marginBottom: '2rem' } },
      React.createElement('h3', null, 'Create New Event'),
      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Title'),
          React.createElement('input', {
            type: 'text',
            value: formData.title,
            onChange: (e) => setFormData({ ...formData, title: e.target.value }),
            required: true
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Start Time'),
          React.createElement('input', {
            type: 'datetime-local',
            value: formData.startTime,
            onChange: (e) => setFormData({ ...formData, startTime: e.target.value }),
            required: true
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'End Time'),
          React.createElement('input', {
            type: 'datetime-local',
            value: formData.endTime,
            onChange: (e) => setFormData({ ...formData, endTime: e.target.value }),
            required: true
          })
        ),
        React.createElement('button', { type: 'submit', className: 'btn' }, 'Create Event')
      )
    ),
    React.createElement('div', { className: 'grid' },
      events.map(event =>
        React.createElement('div', { key: event.id, className: 'event-card' },
          React.createElement('div', { className: 'event-header' },
            React.createElement('h3', null, event.title),
            React.createElement('span', { className: `status-badge status-${event.status.toLowerCase()}` }, event.status)
          ),
          React.createElement('p', { style: { color: '#cbd5e1', marginBottom: '0.5rem' } },
            React.createElement('strong', null, 'Start:'), ' ', new Date(event.startTime).toLocaleString()
          ),
          React.createElement('p', { style: { color: '#cbd5e1', marginBottom: '1rem' } },
            React.createElement('strong', null, 'End:'), ' ', new Date(event.endTime).toLocaleString()
          ),
          React.createElement('div', { style: { display: 'flex', gap: '0.5rem' } },
            event.status !== 'SWAP_PENDING' && React.createElement('button', {
              onClick: () => toggleSwappable(event.id, event.status),
              className: `btn ${event.status === 'SWAPPABLE' ? 'btn-danger' : 'btn-success'}`
            }, event.status === 'SWAPPABLE' ? 'Remove from Swap' : 'Make Swappable'),
            React.createElement('button', {
              onClick: () => deleteEvent(event.id),
              className: 'btn btn-danger'
            }, 'Delete')
          )
        )
      )
    )
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

  return React.createElement('div', { className: 'container' },
    React.createElement('div', { className: 'page-header' },
      React.createElement('h2', null, 'Marketplace'),
      React.createElement('span', { style: { color: '#06b6d4', fontWeight: '600' } }, 'Available Slots')
    ),
    swappableSlots.length === 0 ?
      React.createElement('div', { className: 'event-card', style: { textAlign: 'center' } },
        React.createElement('h3', null, 'No Available Slots'),
        React.createElement('p', null, 'No swappable slots available at the moment. Check back later!')
      ) :
      React.createElement('div', { className: 'grid' },
        swappableSlots.map(slot =>
          React.createElement('div', { key: slot.id, className: 'event-card' },
            React.createElement('div', { className: 'event-header' },
              React.createElement('h3', null, slot.title),
              React.createElement('span', { className: 'status-badge status-swappable' }, 'SWAPPABLE')
            ),
            React.createElement('p', { style: { color: '#cbd5e1', marginBottom: '0.5rem' } },
              React.createElement('strong', null, 'Owner:'), ' ', slot.owner.name
            ),
            React.createElement('p', { style: { color: '#cbd5e1', marginBottom: '0.5rem' } },
              React.createElement('strong', null, 'Start:'), ' ', new Date(slot.startTime).toLocaleString()
            ),
            React.createElement('p', { style: { color: '#cbd5e1', marginBottom: '1rem' } },
              React.createElement('strong', null, 'End:'), ' ', new Date(slot.endTime).toLocaleString()
            ),
            myEvents.length > 0 && React.createElement('div', { style: { marginTop: '1rem' } },
              React.createElement('label', { style: { color: '#cbd5e1', fontWeight: '600' } }, 'Swap with my slot:'),
              React.createElement('select', {
                onChange: (e) => {
                  if (e.target.value) {
                    requestSwap(slot.id, e.target.value);
                    e.target.value = '';
                  }
                },
                style: { width: '100%', padding: '0.5rem', marginTop: '0.5rem' }
              },
                React.createElement('option', { value: '' }, 'Select your slot to swap'),
                myEvents.map(event =>
                  React.createElement('option', { key: event.id, value: event.id },
                    `${event.title} - ${new Date(event.startTime).toLocaleString()}`
                  )
                )
              )
            ),
            myEvents.length === 0 && React.createElement('div', {
              style: { background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #ef4444' }
            },
              React.createElement('p', { style: { color: '#ef4444', margin: 0 } },
                'You need swappable slots to request a swap'
              )
            )
          )
        )
      )
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

  return React.createElement('div', { className: 'container' },
    React.createElement('div', { className: 'page-header' },
      React.createElement('h2', null, 'Swap Requests')
    ),
    React.createElement('div', { style: { marginBottom: '3rem' } },
      React.createElement('h3', { style: { color: '#f1f5f9', marginBottom: '1.5rem', fontSize: '1.5rem' } }, 'Incoming Requests'),
      requests.incoming.length === 0 ?
        React.createElement('div', { className: 'event-card', style: { textAlign: 'center' } },
          React.createElement('h3', null, 'No Incoming Requests'),
          React.createElement('p', null, "You don't have any pending swap requests.")
        ) :
        requests.incoming.map(request =>
          React.createElement('div', { key: request.id, className: 'event-card' },
            React.createElement('h4', null, `Swap Request from ${request.fromUser.name}`),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0' } },
              React.createElement('div', { style: { background: '#334155', padding: '1rem', borderRadius: '8px' } },
                React.createElement('h5', { style: { color: '#06b6d4' } }, 'Their Slot:'),
                React.createElement('p', null, React.createElement('strong', null, request.mySlot.title)),
                React.createElement('p', null, `${new Date(request.mySlot.startTime).toLocaleString()} - ${new Date(request.mySlot.endTime).toLocaleString()}`)
              ),
              React.createElement('div', { style: { background: '#334155', padding: '1rem', borderRadius: '8px' } },
                React.createElement('h5', { style: { color: '#06b6d4' } }, 'Your Slot:'),
                React.createElement('p', null, React.createElement('strong', null, request.theirSlot.title)),
                React.createElement('p', null, `${new Date(request.theirSlot.startTime).toLocaleString()} - ${new Date(request.theirSlot.endTime).toLocaleString()}`)
              )
            ),
            React.createElement('p', null,
              React.createElement('strong', null, 'Status:'), ' ',
              React.createElement('span', { className: `status-badge status-${request.status.toLowerCase()}` }, request.status)
            ),
            request.status === 'PENDING' && React.createElement('div', { style: { display: 'flex', gap: '0.5rem', marginTop: '1rem' } },
              React.createElement('button', {
                onClick: () => respondToRequest(request.id, true),
                className: 'btn btn-success'
              }, 'Accept'),
              React.createElement('button', {
                onClick: () => respondToRequest(request.id, false),
                className: 'btn btn-danger'
              }, 'Reject')
            )
          )
        )
    ),
    React.createElement('div', null,
      React.createElement('h3', { style: { color: '#f1f5f9', marginBottom: '1.5rem', fontSize: '1.5rem' } }, 'Outgoing Requests'),
      requests.outgoing.length === 0 ?
        React.createElement('div', { className: 'event-card', style: { textAlign: 'center' } },
          React.createElement('h3', null, 'No Outgoing Requests'),
          React.createElement('p', null, "You haven't sent any swap requests yet.")
        ) :
        requests.outgoing.map(request =>
          React.createElement('div', { key: request.id, className: 'event-card' },
            React.createElement('h4', null, `Swap Request to ${request.toUser.name}`),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0' } },
              React.createElement('div', { style: { background: '#334155', padding: '1rem', borderRadius: '8px' } },
                React.createElement('h5', { style: { color: '#06b6d4' } }, 'Your Slot:'),
                React.createElement('p', null, React.createElement('strong', null, request.mySlot.title)),
                React.createElement('p', null, `${new Date(request.mySlot.startTime).toLocaleString()} - ${new Date(request.mySlot.endTime).toLocaleString()}`)
              ),
              React.createElement('div', { style: { background: '#334155', padding: '1rem', borderRadius: '8px' } },
                React.createElement('h5', { style: { color: '#06b6d4' } }, 'Their Slot:'),
                React.createElement('p', null, React.createElement('strong', null, request.theirSlot.title)),
                React.createElement('p', null, `${new Date(request.theirSlot.startTime).toLocaleString()} - ${new Date(request.theirSlot.endTime).toLocaleString()}`)
              )
            ),
            React.createElement('p', null,
              React.createElement('strong', null, 'Status:'), ' ',
              React.createElement('span', { className: `status-badge status-${request.status.toLowerCase()}` }, request.status)
            )
          )
        )
    )
  );
}

// Main App Component
function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [currentPage, setCurrentPage] = useState('calendar');

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
    return React.createElement(Login, { setToken, setUser });
  }

  return React.createElement('div', { className: 'App' },
    React.createElement(Navbar, { user, logout, currentPage, setCurrentPage }),
    React.createElement(SimpleRouter, { currentPage, setCurrentPage, token })
  );
}

// Render the app
ReactDOM.render(React.createElement(App), document.getElementById('root'));