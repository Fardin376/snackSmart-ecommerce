import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const adminAxios = axios.create({
  baseURL: `${API_URL}/admin`,
});

// Add auth token to requests
adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin Auth
export const adminAuthService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/admin/auth/login`, {
      email,
      password,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await adminAxios.get('/auth/profile');
    return response.data;
  },
};

// Dashboard
export const dashboardService = {
  getStats: async () => {
    const response = await adminAxios.get('/dashboard/stats');
    return response.data;
  },
};

// Customers
export const customerService = {
  getAll: async (search = '') => {
    const response = await adminAxios.get(
      `/customers${search ? `?search=${search}` : ''}`
    );
    return response.data;
  },

  updateStatus: async (id, isActive) => {
    const response = await adminAxios.patch(`/customers/${id}/status`, {
      isActive,
    });
    return response.data;
  },
};

// Admins
export const adminManagementService = {
  getAll: async () => {
    const response = await adminAxios.get('/admins');
    return response.data;
  },

  create: async (data) => {
    const response = await adminAxios.post('/admins', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await adminAxios.put(`/admins/${id}`, data);
    return response.data;
  },

  deactivate: async (id) => {
    const response = await adminAxios.patch(`/admins/${id}/deactivate`);
    return response.data;
  },

  delete: async (id) => {
    const response = await adminAxios.delete(`/admins/${id}`);
    return response.data;
  },
};

// Inventory
export const inventoryService = {
  getAll: async () => {
    const response = await adminAxios.get('/inventory/products');
    return response.data;
  },

  create: async (data) => {
    const response = await adminAxios.post('/inventory/products', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await adminAxios.put(`/inventory/products/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await adminAxios.delete(`/inventory/products/${id}`);
    return response.data;
  },

  updateStock: async (id, stock) => {
    const response = await adminAxios.patch(`/inventory/products/${id}/stock`, {
      stock,
    });
    return response.data;
  },
};

// Sales
export const salesService = {
  getSummary: async (fromDate, toDate) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    const response = await adminAxios.get(`/sales/summary?${params}`);
    return response.data;
  },

  getTopProducts: async (fromDate, toDate) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    const response = await adminAxios.get(`/sales/top-products?${params}`);
    return response.data;
  },

  getRecentOrders: async (limit = 10) => {
    const response = await adminAxios.get(
      `/sales/recent-orders?limit=${limit}`
    );
    return response.data;
  },

  getAllOrders: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await adminAxios.get(`/sales/orders?${params}`);
    return response.data;
  },
};

// Coupons
export const couponService = {
  getAll: async () => {
    const response = await adminAxios.get('/coupons');
    return response.data;
  },

  create: async (data) => {
    const response = await adminAxios.post('/coupons', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await adminAxios.put(`/coupons/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await adminAxios.delete(`/coupons/${id}`);
    return response.data;
  },

  deactivate: async (id) => {
    const response = await adminAxios.patch(`/coupons/${id}/deactivate`);
    return response.data;
  },
};

export default {
  auth: adminAuthService,
  dashboard: dashboardService,
  customers: customerService,
  admins: adminManagementService,
  inventory: inventoryService,
  sales: salesService,
  coupons: couponService,
};
