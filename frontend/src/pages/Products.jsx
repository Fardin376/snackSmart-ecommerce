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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  trackInteraction,
  getRecentPreferences,
  getRecommendations,
  clearPreferences,
} from '../services/preferenceService.js';

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
  const [recentPreferences, setRecentPreferences] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [preferencesError, setPreferencesError] = useState('');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchPreferencesData();
  }, [searchTerm, sortOption]);

  const fetchPreferencesData = async () => {
    try {
      setPreferencesError('');
      const [prefsData, recsData] = await Promise.all([
        getRecentPreferences(),
        getRecommendations(),
      ]);
      setRecentPreferences(prefsData.products || []);
      setRecommendations(recsData.recommendations || []);
    } catch (err) {
      console.error('Preferences fetch error:', err);
      setPreferencesError(
        'Unable to load your preferences. Please try again later.'
      );
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    setError('');

    try {
      let data;

      if (searchTerm && searchTerm.trim() !== '') {
        // User typed something → search and track
        data = await productService.searchProducts(searchTerm);
        // Track search interaction for first result
        if (data && data.length > 0) {
          await trackInteraction(data[0].id, 'search');
          // Refresh preferences after tracking
          fetchPreferencesData();
        }
      } else if (sortOption === 'preferences') {
        // Sort by preferences
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const sessionId = localStorage.getItem('sessionId');
        data = await productService.getProductsByPreference(
          user?.id,
          sessionId
        );
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

  // Handle product click
  const handleProductClick = async (product) => {
    await trackInteraction(product.id, 'click');
    // Refresh preferences after tracking
    fetchPreferencesData();
  };

  // Handle add to cart
  const handleAddToCart = async (product) => {
    // Track view interaction
    await trackInteraction(product.id, 'view');
    // Refresh preferences after tracking
    fetchPreferencesData();

    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user') || 'null');

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

  const handleOpenClearDialog = () => {
    setClearDialogOpen(true);
  };

  const handleCloseClearDialog = () => {
    setClearDialogOpen(false);
  };

  const handleClearPreferences = async () => {
    setClearing(true);
    try {
      await clearPreferences();
      setRecentPreferences([]);
      setRecommendations([]);
      setClearDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Preferences cleared successfully',
        severity: 'success',
      });
      // Refresh products if sorted by preferences
      if (sortOption === 'preferences') {
        fetchProducts();
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to clear preferences',
        severity: 'error',
      });
    } finally {
      setClearing(false);
    }
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

        {/* Your Recent Preferences Section */}
        {recentPreferences.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                }}
              >
                Your Recent Preferences
              </Typography>
              <IconButton
                onClick={handleOpenClearDialog}
                size="small"
                sx={{ color: 'error.main' }}
                title="Clear Preferences"
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              {recentPreferences.map((product) => (
                <Grid item xs={6} sm={4} md={3} key={product.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => handleProductClick(product)}
                  >
                    <Box
                      sx={{
                        height: 120,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 1,
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
                        <Typography variant="caption" color="text.disabled">
                          No Image
                        </Typography>
                      )}
                    </Box>
                    <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {product.name}
                      </Typography>
                      {product.category && (
                        <Chip
                          label={product.category}
                          size="small"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Recommended for You Section */}
        {recommendations.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 2,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
              }}
            >
              Recommended for You
            </Typography>
            <Grid container spacing={2}>
              {recommendations.slice(0, 4).map((product) => (
                <Grid item xs={6} sm={4} md={3} key={product.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => handleProductClick(product)}
                  >
                    <Box
                      sx={{
                        height: 120,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 1,
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
                        <Typography variant="caption" color="text.disabled">
                          No Image
                        </Typography>
                      )}
                    </Box>
                    <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        ${parseFloat(product.price).toFixed(2)}
                      </Typography>
                      {product.category && (
                        <Chip
                          label={product.category}
                          size="small"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* No Preferences Message */}
        {!preferencesError &&
          recentPreferences.length === 0 &&
          recommendations.length === 0 &&
          !isLoading && (
            <Alert severity="info" sx={{ mb: 4 }}>
              No preferences available yet. Start exploring to get personalized
              suggestions!
            </Alert>
          )}

        {/* Preferences Error */}
        {preferencesError && (
          <Alert severity="warning" sx={{ mb: 4 }}>
            {preferencesError}
          </Alert>
        )}

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
                  onClick={() => handleProductClick(product)}
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

      {/* Clear Preferences Dialog */}
      <Dialog open={clearDialogOpen} onClose={handleCloseClearDialog}>
        <DialogTitle>Clear All Preferences?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will remove all your saved interactions and preferences. This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClearDialog} disabled={clearing}>
            Cancel
          </Button>
          <Button
            onClick={handleClearPreferences}
            disabled={clearing}
            color="error"
            variant="contained"
          >
            {clearing ? 'Clearing...' : 'Clear Preferences'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
