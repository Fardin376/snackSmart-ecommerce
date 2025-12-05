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
} from '@mui/icons-material';
import { inventoryService } from '../../services/adminService';

const categories = [
  'Mix',
  'Chips',
  'Seaweed',
  'Cakes',
  'Dried Fruit',
  'Seeds',
  'Chocolate',
  'Snacks',
  'Bars',
  'Beverages',
  'Cookies',
];

export default function Inventory() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    image: '',
    status: 'active',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await inventoryService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Create canvas to resize image to 150x150
          const canvas = document.createElement('canvas');
          canvas.width = 150;
          canvas.height = 150;
          const ctx = canvas.getContext('2d');

          // Draw image scaled to 150x150
          ctx.drawImage(img, 0, 0, 150, 150);

          // Convert to base64
          const resizedImage = canvas.toDataURL('image/jpeg', 0.9);
          setImagePreview(resizedImage);
          setFormData({ ...formData, image: resizedImage });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setImagePreview(product.image || null);
      setFormData({
        name: product.name,
        description: product.description || '',
        category: product.category || '',
        price: product.price.toString(),
        stock: product.stock.toString(),
        image: product.image || '',
        status: product.status,
      });
    } else {
      setEditingProduct(null);
      setImagePreview(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        stock: '',
        image: '',
        status: 'active',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.price || !formData.stock) {
      setNotification({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error',
      });
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      setNotification({
        open: true,
        message: 'Price must be greater than 0',
        severity: 'error',
      });
      return;
    }

    if (parseInt(formData.stock) < 0) {
      setNotification({
        open: true,
        message: 'Stock cannot be negative',
        severity: 'error',
      });
      return;
    }

    try {
      setSubmitting(true);
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      if (editingProduct) {
        await inventoryService.update(editingProduct.id, productData);
        setNotification({
          open: true,
          message: 'Product updated successfully',
          severity: 'success',
        });
      } else {
        await inventoryService.create(productData);
        setNotification({
          open: true,
          message: 'Product created successfully',
          severity: 'success',
        });
      }
      await fetchProducts();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving product:', error);
      setNotification({
        open: true,
        message:
          error.response?.data?.message ||
          'Error saving product. Please try again.',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (
      confirm(
        'Are you sure you want to delete this product? This action cannot be undone.'
      )
    ) {
      try {
        await inventoryService.delete(productId);
        setNotification({
          open: true,
          message: 'Product deleted successfully',
          severity: 'success',
        });
        await fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        setNotification({
          open: true,
          message:
            error.response?.data?.message ||
            'Error deleting product. Please try again.',
          severity: 'error',
        });
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
        Inventory Management
      </Typography>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Manage products, stock levels, and pricing
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
              All Products
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
              Add Product
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {products.map((product) => (
                <Card key={product.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#f5f5f5',
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            No image
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, mb: 0.5 }}
                        >
                          {product.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: '#666', mb: 0.5 }}
                        >
                          {product.category || '-'}
                        </Typography>
                        <Chip
                          label={product.status}
                          size="small"
                          sx={{
                            bgcolor:
                              product.status === 'active' ? '#000' : '#e0e0e0',
                            color:
                              product.status === 'active' ? '#fff' : '#666',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                          }}
                        />
                      </Box>
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
                        Price:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ${parseFloat(product.price).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Stock:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: product.stock < 50 ? '#f44336' : '#666',
                          fontWeight: product.stock < 50 ? 600 : 400,
                        }}
                      >
                        {product.stock} units
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions
                    sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}
                  >
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(product)}
                      sx={{ textTransform: 'none' }}
                    >
                      Edit
                    </Button>
                    {product.status === 'active' && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(product.id)}
                        sx={{ textTransform: 'none' }}
                      >
                        Delete
                      </Button>
                    )}
                  </CardActions>
                </Card>
              ))}
            </Box>
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#fafafa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Stock</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    sx={{
                      '&:hover': { bgcolor: '#fafafa' },
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    <TableCell>
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#f5f5f5',
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            No img
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {product.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {product.category || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ${parseFloat(product.price).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: product.stock < 50 ? '#f44336' : '#666',
                          fontWeight: product.stock < 50 ? 600 : 400,
                        }}
                      >
                        {product.stock} units
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.status}
                        size="small"
                        sx={{
                          bgcolor:
                            product.status === 'active' ? '#000' : '#e0e0e0',
                          color: product.status === 'active' ? '#fff' : '#666',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
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
                          onClick={() => handleOpenDialog(product)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        {product.status === 'active' && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(product.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={window.innerWidth < 600}
      >
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {/* Image Upload */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Product Image (150x150px)
              </Typography>
              <Box
                sx={{
                  width: 150,
                  height: 150,
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  overflow: 'hidden',
                  bgcolor: '#f5f5f5',
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No image
                  </Typography>
                )}
              </Box>
              <Button
                variant="outlined"
                component="label"
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
              <Typography
                variant="caption"
                display="block"
                sx={{ mt: 1, color: '#666' }}
              >
                Image will be resized to 150x150px
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <TextField
                label="Product Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <FormControl>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Price ($)"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                inputProps={{ step: '0.01', min: '0' }}
              />
              <TextField
                label="Stock Quantity"
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                required
                inputProps={{ min: '0' }}
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={3}
                sx={{ gridColumn: '1 / -1' }}
              />
              <FormControl>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{ p: 2.5, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}
          >
            <Button
              onClick={handleCloseDialog}
              disabled={submitting}
              sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
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
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {submitting
                ? 'Saving...'
                : editingProduct
                ? 'Save Changes'
                : 'Add Product'}
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
