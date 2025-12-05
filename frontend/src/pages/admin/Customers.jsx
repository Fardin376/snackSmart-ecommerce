import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Switch,
  TextField,
  InputAdornment,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { customerService } from '../../services/adminService';

export default function Customers() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const fetchCustomers = async () => {
    try {
      const data = await customerService.getAll(searchTerm);
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (customerId, currentStatus) => {
    try {
      await customerService.updateStatus(customerId, !currentStatus);
      setNotification({
        open: true,
        message: `Customer ${
          !currentStatus ? 'activated' : 'deactivated'
        } successfully`,
        severity: 'success',
      });
      await fetchCustomers();
    } catch (error) {
      console.error('Error updating customer status:', error);
      setNotification({
        open: true,
        message:
          error.response?.data?.message ||
          'Error updating customer status. Please try again.',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
        Customer Management
      </Typography>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        View and manage customer accounts
      </Typography>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Search Bar */}
        <Box sx={{ p: { xs: 2, sm: 2.5 }, borderBottom: '1px solid #e0e0e0' }}>
          <TextField
            size="small"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#999' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: '100%', sm: 300 },
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f5f5f5',
              },
            }}
          />
        </Box>

        {/* Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : isMobile ? (
          <Box sx={{ p: 2 }}>
            {customers.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {customers.map((customer) => (
                  <Card key={customer.id} variant="outlined">
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 500, mb: 0.5 }}
                          >
                            {customer.firstName} {customer.lastName}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: '#666', mb: 1 }}
                          >
                            {customer.email}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999' }}>
                            Joined{' '}
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Switch
                          checked={customer.isActive}
                          onChange={() =>
                            handleStatusToggle(customer.id, customer.isActive)
                          }
                          size="small"
                        />
                      </Box>
                      <Chip
                        label={customer.isActive ? 'active' : 'inactive'}
                        size="small"
                        sx={{
                          bgcolor: customer.isActive ? '#000' : '#e0e0e0',
                          color: customer.isActive ? '#fff' : '#666',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography
                variant="body2"
                sx={{ color: '#999', textAlign: 'center', py: 4 }}
              >
                No customers found
              </Typography>
            )}
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#fafafa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Join Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      sx={{
                        '&:hover': { bgcolor: '#fafafa' },
                        '&:last-child td': { borderBottom: 0 },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {customer.firstName} {customer.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {customer.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={customer.isActive ? 'active' : 'inactive'}
                          size="small"
                          sx={{
                            bgcolor: customer.isActive ? '#000' : '#e0e0e0',
                            color: customer.isActive ? '#fff' : '#666',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={customer.isActive}
                          onChange={() =>
                            handleStatusToggle(customer.id, customer.isActive)
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        No customers found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
