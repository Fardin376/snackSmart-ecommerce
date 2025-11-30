import { PrismaClient } from '@prisma/client';
import {
  hashPassword,
  comparePassword,
  signEmailToken,
  signAccessToken,
} from '../utils/auth.js';
import { sendConfirmationEmail } from '../utils/email.js';
import { registerSchema, loginSchema } from '../utils/validators.js';

const prisma = new PrismaClient();

/**
 * Register a new user
 */
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate input
    const validatedData = registerSchema.parse({
      firstName,
      lastName,
      email,
      password,
    });

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'This email is already in use.' });
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        password: hashedPassword,
      },
    });

    // Generate email confirmation token
    const token = signEmailToken({ userId: user.id, email: user.email });
    const confirmUrl = `${process.env.FRONTEND_ORIGIN}/confirm?token=${token}`;

    // Send confirmation email
    await sendConfirmationEmail(user.email, confirmUrl);

    res.status(201).json({
      message: 'Account created. Confirmation email sent.',
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.errors) {
      return res.status(400).json({
        errors: error.errors.map((e) => e.message),
      });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Login user
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const validatedData = loginSchema.parse({ email, password });

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check if email is confirmed
    if (!user.confirmed) {
      return res.status(403).json({
        message: 'Please confirm your email before logging in.',
        emailNotConfirmed: true,
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate access token
    const token = signAccessToken({
      userId: user.id,
      email: user.email,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error.errors) {
      return res.status(400).json({
        errors: error.errors.map((e) => e.message),
      });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Confirm email
 */
export const confirmEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Verify token
    const jwt = (await import('jsonwebtoken')).default;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Update user confirmation status
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { confirmed: true },
    });

    res.json({ message: 'Email confirmed successfully!' });
  } catch (error) {
    console.error('Email confirmation error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid token' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token has expired' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get user by ID (protected endpoint example)
 */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        confirmed: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
