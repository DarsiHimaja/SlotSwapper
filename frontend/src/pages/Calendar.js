import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../config';

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
    <div>
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
            <div className="slot-info">
              <p><strong>Start:</strong> {new Date(event.startTime).toLocaleString()}</p>
              <p><strong>End:</strong> {new Date(event.endTime).toLocaleString()}</p>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
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

export default Calendar;