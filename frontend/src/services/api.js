import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export async function register(data) {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Registration failed';
    throw new Error(message);
  }
}

export async function login(data) {
  const response = await axios.post(`${API_URL}/auth/login`, data);
  return response.data;
}

export async function confirmEmail(token) {
  const response = await axios.get(`${API_URL}/auth/confirm?token=${token}`);
  return response.data;
}
