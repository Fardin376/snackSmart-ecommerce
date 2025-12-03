import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import axios from 'axios';

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid confirmation link');
        return;
      }

      try {
        const response = await axios.get(
          `${apiUrl}/auth/confirm?token=${token}`
        );
        setStatus('success');
        setMessage(response.data.message);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Confirmation failed');
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #8b7bb8 0%, #9b8bc8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: '100%',
          mx: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          {status === 'verifying' && (
            <>
              <CircularProgress size={60} sx={{ color: '#785cb3', mb: 3 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Verifying Email
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please wait while we confirm your email address...
              </Typography>
            </>
          )}

          {status === 'success' && (
            <>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: '#4caf50',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <CheckCircle sx={{ fontSize: 50 }} />
              </Avatar>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, mb: 2, color: '#4caf50' }}
              >
                Email Confirmed!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Your email has been confirmed! You can now log in.
              </Typography>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: '#785cb3',
                  '&:hover': { bgcolor: '#6a4c9f' },
                  px: 4,
                  textTransform: 'none',
                }}
              >
                Go to Login
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: '#f44336',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <ErrorIcon sx={{ fontSize: 50 }} />
              </Avatar>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, mb: 2, color: '#f44336' }}
              >
                Verification Failed
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {message}
              </Typography>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: '#785cb3',
                  '&:hover': { bgcolor: '#6a4c9f' },
                  px: 4,
                  textTransform: 'none',
                }}
              >
                Register Again
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
