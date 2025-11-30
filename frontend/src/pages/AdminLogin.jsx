import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { adminAuthService } from '../services/adminService';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminAuthService.login(
        formData.email,
        formData.password
      );
      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('adminUser', JSON.stringify(response.admin));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8f9fa',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: 4, border: '1px solid #e0e0e0' }}>
          {/* Logo */}
          <Box
            sx={{
              width: 60,
              height: 60,
              bgcolor: '#FF6B35',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 32 }}>
              S
            </Typography>
          </Box>

          <Typography
            variant="h5"
            sx={{ textAlign: 'center', fontWeight: 600, mb: 1 }}
          >
            Admin Login
          </Typography>
          <Typography
            variant="body2"
            sx={{ textAlign: 'center', color: '#666', mb: 3 }}
          >
            Sign in to access the admin panel
          </Typography>

          {/* Demo Credentials */}
          <Box
            sx={{
              bgcolor: '#f5f5f5',
              p: 2,
              borderRadius: 1,
              mb: 3,
              border: '1px solid #e0e0e0',
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: '#666' }}
            >
              Demo Credentials:
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Email: <strong>admin@snacksmart.com</strong>
            </Typography>
            <Typography variant="body2">
              Password: <strong>admin123</strong>
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: '#1a1a1a',
                '&:hover': { bgcolor: '#333' },
                py: 1.5,
                textTransform: 'none',
                fontSize: 16,
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
