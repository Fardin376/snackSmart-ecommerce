import axiosInstance from './axiosInstance';

export async function register(data) {
  try {
    const response = await axiosInstance.post(`/auth/register`, data);
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
<<<<<<< HEAD
  try {
    const response = await axiosInstance.post(`/auth/login`, data);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || 'Login failed';
    throw new Error(message);
  }
}

export async function confirmEmail(token) {
  try {
    const response = await axiosInstance.get(`/email/confirm?token=${token}`);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || 'Email confirmation failed.';
    throw new Error(message);
  }
=======
  const response = await axiosInstance.post(`/auth/login`, data);
  return response.data;
}

export async function confirmEmail(token) {
  const response = await axiosInstance.get(`/auth/confirm?token=${token}`);
  return response.data;
>>>>>>> f82d4fcc45a32ef9506f373cbc26618803e9819c
}
