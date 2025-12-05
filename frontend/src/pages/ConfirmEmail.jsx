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
import { confirmEmail as confirmEmailApi } from '../services/api';

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
<<<<<<< HEAD
  const [message, setMessage] = useState(
    'Please wait while we confirm your email address...'
  );
=======
  const [message, setMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
>>>>>>> f82d4fcc45a32ef9506f373cbc26618803e9819c

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      if (token) {
        try {
          const data = await confirmEmailApi(token);
          setStatus('success');
          setMessage(data.message || 'Email confirmed successfully!');
          setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
          setStatus('error');
          setMessage(error.message || 'Email confirmation failed.');
        }
      } else {
        setStatus('error');
<<<<<<< HEAD
        setMessage('Invalid or missing confirmation token in the URL.');
=======
        setMessage('Invalid confirmation link');
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/auth/confirm?token=${token}`
        );
        setStatus('success');
        setMessage(response.data.message);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Confirmation failed');
>>>>>>> f82d4fcc45a32ef9506f373cbc26618803e9819c
      }
    };

    verifyToken();
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
                Verifying Your Email
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please wait while we confirm your email address...
              </Typography>
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

          {status === 'success' && (
            <>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'success.main',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <CheckCircle sx={{ fontSize: 50 }} />
              </Avatar>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, mb: 2, color: 'success.main' }}
              >
                Verification Successful
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {message} You will be redirected to the login page shortly.
              </Typography>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                sx={{ bgcolor: '#785cb3', '&:hover': { bgcolor: '#6a4c9f' } }}
              >
                Go to Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
