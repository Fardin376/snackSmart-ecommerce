import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  CircularProgress,
  Chip,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  ShoppingCart as CartIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { salesService } from '../../services/adminService';

const SummaryCard = ({ title, value, icon: Icon, color }) => (
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
      <Icon sx={{ fontSize: 28, color }} />
    </Box>
    <Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

export default function Sales() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [dateRange, setDateRange] = useState({
    fromDate: '',
    toDate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const [summaryData, topProductsData, ordersData] = await Promise.all([
        salesService.getSummary(filters.fromDate, filters.toDate),
        salesService.getTopProducts(filters.fromDate, filters.toDate),
        salesService.getRecentOrders(),
      ]);
      setSummary(summaryData);
      setTopProducts(topProductsData);
      setRecentOrders(ordersData);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError(error.response?.data?.message || 'Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchData(dateRange);
  };

  const handleReset = () => {
    setDateRange({ fromDate: '', toDate: '' });
    fetchData();
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
        Sales Monitoring
      </Typography>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Track sales performance and revenue
      </Typography>

      {/* Date Filter */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 3,
          border: '1px solid #e0e0e0',
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', sm: 'center' },
            flexWrap: 'wrap',
          }}
        >
          <TextField
            label="From Date"
            type="date"
            value={dateRange.fromDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, fromDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ width: { xs: '100%', sm: 200 } }}
          />
          <TextField
            label="To Date"
            type="date"
            value={dateRange.toDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, toDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ width: { xs: '100%', sm: 200 } }}
          />
          <Button
            variant="contained"
            onClick={handleFilter}
            sx={{
              bgcolor: '#1a1a1a',
              '&:hover': { bgcolor: '#333' },
              textTransform: 'none',
            }}
          >
            Apply Filter
          </Button>
          <Button
            onClick={handleReset}
            sx={{ textTransform: 'none', color: '#666' }}
          >
            Reset
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: '#f44336', mb: 2 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => fetchData(dateRange)}
            sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' } }}
          >
            Retry
          </Button>
        </Box>
      ) : (
        <>
          {/* Stats Cards */}
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <SummaryCard
                icon={CartIcon}
                title="Total Orders"
                value={summary?.totalOrders || 0}
                color="#FF6B35"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <SummaryCard
                icon={MoneyIcon}
                title="Total Revenue"
                value={`$${parseFloat(summary?.totalRevenue || 0).toFixed(2)}`}
                color="#4CAF50"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <SummaryCard
                icon={TrendingIcon}
                title="Average Order Value"
                value={`$${parseFloat(summary?.averageOrderValue || 0).toFixed(
                  2
                )}`}
                color="#2196F3"
              />
            </Grid>
          </Grid>

          {/* Top Selling Products */}
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Top Selling Products
              </Typography>
            </Box>
            {isMobile ? (
              <Box sx={{ p: 2 }}>
                {topProducts.length > 0 ? (
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    {topProducts.map((product, index) => (
                      <Card key={product.productId} variant="outlined">
                        <CardContent>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mb: 2,
                            }}
                          >
                            <Chip
                              label={`#${index + 1}`}
                              size="small"
                              sx={{
                                bgcolor: index === 0 ? '#FFD700' : '#e0e0e0',
                                fontWeight: 600,
                              }}
                            />
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 600, color: '#4CAF50' }}
                            >
                              ${parseFloat(product.totalRevenue).toFixed(2)}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 500, mb: 1 }}
                          >
                            {product.productName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            {product.totalQuantity} units sold
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: '#999', textAlign: 'center', py: 4 }}
                  >
                    No product sales data available
                  </Typography>
                )}
              </Box>
            ) : (
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#fafafa' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Units Sold</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topProducts.length > 0 ? (
                      topProducts.map((product, index) => (
                        <TableRow
                          key={product.productId}
                          sx={{
                            '&:hover': { bgcolor: '#fafafa' },
                            '&:last-child td': { borderBottom: 0 },
                          }}
                        >
                          <TableCell>
                            <Chip
                              label={`#${index + 1}`}
                              size="small"
                              sx={{
                                bgcolor: index === 0 ? '#FFD700' : '#e0e0e0',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {product.productName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {product.totalQuantity} units
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: '#4CAF50' }}
                            >
                              ${parseFloat(product.totalRevenue).toFixed(2)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" sx={{ color: '#999' }}>
                            No product sales data available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* Recent Orders */}
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Orders
              </Typography>
            </Box>
            {isMobile ? (
              <Box sx={{ p: 2 }}>
                {recentOrders.length > 0 ? (
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    {recentOrders.map((order) => (
                      <Card key={order.id} variant="outlined">
                        <CardContent>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mb: 2,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: 'monospace', fontWeight: 500 }}
                            >
                              ORD-{order.id.toString().padStart(4, '0')}
                            </Typography>
                            <Chip
                              label={order.status}
                              size="small"
                              sx={{
                                bgcolor:
                                  order.status === 'completed'
                                    ? '#4CAF50'
                                    : order.status === 'pending'
                                    ? '#FF9800'
                                    : '#f44336',
                                color: '#fff',
                                fontWeight: 500,
                                fontSize: '0.75rem',
                              }}
                            />
                          </Box>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 500, mb: 0.5 }}
                          >
                            {order.user.firstName} {order.user.lastName}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: '#666', mb: 1 }}
                          >
                            {new Date(order.createdAt).toLocaleDateString()}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: '#1a1a1a' }}
                          >
                            ${parseFloat(order.total).toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
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
              </Box>
            ) : (
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#fafafa' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <TableRow
                          key={order.id}
                          sx={{
                            '&:hover': { bgcolor: '#fafafa' },
                            '&:last-child td': { borderBottom: 0 },
                          }}
                        >
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: 'monospace' }}
                            >
                              ORD-{order.id.toString().padStart(4, '0')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {order.user.firstName} {order.user.lastName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              ${parseFloat(order.total).toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={order.status}
                              size="small"
                              sx={{
                                bgcolor:
                                  order.status === 'completed'
                                    ? '#4CAF50'
                                    : order.status === 'pending'
                                    ? '#FF9800'
                                    : '#f44336',
                                color: '#fff',
                                fontWeight: 500,
                                fontSize: '0.75rem',
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" sx={{ color: '#999' }}>
                            No orders yet
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
}
