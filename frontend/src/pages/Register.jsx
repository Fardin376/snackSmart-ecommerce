import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';
import { z } from 'zod';
import { register as apiRegister } from '../services/api';

import logo from '/logo.png';

const nameZ = z.string().min(3).max(50);
const emailZ = z.string().email();
const passwordZ = z
  .string()
  .min(8)
  .regex(/[!@#$%^&*(),.?\":{}|<>]/, 'Include at least one special char')
  .regex(/[A-Z]/, 'Include uppercase')
  .regex(/[a-z]/, 'Include lowercase')
  .regex(/[0-9]/, 'Include number');

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErrors({});
    setServerError('');
    setSuccessMessage('');

    const validation = {};
    const fn = nameZ.safeParse(firstName);
    const ln = nameZ.safeParse(lastName);
    const em = emailZ.safeParse(email);
    const pw = passwordZ.safeParse(password);

    if (!fn.success) validation.firstName = fn.error.errors[0].message;
    if (!ln.success) validation.lastName = ln.error.errors[0].message;
    if (!em.success) validation.email = em.error.errors[0].message;
    if (!pw.success) validation.password = pw.error.errors[0].message;

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    try {
      await apiRegister({ firstName, lastName, email, password });
      setSuccessMessage(
        'Your account has been created. Please check your inbox to confirm your email.'
      );
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#e8e8e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 2, sm: 4 },
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          mx: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          overflow: 'visible',
        }}
      >
        <Box
          sx={{
            width: 70,
            height: 70,
            bgcolor: '#785cb3',
            borderRadius: 2,
            mx: 'auto',
            mt: -4,
            mb: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <img
            src={logo}
            alt="SnackSmart"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
        <CardContent sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Sign Up
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              Create your account to get started
            </Typography>
          </Box>

          {successMessage && (
            <Alert icon={<CheckCircle />} severity="success" sx={{ mb: 2, py: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{successMessage}</Typography>
            </Alert>
          )}

          {serverError && (
            <Alert severity="error" sx={{ mb: 2, py: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{serverError}</Typography>
            </Alert>
          )}

          <Box component="form" onSubmit={onSubmit}>
            <TextField
              fullWidth
              size="small"
              label="First Name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={!!errors.firstName}
              helperText={errors.firstName}
              sx={{ mb: 1.5 }}
            />

            <TextField
              fullWidth
              size="small"
              label="Last Name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={!!errors.lastName}
              helperText={errors.lastName}
              sx={{ mb: 1.5 }}
            />

            <TextField
              fullWidth
              size="small"
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
            />

            <TextField
              fullWidth
              size="small"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={
                errors.password ||
                'Must be at least 8 characters with uppercase, lowercase, number, and special character'
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                bgcolor: '#d9534f',
                '&:hover': { bgcolor: '#c9302c' },
                py: 1.2,
                fontSize: '0.95rem',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Sign Up
            </Button>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#d9534f',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
