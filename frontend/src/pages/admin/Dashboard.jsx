import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { dashboardService, salesService } from '../../services/adminService.js';

function StatsCard({ title, value, subtitle, icon, color }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: '#999' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, topProductsData, ordersData] = await Promise.all([
        dashboardService.getStats(),
        salesService.getTopProducts(),
        salesService.getRecentOrders(5),
      ]);
      setStats(statsData);
      setTopProducts(topProductsData);
      setRecentOrders(ordersData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(
        error.response?.data?.message || 'Failed to load dashboard data'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" sx={{ color: '#f44336', mb: 2 }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={fetchDashboardData}
          sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' } }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
        Dashboard
      </Typography>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Welcome back! Here's what's happening with your store today.
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatsCard
            title="Total Customers"
            value={stats?.totalCustomers || 0}
            subtitle="Active registered users"
            icon={<PeopleIcon sx={{ fontSize: 28, color: '#4CAF50' }} />}
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatsCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            subtitle="Items in inventory"
            icon={<InventoryIcon sx={{ fontSize: 28, color: '#2196F3' }} />}
            color="#2196F3"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatsCard
            title="Today's Sales"
            value={stats?.todaySales || 0}
            subtitle="Orders placed today"
            icon={<TrendingIcon sx={{ fontSize: 28, color: '#FF9800' }} />}
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatsCard
            title="Month Revenue"
            value={`$${parseFloat(stats?.monthRevenue || 0).toFixed(2)}`}
            subtitle="Total for current month"
            icon={<MoneyIcon sx={{ fontSize: 28, color: '#9C27B0' }} />}
            color="#9C27B0"
          />
        </Grid>
      </Grid>

      {/* Top Selling Products */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          border: '1px solid #e0e0e0',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Top Selling Products
        </Typography>
        {topProducts.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {topProducts.map((product, index) => (
              <Box
                key={product.productId}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 1, sm: 0 },
                  p: { xs: 1.5, sm: 2 },
                  bgcolor: '#fafafa',
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: '#999', minWidth: 30 }}
                  >
                    #{index + 1}
                  </Typography>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {product.productName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {product.totalQuantity} units sold
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: '#4CAF50' }}
                >
                  ${parseFloat(product.totalRevenue).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{ color: '#999', textAlign: 'center', py: 4 }}
          >
            No sales data available
          </Typography>
        )}
      </Paper>

      {/* Recent Orders */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          border: '1px solid #e0e0e0',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Recent Orders
        </Typography>
        {recentOrders.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {recentOrders.map((order) => (
              <Box
                key={order.id}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 1, sm: 0 },
                  p: { xs: 1.5, sm: 2 },
                  bgcolor: '#fafafa',
                  borderRadius: 1,
                }}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Order #{order.id.toString().padStart(4, '0')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {order.user.firstName} {order.user.lastName} •{' '}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ${parseFloat(order.total).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{ color: '#999', textAlign: 'center', py: 4 }}
          >
            No orders yet
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
