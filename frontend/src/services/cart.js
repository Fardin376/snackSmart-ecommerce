import { useEffect, useState } from 'react';
import axiosInstance from './axiosInstance.js';

/**
 * Custom hook to fetch user's cart items
 * @param {Object} user - User object containing user id
 * @param {number} refreshTrigger - Trigger to refresh cart data
 * @returns {Object} - { data: cart items array, error: error object }
 */
export const useGetCustomerCart = (user, refreshTrigger = 0) => {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.id) {
      setIsLoading(false);
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await axiosInstance.get('/cart');

        if (response.data.ok) {
          setCart(response.data.data || []);
        } else {
          throw new Error(response.data.error || 'Failed to fetch cart');
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError(err);
        setCart([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [user, refreshTrigger]);

  return { data: cart, error, isLoading };
};
/**
 * Add item to cart
 * @param {number} productId - Product ID to add
 * @param {number} quantity - Quantity to add (default: 1)
 * @returns {Promise<Object>} - { ok: boolean, data/error: Object }
 */
export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await axiosInstance.post('/cart', {
      productId,
      quantity,
    });

    if (response.data.ok) {
      return {
        ok: true,
        data: response.data.data,
      };
    } else {
      throw new Error(response.data.error || 'Failed to add to cart');
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    return {
      ok: false,
      error:
        error.response?.data?.error || error.message || 'Failed to add to cart',
    };
  }
};

/**
 * Update cart item quantity
 * @param {number} productId - Product ID to update
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} - { ok: boolean, data/error: Object }
 */
export const updateCartQuantity = async (productId, quantity) => {
  try {
    const response = await axiosInstance.put('/cart', {
      productId,
      quantity,
    });

    if (response.data.ok) {
      return {
        ok: true,
        data: response.data.data,
      };
    } else {
      throw new Error(response.data.error || 'Failed to update cart');
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    return {
      ok: false,
      error:
        error.response?.data?.error || error.message || 'Failed to update cart',
    };
  }
};

/**
 * Remove item from cart
 * @param {number} productId - Product ID to remove
 * @returns {Promise<Object>} - { ok: boolean, message/error: string }
 */
export const removeFromCart = async (productId) => {
  try {
    const response = await axiosInstance.delete(`/cart/${productId}`);

    if (response.data.ok) {
      return {
        ok: true,
        message: response.data.message,
      };
    } else {
      throw new Error(response.data.error || 'Failed to remove from cart');
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    return {
      ok: false,
      error:
        error.response?.data?.error ||
        error.message ||
        'Failed to remove from cart',
    };
  }
};

/**
 * Clear entire cart
 * @returns {Promise<Object>} - { ok: boolean, message/error: string }
 */
export const clearCart = async () => {
  try {
    const response = await axiosInstance.delete('/cart');

    if (response.data.ok) {
      return {
        ok: true,
        message: response.data.message,
      };
    } else {
      throw new Error(response.data.error || 'Failed to clear cart');
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    return {
      ok: false,
      error:
        error.response?.data?.error || error.message || 'Failed to clear cart',
    };
  }
};
3;
