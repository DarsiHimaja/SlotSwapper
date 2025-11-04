import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../config';

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
    <div>
      <div className="page-header">
        <h2>Marketplace</h2>
        <span style={{ color: '#667eea', fontWeight: '600' }}>Available Slots</span>
      </div>
      
      {swappableSlots.length === 0 ? (
        <div className="empty-state">
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
              <div className="slot-info">
                <p><strong>Owner:</strong> {slot.owner.name}</p>
                <p><strong>Start:</strong> {new Date(slot.startTime).toLocaleString()}</p>
                <p><strong>End:</strong> {new Date(slot.endTime).toLocaleString()}</p>
              </div>
              
              {myEvents.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <label><strong>Swap with my slot:</strong></label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        requestSwap(slot.id, parseInt(e.target.value));
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
                <div style={{ background: 'rgba(255, 107, 107, 0.1)', padding: '1rem', borderRadius: '12px', marginTop: '1rem', borderLeft: '4px solid #ff6b6b' }}>
                  <p style={{ color: '#e74c3c', margin: 0 }}>
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

export default Marketplace;