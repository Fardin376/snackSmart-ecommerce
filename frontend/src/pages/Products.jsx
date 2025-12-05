import React, { useState, useEffect } from 'react';
import productService from '../services/productService.js';
import { addToCart } from '../services/cart.js';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Button,
  Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export default function Products({ searchTerm, sortOption, onCartUpdate }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchProducts();
  }, [searchTerm]);

const fetchProducts = async () => {
  setIsLoading(true);
  setError('');

  try {
    let data;

    if (searchTerm && searchTerm.trim() !== '') {
      // User typed something → search
      data = await productService.searchProducts(searchTerm);
    } else {
      // No search term → load all products
      data = await productService.getAllProducts();
    }

    console.log('Products.jsx fetched products:', data);
    setProducts(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('fetchProducts error:', err);
    setError(
      err?.error ||
        err?.message ||
        'Failed to load products. Please try again.'
    );
  } finally {
    setIsLoading(false);
  }
};


  // Sort products
  const sortedProducts = React.useMemo(() => {
    if (!sortOption || !products.length) return products;

    const sorted = [...products];
    switch (sortOption) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'price-asc':
        return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'price-desc':
        return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      default:
        return sorted;
    }
  }, [products, sortOption]);

  // Handle add to cart
  const handleAddToCart = async (product) => {
    // Check if user is logged in
    const userJson = localStorage.getItem('user');
    let user = null;
    if (userJson && userJson !== 'undefined') {
      user = JSON.parse(userJson);
    }

    if (!user || !user.id) {
      setSnackbar({
        open: true,
        message: 'Please log in to add items to cart',
        severity: 'warning',
      });
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [product.id]: true }));

    try {
      const result = await addToCart(product.id, 1);

      if (result.ok) {
        setSnackbar({
          open: true,
          message: `${product.name} added to cart!`,
          severity: 'success',
        });
        // Update cart badge immediately
        if (onCartUpdate) {
          onCartUpdate();
        }
      } else {
        throw new Error(result.error || 'Failed to add to cart');
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to add item to cart. Please try again.',
        severity: 'error',
      });
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.50',
        py: { xs: 4, md: 6 },
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="xl" sx={{ width: '100%' }}>
        {/* Search Results Count */}
        {searchTerm && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, textAlign: 'center' }}
          >
            Found {sortedProducts.length} result
            {sortedProducts.length !== 1 ? 's' : ''} for "{searchTerm}"
          </Typography>
        )}

        {/* Header */}
        <Box sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
            }}
          >
            Our Products
          </Typography>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={48} sx={{ color: '#785cb3' }} />
          </Box>
        )}

        {/* Products Grid */}
        {!isLoading && sortedProducts.length > 0 && (
          <Grid
            container
            spacing={{ xs: 2, sm: 2.5, md: 3 }}
            sx={{ justifyContent: 'center' }}
          >
            {sortedProducts.map((product) => (
              <Grid
                item
                xs={6}
                sm={4}
                md={2.4}
                lg={2.4}
                xl={2.4}
                key={product.id}
              >
                <Card
                  sx={{
                    height: '100%',
                    minHeight: { xs: 320, sm: 360, md: 400 },
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  {/* Product Image */}
                  <Box
                    sx={{
                      height: { xs: 140, sm: 160, md: 180 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2,
                      bgcolor: 'grey.50',
                    }}
                  >
                    {product.image ? (
                      <CardMedia
                        component="img"
                        image={product.image}
                        alt={product.name}
                        sx={{
                          height: '100%',
                          width: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%',
                          bgcolor: 'grey.100',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="caption" color="text.disabled">
                          No Image
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 2 }}>
                    {/* Product Name */}
                    <Typography
                      variant="subtitle2"
                      component="h3"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        height: { xs: 36, sm: 40 },
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                      }}
                    >
                      {product.name}
                    </Typography>

                    {/* Product Description */}
                    {product.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          mb: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: { xs: 28, sm: 32 },
                        }}
                      >
                        {product.description}
                      </Typography>
                    )}

                    {/* Product Price */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#16a34a',
                        mb: 1.5,
                        fontSize: { xs: '1rem', sm: '1.125rem' },
                      }}
                    >
                      ${parseFloat(product.price).toFixed(2)}
                    </Typography>

                    {/* Category Badge */}
                    {product.category && (
                      <Chip
                        label={product.category}
                        size="small"
                        sx={{
                          bgcolor: 'grey.100',
                          color: 'text.secondary',
                          fontWeight: 500,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          height: { xs: 22, sm: 24 },
                          mb: 1.5,
                        }}
                      />
                    )}

                    {/* Add to Cart Button */}
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCart[product.id]}
                      sx={{
                        bgcolor: '#1a1a2e',
                        color: 'white',
                        textTransform: 'none',
                        fontWeight: 600,
                        py: { xs: 0.75, sm: 1 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        '&:hover': {
                          bgcolor: '#16213e',
                        },
                        '&:disabled': {
                          bgcolor: 'grey.300',
                        },
                      }}
                    >
                      {addingToCart[product.id] ? 'Adding...' : 'Add to Cart'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Empty State */}
        {!isLoading && sortedProducts.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              textAlign: 'center',
              py: { xs: 8, md: 12 },
              bgcolor: 'transparent',
            }}
          >
            <SearchIcon
              sx={{
                fontSize: { xs: 64, md: 80 },
                color: 'grey.300',
                mb: 3,
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 1,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
              }}
            >
              No results found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {searchTerm
                ? `No products match "${searchTerm}". Try a different search term.`
                : 'No products available at the moment.'}
            </Typography>
          </Paper>
        )}
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
