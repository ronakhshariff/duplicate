// API helper functions for calling the backend
import { API_BASE } from './config';

// helper to make API calls with auth
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('cognito_token'); // we'll store token here when we get it

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // add auth token if we have one
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // if unauthorized, token might be expired
    if (response.status === 401) {
      localStorage.removeItem('cognito_token');
      // could redirect to login here
      throw new Error('Unauthorized - please log in');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `API error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// API functions
export const api = {
  // health check (no auth needed)
  healthCheck: () => apiCall('/'),

  // requests
  getRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/requests?${query}`);
  },

  getRequest: (requestId, city = 'unknown', region = 'unknown') => {
    return apiCall(`/requests/${requestId}?city=${city}&region=${region}`);
  },

  createRequest: (requestData) => {
    return apiCall('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  },

  acceptRequest: (requestId, city = 'unknown', region = 'unknown') => {
    return apiCall(`/requests/${requestId}/accept?city=${city}&region=${region}`, {
      method: 'POST'
    });
  },

  updateRequestStatus: (requestId, status, city = 'unknown', region = 'unknown') => {
    return apiCall(`/requests/${requestId}/status?city=${city}&region=${region}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // user profile
  getCurrentUser: () => apiCall('/users/me'),
  updateCurrentUser: (userData) => {
    return apiCall('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  // notifications
  getNotifications: (limit = 50, offset = 0) => {
    return apiCall(`/notifications?limit=${limit}&offset=${offset}`);
  },

  markNotificationRead: (notificationId) => {
    return apiCall(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  },

  getUnreadCount: () => apiCall('/notifications/unread-count'),

  // weather
  getWeatherAlerts: (latitude, longitude) => {
    return apiCall(`/weather/alerts?latitude=${latitude}&longitude=${longitude}`);
  },

  // location
  geocode: (address) => {
    return apiCall(`/location/geocode?address=${encodeURIComponent(address)}`);
  },

  reverseGeocode: (latitude, longitude) => {
    return apiCall(`/location/reverse-geocode?latitude=${latitude}&longitude=${longitude}`);
  },

  searchPlaces: (query, latitude, longitude) => {
    const params = new URLSearchParams({ query });
    if (latitude && longitude) {
      params.append('latitude', latitude);
      params.append('longitude', longitude);
    }
    return apiCall(`/location/search?${params.toString()}`);
  }
};

