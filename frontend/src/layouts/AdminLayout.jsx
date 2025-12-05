import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingIcon,
  LocalOffer as CouponIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

const drawerWidth = 256;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Customers', icon: <PeopleIcon />, path: '/admin/customers' },
  { text: 'Admins', icon: <AdminIcon />, path: '/admin/admins' },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/admin/inventory' },
  { text: 'Sales', icon: <TrendingIcon />, path: '/admin/sales' },
  { text: 'Coupons', icon: <CouponIcon />, path: '/admin/coupons' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');

  useEffect(() => {
    if (!adminUser) {
      navigate('/admin/login');
    }
  }, [adminUser, navigate]);

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, [window.location.pathname]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  if (!adminUser) {
    return null;
  }

  const drawerContent = (
    <>
      {/* Logo */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            bgcolor: '#FF6B35',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>
            S
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
          SnackSmart
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 1.5,
                  bgcolor: isActive ? '#f5f5f5' : 'transparent',
                  '&:hover': {
                    bgcolor: isActive ? '#f5f5f5' : '#fafafa',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#1a1a1a' : '#666',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#1a1a1a' : '#666',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#fff',
            borderRight: '1px solid #e0e0e0',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#fff',
            borderRight: '1px solid #e0e0e0',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f8f9fa',
          minHeight: '100vh',
        }}
      >
        {/* Top Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: '#fff',
            borderBottom: '1px solid #e0e0e0',
            color: '#1a1a1a',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ display: { xs: 'block', md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="body1"
                sx={{
                  color: '#666',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Welcome back, <strong>{adminUser.name}</strong>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={handleMenuOpen}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: '#FF6B35',
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {adminUser.name.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <Box sx={{ px: 2, py: 1.5, minWidth: 200 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {adminUser.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {adminUser.email}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: '#FF6B35',
                      fontWeight: 500,
                      mt: 0.5,
                    }}
                  >
                    {adminUser.role}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
