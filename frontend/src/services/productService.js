// frontend/src/services/productService.js
import axiosInstance from './axiosInstance.js';

/**
 * Normalise whatever the backend sends into a plain products array.
 * Handles shapes like:
 *   - [ {...}, {...} ]
 *   - { products: [ {...}, {...} ] }
 *   - { ok: true, products: [ {...} ], productCount: 10 }
 *   - { ok: true, data: [ {...} ] }
 *   - or “someObject” that has exactly one array field
 */
const normalizeProducts = (raw) => {
  if (!raw) return [];

  // Already an array
  if (Array.isArray(raw)) return raw;

  // Common wrapper shapes
  if (Array.isArray(raw.products)) return raw.products;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.items)) return raw.items;

  // Last resort: find the first array value in the object
  if (typeof raw === 'object') {
    const firstArrayKey = Object.keys(raw).find((key) =>
      Array.isArray(raw[key])
    );
    if (firstArrayKey) return raw[firstArrayKey];
  }

  return [];
};

/**
 * Get ALL products (no search filter)
 */
const getAllProducts = async () => {
  try {
    const response = await axiosInstance.get('/products');
    const products = normalizeProducts(response.data);
    console.log('getAllProducts raw:', response.data, 'normalized:', products);
    return products;
  } catch (error) {
    console.error('getAllProducts error:', error);
    throw error.response?.data || error;
  }
};

/**
 * Search products by name (or other search logic on the backend)
 * If searchTerm is empty, this behaves like "get all products".
 */
const searchProducts = async (searchTerm = '') => {
  try {
    const params = {};

    if (searchTerm && searchTerm.trim() !== '') {
      // only send search param when user actually typed something
      params.search = searchTerm.trim();
    }

    const response = await axiosInstance.get('/products', { params });
    const products = normalizeProducts(response.data);
    console.log('searchProducts raw:', response.data, 'normalized:', products);
    return products;
  } catch (error) {
    console.error('searchProducts error:', error);
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

export default {
  getAllProducts,
  getProductById,
  createProduct,
  searchProducts,
};
