// Example: How to use the API in your components
// Copy this code into your App.jsx or create a new component

import React, { useState, useEffect } from 'react';
import { api } from './api';
import { auth } from './auth';

function ExampleComponent() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Example 1: Health check (no auth needed)
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const health = await api.healthCheck();
        console.log('Backend is up!', health);
      } catch (error) {
        console.error('Backend is down:', error);
      }
    };
    checkBackend();
  }, []);

  // Example 2: Get requests (needs auth)
  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getRequests({
        city: 'toronto',
        region: 'ontario',
        status: 'open',
        limit: 10
      });
      setRequests(data.requests || []);
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        alert('Please log in first!');
      } else {
        console.error('Error loading requests:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Example 3: Create a request (needs auth)
  const createRequest = async () => {
    try {
      const newRequest = await api.createRequest({
        title: 'Need help moving',
        description: 'Moving this weekend, need help with heavy furniture',
        category: 'Moving',
        location: {
          latitude: 43.6532,
          longitude: -79.3832,
          city: 'toronto',
          region: 'ontario'
        },
        urgency: 'medium'
      });
      console.log('Created request:', newRequest);
      alert('Request created!');
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to create request: ' + error.message);
    }
  };

  return (
    <div>
      <h2>API Examples</h2>
      
      <div>
        <button onClick={loadRequests} disabled={loading}>
          {loading ? 'Loading...' : 'Load Requests'}
        </button>
        <button onClick={createRequest}>
          Create Request
        </button>
      </div>

      {requests.length > 0 && (
        <div>
          <h3>Requests ({requests.length})</h3>
          {requests.map(req => (
            <div key={req.requestId} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
              <h4>{req.title}</h4>
              <p>{req.description}</p>
              <p>Status: {req.status} | Urgency: {req.urgency}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExampleComponent;

