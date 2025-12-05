import React, { useState } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Avatar,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {login as apiLogin} from '../services/api';

import logo from '/logo.png';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  React.useEffect(() => {
    if (searchParams.get('confirmed') === 'true') {
      setSuccess('Email confirmed successfully! You can now log in.');
    } else if (searchParams.get('error')) {
      const errorCode = searchParams.get('error');
      if (errorCode === 'expired_token') {
        setError('Your confirmation link has expired. Please register again.');
      } else {
        setError('Email confirmation failed. Please try again or contact support.');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiLogin(formData);

      if (response?.token && response?.user) {
        localStorage.setItem('token', response.token);
        // Storing the whole user object in localStorage is not recommended.
        // Storing a stringified version is better.
        localStorage.setItem('user', JSON.stringify(response.user));
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#e8e8e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          mx: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          overflow: 'visible',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            bgcolor: '#785cb3',
            borderRadius: 2,
            mx: 'auto',
            mt: -5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 9,
          }}
        >
          <img
            src={logo}
            alt="SnackSmart"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
        <CardContent sx={{ p: { xs: 3, sm: 4 }, pt: 0 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to continue
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                bgcolor: '#d9534f',
                '&:hover': { bgcolor: '#c9302c' },
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  style={{
                    color: '#d9534f',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
