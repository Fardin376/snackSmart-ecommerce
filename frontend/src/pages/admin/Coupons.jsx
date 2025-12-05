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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  IconButton,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardActions,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { couponService } from '../../services/adminService';

export default function Coupons() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    validFrom: '',
    validTo: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const data = await couponService.getAll();
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value.toString(),
        validFrom: coupon.validFrom.split('T')[0],
        validTo: coupon.validTo.split('T')[0],
        isActive: coupon.isActive,
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        type: 'percentage',
        value: '',
        validFrom: '',
        validTo: '',
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.code ||
      !formData.value ||
      !formData.validFrom ||
      !formData.validTo
    ) {
      setNotification({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error',
      });
      return;
    }

    if (parseFloat(formData.value) <= 0) {
      setNotification({
        open: true,
        message: 'Value must be greater than 0',
        severity: 'error',
      });
      return;
    }

    if (formData.type === 'percentage' && parseFloat(formData.value) > 100) {
      setNotification({
        open: true,
        message: 'Percentage value cannot exceed 100',
        severity: 'error',
      });
      return;
    }

    if (new Date(formData.validFrom) >= new Date(formData.validTo)) {
      setNotification({
        open: true,
        message: 'Valid From date must be before Valid To date',
        severity: 'error',
      });
      return;
    }

    try {
      setSubmitting(true);
      const couponData = {
        ...formData,
        value: parseFloat(formData.value),
      };

      if (editingCoupon) {
        await couponService.update(editingCoupon.id, couponData);
        setNotification({
          open: true,
          message: 'Coupon updated successfully',
          severity: 'success',
        });
      } else {
        await couponService.create(couponData);
        setNotification({
          open: true,
          message: 'Coupon created successfully',
          severity: 'success',
        });
      }
      await fetchCoupons();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving coupon:', error);
      setNotification({
        open: true,
        message:
          error.response?.data?.message ||
          'Error saving coupon. Please try again.',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (couponId) => {
    if (confirm('Are you sure you want to deactivate this coupon?')) {
      try {
        await couponService.deactivate(couponId);
        setNotification({
          open: true,
          message: 'Coupon deactivated successfully',
          severity: 'success',
        });
        await fetchCoupons();
      } catch (error) {
        console.error('Error deactivating coupon:', error);
        setNotification({
          open: true,
          message:
            error.response?.data?.message ||
            'Error deactivating coupon. Please try again.',
          severity: 'error',
        });
      }
    }
  };

  const handleDelete = async (couponId) => {
    if (
      confirm(
        'Are you sure you want to delete this coupon? This action cannot be undone.'
      )
    ) {
      try {
        await couponService.delete(couponId);
        setNotification({
          open: true,
          message: 'Coupon deleted successfully',
          severity: 'success',
        });
        await fetchCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
        setNotification({
          open: true,
          message:
            error.response?.data?.message ||
            'Error deleting coupon. Please try again.',
          severity: 'error',
        });
      }
    }
  };

  const getStatusChip = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validTo = new Date(coupon.validTo);

    if (!coupon.isActive) {
      return (
        <Chip
          label="Inactive"
          size="small"
          sx={{ bgcolor: '#9e9e9e', color: '#fff' }}
        />
      );
    } else if (now > validTo) {
      return (
        <Chip
          label="Expired"
          size="small"
          sx={{ bgcolor: '#f44336', color: '#fff' }}
        />
      );
    } else if (now < validFrom) {
      return (
        <Chip
          label="Scheduled"
          size="small"
          sx={{ bgcolor: '#2196F3', color: '#fff' }}
        />
      );
    } else {
      return (
        <Chip
          label="Active"
          size="small"
          sx={{ bgcolor: '#4CAF50', color: '#fff' }}
        />
      );
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
        Coupon Management
      </Typography>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Create and manage discount coupons
      </Typography>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box sx={{ p: { xs: 2, sm: 2.5 }, borderBottom: '1px solid #e0e0e0' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              All Coupons
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                bgcolor: '#1a1a1a',
                '&:hover': { bgcolor: '#333' },
                textTransform: 'none',
              }}
            >
              Create Coupon
            </Button>
          </Box>
        </Box>

        {/* Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : isMobile ? (
          <Box sx={{ p: 2 }}>
            {coupons.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {coupons.map((coupon) => (
                  <Card key={coupon.id} variant="outlined">
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, fontFamily: 'monospace' }}
                        >
                          {coupon.code}
                        </Typography>
                        {getStatusChip(coupon)}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip
                          label={coupon.type}
                          size="small"
                          sx={{
                            bgcolor:
                              coupon.type === 'percentage'
                                ? '#2196F3'
                                : '#FF9800',
                            color: '#fff',
                            textTransform: 'capitalize',
                          }}
                        />
                        <Chip
                          label={
                            coupon.type === 'percentage'
                              ? `${coupon.value}%`
                              : `$${parseFloat(coupon.value).toFixed(2)}`
                          }
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                      <Divider sx={{ my: 1.5 }} />
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Valid From:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {new Date(coupon.validFrom).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Valid To:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {new Date(coupon.validTo).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions
                      sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}
                    >
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(coupon)}
                        sx={{ textTransform: 'none' }}
                      >
                        Edit
                      </Button>
                      {coupon.isActive && (
                        <Button
                          size="small"
                          color="warning"
                          startIcon={<BlockIcon />}
                          onClick={() => handleDeactivate(coupon.id)}
                          sx={{ textTransform: 'none' }}
                        >
                          Deactivate
                        </Button>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography
                variant="body2"
                sx={{ color: '#999', textAlign: 'center', py: 4 }}
              >
                No coupons found
              </Typography>
            )}
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#fafafa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Valid From</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Valid To</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {coupons.length > 0 ? (
                  coupons.map((coupon) => (
                    <TableRow
                      key={coupon.id}
                      sx={{
                        '&:hover': { bgcolor: '#fafafa' },
                        '&:last-child td': { borderBottom: 0 },
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, fontFamily: 'monospace' }}
                        >
                          {coupon.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={coupon.type}
                          size="small"
                          sx={{
                            bgcolor:
                              coupon.type === 'percentage'
                                ? '#2196F3'
                                : '#FF9800',
                            color: '#fff',
                            textTransform: 'capitalize',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {coupon.type === 'percentage'
                            ? `${coupon.value}%`
                            : `$${parseFloat(coupon.value).toFixed(2)}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {new Date(coupon.validFrom).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {new Date(coupon.validTo).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(coupon)}</TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            justifyContent: 'center',
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(coupon)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {coupon.isActive && (
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleDeactivate(coupon.id)}
                            >
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(coupon.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        No coupons found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={window.innerWidth < 600}
      >
        <DialogTitle>
          {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Coupon Code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                required
                placeholder="e.g., SAVE20"
                helperText="Use uppercase letters and numbers only"
              />
              <FormControl required>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Discount Type"
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed">Fixed Amount</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={
                  formData.type === 'percentage'
                    ? 'Percentage (%)'
                    : 'Amount ($)'
                }
                type="number"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                required
                inputProps={{
                  step: formData.type === 'percentage' ? '1' : '0.01',
                  min: '0',
                  max: formData.type === 'percentage' ? '100' : undefined,
                }}
              />
              <TextField
                label="Valid From"
                type="date"
                value={formData.validFrom}
                onChange={(e) =>
                  setFormData({ ...formData, validFrom: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                label="Valid To"
                type="date"
                value={formData.validTo}
                onChange={(e) =>
                  setFormData({ ...formData, validTo: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
              />
              <FormControl>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.isActive}
                  label="Status"
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.value })
                  }
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button
              onClick={handleCloseDialog}
              disabled={submitting}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                bgcolor: '#1a1a1a',
                '&:hover': { bgcolor: '#333' },
                textTransform: 'none',
              }}
            >
              {submitting
                ? 'Saving...'
                : editingCoupon
                ? 'Save Changes'
                : 'Create Coupon'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
