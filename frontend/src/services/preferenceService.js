import axiosInstance from './axiosInstance';

// Generate or retrieve session ID for guest users
const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Track product interaction
export const trackInteraction = async (productId, actionType) => {
  try {
    const token = localStorage.getItem('token');
    // Always get sessionId for guest users, null for logged-in users
    const sessionId = !token ? getSessionId() : undefined;

    const payload = {
      productId,
      actionType,
    };

    // Only add sessionId if user is not logged in
    if (!token && sessionId) {
      payload.sessionId = sessionId;
    }

    console.log('Tracking interaction:', {
      hasToken: !!token,
      sessionId,
      payload,
      authHeader: token ? 'Bearer token will be set by interceptor' : 'No auth',
    });

    const response = await axiosInstance.post('/preferences/track', payload);
    console.log('Track response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Track interaction error:', error);
    // Don't throw error - tracking failures shouldn't break user experience
    return null;
  }
};

// Get recent preferences
export const getRecentPreferences = async () => {
  try {
    const token = localStorage.getItem('token');
    const params = {};

    // Only send sessionId if user is not logged in
    if (!token) {
      params.sessionId = getSessionId();
    }

    console.log('Fetching recent preferences:', {
      hasToken: !!token,
      params,
      authHeader: token ? 'Bearer token set' : 'No auth header',
    });
    const response = await axiosInstance.get('/preferences/recent', { params });
    console.log('Recent preferences response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get preferences error:', error);
    throw error;
  }
};

// Get personalized recommendations
export const getRecommendations = async () => {
  try {
    const token = localStorage.getItem('token');
    const params = {};

    // Only send sessionId if user is not logged in
    if (!token) {
      params.sessionId = getSessionId();
    }

    console.log('Fetching recommendations with params:', params);
    const response = await axiosInstance.get('/preferences/recommendations', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Get recommendations error:', error);
    throw error;
  }
};

// Clear all preferences
export const clearPreferences = async () => {
  try {
    const token = localStorage.getItem('token');
    const data = {};

    // Only send sessionId if user is not logged in
    if (!token) {
      data.sessionId = getSessionId();
    }

    const response = await axiosInstance.delete('/preferences/clear', { data });
    return response.data;
  } catch (error) {
    console.error('Clear preferences error:', error);
    throw error;
  }
};

// Clear session ID (for logout)
export const clearSessionId = () => {
  localStorage.removeItem('sessionId');
};
