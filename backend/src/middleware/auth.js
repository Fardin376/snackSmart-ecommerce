import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ ok: false, error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // Attach user info to request
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ ok: false, error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ ok: false, error: 'Authentication failed' });
  }
};

/**
 * Optional authentication middleware - allows both authenticated and guest users
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user info if valid token
        console.log('optionalAuth: User authenticated', {
          userId: decoded.userId,
          email: decoded.email,
        });
      } catch (error) {
        // Invalid token, continue as guest
        console.log('optionalAuth: Invalid token, continuing as guest');
        req.user = null;
      }
    } else {
      console.log('optionalAuth: No auth header, continuing as guest');
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    req.user = null;
    next();
  }
};
