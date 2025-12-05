import React, { useState, useEffect } from 'react';
import {
  useGetCustomerCart,
  removeFromCart,
  updateCartQuantity,
} from '../services/cart.js';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  CircularProgress,
  List,
  ListItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';

export default function Cart({
  isOpen,
  onClose,
  onCartUpdate,
  cartRefreshTrigger,
}) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [updatingItems, setUpdatingItems] = useState({});
  const [localCart, setLocalCart] = useState([]);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    let storedUser = null;
    if (userJson && userJson !== 'undefined') {
      storedUser = JSON.parse(userJson);
    }
    setUser(storedUser);
  }, []);

  const {
    data: cart,
    error: cartError,
    isLoading,
  } = useGetCustomerCart(user, cartRefreshTrigger);

  useEffect(() => {
    if (cart) {
      setLocalCart(cart);
    }
    if (cartError) {
      setError('Failed to load cart.');
    }
  }, [cart, cartError]);

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdatingItems((prev) => ({ ...prev, [item.productId]: true }));

    try {
      const result = await updateCartQuantity(item.productId, newQuantity);
      if (!result.ok) {
        throw new Error(result.error || 'Failed to update quantity');
      }

      setLocalCart((prevCart) =>
        prevCart.map((cartItem) =>
          cartItem.productId === item.productId
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        )
      );
      onCartUpdate();
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to update quantity.');
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [item.productId]: false }));
    }
  };

  const handleRemoveItem = async (item) => {
    setUpdatingItems((prev) => ({ ...prev, [item.productId]: true }));

    try {
      const result = await removeFromCart(item.productId);
      if (!result.ok) {
        throw new Error(result.error || 'Failed to remove item');
      }

      setLocalCart((prevCart) =>
        prevCart.filter((cartItem) => cartItem.productId !== item.productId)
      );
      onCartUpdate();
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to remove item.');
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [item.productId]: false }));
    }
  };

  const calculateSubtotal = () => {
    if (!localCart || !Array.isArray(localCart)) return 0;
    return localCart.reduce((total, item) => {
      return total + parseFloat(item.price || 0) * (item.quantity || 0);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 450 },
          maxWidth: '100%',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCartIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Shopping Cart
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Loading State */}
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* Cart Items */}
        {!isLoading && user && (
          <>
            {localCart && localCart.length > 0 ? (
              <>
                <List
                  sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: 0,
                  }}
                >
                  {localCart.map((item) => (
                    <ListItem
                      key={item.productId}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        opacity: updatingItems[item.productId] ? 0.6 : 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                        {/* Product Image */}
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            flexShrink: 0,
                            bgcolor: 'grey.100',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                              }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.disabled">
                              No Image
                            </Typography>
                          )}
                        </Box>

                        {/* Product Details */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                flex: 1,
                                pr: 1,
                              }}
                            >
                              {item.name}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveItem(item)}
                              disabled={updatingItems[item.productId]}
                              sx={{
                                color: 'text.secondary',
                                '&:hover': { color: 'error.main' },
                              }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1, fontSize: '0.875rem' }}
                          >
                            ${parseFloat(item.price || 0).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Quantity and Total */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        {/* Quantity Controls */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            border: '1px solid',
                            borderColor: 'grey.300',
                            borderRadius: 1,
                            p: 0.3,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleQuantityChange(item, item.quantity - 1)
                            }
                            disabled={
                              item.quantity <= 1 ||
                              updatingItems[item.productId]
                            }
                            sx={{ p: 0.5 }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography
                            sx={{
                              minWidth: 30,
                              textAlign: 'center',
                              fontSize: '0.875rem',
                            }}
                          >
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleQuantityChange(item, item.quantity + 1)
                            }
                            disabled={updatingItems[item.productId]}
                            sx={{ p: 0.5 }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        {/* Item Total */}
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700 }}
                        >
                          $
                          {(
                            parseFloat(item.price || 0) * item.quantity
                          ).toFixed(2)}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>

                {/* Summary */}
                <Box
                  sx={{
                    p: 2,
                    borderTop: '2px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography>Subtotal</Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      ${subtotal.toFixed(2)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Tax (10%)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ${tax.toFixed(2)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Total
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      ${total.toFixed(2)}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      bgcolor: '#1a1a2e',
                      color: 'white',
                      fontWeight: 600,
                      py: 1.5,
                      '&:hover': {
                        bgcolor: '#16213e',
                      },
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                }}
              >
                <ShoppingCartIcon
                  sx={{ fontSize: 80, color: 'grey.300', mb: 2 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Your cart is empty
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3, textAlign: 'center' }}
                >
                  Add some products to get started!
                </Typography>
                <Button
                  variant="contained"
                  onClick={onClose}
                  sx={{
                    bgcolor: '#1a1a2e',
                    '&:hover': { bgcolor: '#16213e' },
                  }}
                >
                  Continue Shopping
                </Button>
              </Box>
            )}
          </>
        )}

        {/* Not Logged In */}
        {!isLoading && !user && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Please log in
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, textAlign: 'center' }}
            >
              Log in to view your cart
            </Typography>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{
                bgcolor: '#1a1a2e',
                '&:hover': { bgcolor: '#16213e' },
              }}
            >
              Close
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
