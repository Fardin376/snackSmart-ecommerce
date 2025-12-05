import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Badge,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useGetCustomerCart } from '../services/cart.js';

import logo from '/logo.png';

export default function Topbar({
  searchTerm,
  onSearchChange,
  sortOption,
  onSortChange,
  onCartOpen,
  cartRefreshTrigger,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    setIsLoggedIn(!!token);
    setUser(storedUser);
  }, [location]);

  // Get cart data
  const { data: cart } = useGetCustomerCart(user, cartRefreshTrigger);
  const cartItemCount =
    cart && Array.isArray(cart)
      ? cart.reduce((total, item) => total + (item.quantity || 0), 0)
      : 0;

  const isProductsPage =
    location.pathname === '/' || location.pathname === '/products';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    handleMenuClose();
    navigate('/');
  };

  const navItems = [
    { path: '/', icon: <HomeIcon />, label: 'Home' },
    {
      path: null,
      icon: (
        <Badge badgeContent={cartItemCount} color="error">
          <ShoppingCartIcon />
        </Badge>
      ),
      label: 'Cart',
      onClick: (e) => {
        if (e && e.preventDefault) {
          e.preventDefault();
        }
        onCartOpen();
      },
    },
    { path: '/admin/login', icon: <AdminPanelSettingsIcon />, label: 'Admin' },
    ...(!isLoggedIn
      ? [{ path: '/register', icon: <PersonAddIcon />, label: 'Register' }]
      : []),
    isLoggedIn
      ? {
          path: null,
          icon: <LogoutIcon />,
          label: 'Logout',
          onClick: handleLogout,
        }
      : { path: '/login', icon: <LoginIcon />, label: 'Login' },
  ];

  const handleMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <AppBar
        position="sticky"
        sx={{
          bgcolor: '#785cb3',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          mb: 0,
          left: 0,
          right: 0,
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 1.5, sm: 2, lg: 3 },
            gap: { xs: 1, sm: 2 },
          }}
        >
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={logo}
                alt="Logo"
                width={isMobile ? 80 : 100}
                height={isMobile ? 80 : 100}
              />
            </Link>
          </motion.div>

          {/* Search Bar - Only show on products page and desktop */}
          {isProductsPage && onSearchChange && !isMobile && (
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flex: 1,
                maxWidth: 600,
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Search products..."
                value={searchTerm || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(255,255,255,0.4)',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255,255,255,0.6)',
                    opacity: 1,
                  },
                }}
              />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={sortOption || ''}
                  onChange={(e) => onSortChange(e.target.value)}
                  displayEmpty
                  startAdornment={
                    <InputAdornment position="start">
                      <SortIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                    </InputAdornment>
                  }
                  sx={{
                    color: '#fff',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.4)',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'rgba(255,255,255,0.7)',
                    },
                  }}
                >
                  <MenuItem value="">Sort by</MenuItem>
                  <MenuItem value="preferences">Your Preferences</MenuItem>
                  <MenuItem value="name-asc">Name: A → Z</MenuItem>
                  <MenuItem value="name-desc">Name: Z → A</MenuItem>
                  <MenuItem value="price-asc">Price: Low → High</MenuItem>
                  <MenuItem value="price-desc">Price: High → Low</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Desktop Navigation Icons */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.path || `action-${index}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconButton
                      component={item.onClick ? 'button' : Link}
                      to={item.path}
                      onClick={item.onClick}
                      size="large"
                      sx={{
                        color: isActive ? '#d64a2f' : '#fff',
                        bgcolor: isActive
                          ? 'rgba(214, 74, 47, 0.1)'
                          : 'transparent',
                        px: 1,
                        py: 1,
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: isActive
                            ? 'rgba(214, 74, 47, 0.15)'
                            : 'rgba(255, 255, 255, 0.1)',
                          color: isActive ? '#d64a2f' : '#fefdfb',
                        },
                      }}
                    >
                      {item.icon}
                    </IconButton>
                  </motion.div>
                );
              })}
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              onClick={handleMenuToggle}
              sx={{
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>

        {/* Mobile Search and Sort - Show below toolbar on products page */}
        {isProductsPage && isMobile && onSearchChange && (
          <Box sx={{ px: 2, pb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search products..."
              value={searchTerm || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(255,255,255,0.4)',
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255,255,255,0.6)',
                  opacity: 1,
                },
              }}
            />
            <FormControl fullWidth size="small">
              <Select
                value={sortOption || ''}
                onChange={(e) => onSortChange(e.target.value)}
                displayEmpty
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  </InputAdornment>
                }
                sx={{
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.4)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'rgba(255,255,255,0.7)',
                  },
                }}
              >
                <MenuItem value="">Sort by</MenuItem>
                <MenuItem value="preferences">Your Preferences</MenuItem>
                <MenuItem value="name-asc">Name: A → Z</MenuItem>
                <MenuItem value="name-desc">Name: Z → A</MenuItem>
                <MenuItem value="price-asc">Price: Low → High</MenuItem>
                <MenuItem value="price-desc">Price: High → Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMenuClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            bgcolor: '#785cb3',
            color: '#fff',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Menu
            </Typography>
            <IconButton onClick={handleMenuClose} sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }} />
          <List>
            {navItems.map((item, index) => (
              <ListItem
                key={item.path || `action-${index}`}
                component={item.onClick ? 'button' : Link}
                to={item.path}
                onClick={(e) => {
                  if (item.onClick) {
                    item.onClick(e);
                  } else {
                    handleMenuClose();
                  }
                }}
                sx={{
                  color: '#fff',
                  borderRadius: 1,
                  mb: 1,
                  bgcolor:
                    location.pathname === item.path
                      ? 'rgba(255,255,255,0.1)'
                      : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                  },
                  textDecoration: 'none',
                  cursor: 'pointer',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </motion.div>
  );
}
