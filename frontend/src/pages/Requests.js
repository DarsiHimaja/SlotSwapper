import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../config';

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
    <div>
      <div className="page-header">
        <h2>Swap Requests</h2>
      </div>
      
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Incoming Requests</h3>
        {requests.incoming.length === 0 ? (
          <div className="empty-state">
            <h3>No Incoming Requests</h3>
            <p>You don't have any pending swap requests.</p>
          </div>
        ) : (
          requests.incoming.map(request => (
            <div key={request.id} className="request-card">
              <h4>Swap Request from {request.fromUser.name}</h4>
              <div className="swap-grid">
                <div className="slot-info">
                  <h5>Their Slot:</h5>
                  <p><strong>{request.mySlot.title}</strong></p>
                  <p>{new Date(request.mySlot.startTime).toLocaleString()} - {new Date(request.mySlot.endTime).toLocaleString()}</p>
                </div>
                <div className="slot-info">
                  <h5>Your Slot:</h5>
                  <p><strong>{request.theirSlot.title}</strong></p>
                  <p>{new Date(request.theirSlot.startTime).toLocaleString()} - {new Date(request.theirSlot.endTime).toLocaleString()}</p>
                </div>
              </div>
              <p><strong>Status:</strong> {request.status}</p>
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
        <h3 style={{ color: '#2c3e50', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Outgoing Requests</h3>
        {requests.outgoing.length === 0 ? (
          <div className="empty-state">
            <h3>No Outgoing Requests</h3>
            <p>You haven't sent any swap requests yet.</p>
          </div>
        ) : (
          requests.outgoing.map(request => (
            <div key={request.id} className="request-card">
              <h4>Swap Request to {request.toUser.name}</h4>
              <div className="swap-grid">
                <div className="slot-info">
                  <h5>Your Slot:</h5>
                  <p><strong>{request.mySlot.title}</strong></p>
                  <p>{new Date(request.mySlot.startTime).toLocaleString()} - {new Date(request.mySlot.endTime).toLocaleString()}</p>
                </div>
                <div className="slot-info">
                  <h5>Their Slot:</h5>
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

export default Requests;