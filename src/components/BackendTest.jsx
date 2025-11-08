// Simple component to test backend connection
// Add this to your App.jsx to test the API
import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function BackendTest() {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // test health check on mount
  useEffect(() => {
    testHealth();
  }, []);

  const testHealth = async () => {
    setStatus('loading');
    setError(null);
    try {
      const result = await api.healthCheck();
      setData(result);
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const testGetRequests = async () => {
    setStatus('loading');
    setError(null);
    try {
      const result = await api.getRequests({ city: 'toronto', region: 'ontario' });
      setData(result);
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>Backend Connection Test</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={testHealth}
          disabled={status === 'loading'}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Test Health Check
        </button>
        <button 
          onClick={testGetRequests}
          disabled={status === 'loading'}
          style={{ padding: '8px 16px' }}
        >
          Test Get Requests (needs auth)
        </button>
      </div>

      {status === 'loading' && <p>Loading...</p>}
      {status === 'error' && (
        <div style={{ color: 'red' }}>
          <strong>Error:</strong> {error}
          {error.includes('Unauthorized') && (
            <p style={{ marginTop: '10px', fontSize: '14px' }}>
              This is expected - you need to set up Cognito auth first.
            </p>
          )}
        </div>
      )}
      {status === 'success' && data && (
        <div style={{ marginTop: '10px' }}>
          <strong>Success!</strong>
          <pre style={{ 
            backgroundColor: '#fff', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '300px'
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

