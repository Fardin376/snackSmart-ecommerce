import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

/**
 * Middleware to verify admin JWT token
 */
export const verifyAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if token is for admin
    if (!decoded.adminId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    req.adminId = decoded.adminId;
    req.adminEmail = decoded.email;
    req.adminRole = decoded.role;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * Middleware to verify Super Admin role
 */
export const verifySuperAdmin = (req, res, next) => {
  if (req.adminRole !== 'Super Admin') {
    return res.status(403).json({ message: 'Super Admin access required' });
  }
  next();
};
