import axiosInstance from './axiosInstance.js';

/**
 * Get all products with optional search and sort
 */
const getAllProducts = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/products', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get product by ID
 */
const getProductById = async (productId) => {
  try {
    const response = await axiosInstance.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Create product (admin only)
 */
const createProduct = async (data) => {
  try {
    const response = await axiosInstance.post('/products', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Search products by name
 */
const searchProducts = async (searchTerm = '') => {
  try {
    const response = await axiosInstance.get(`/products?search=${searchTerm}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  searchProducts,
};
