import { Response, NextFunction } from 'express';
import { AuthRequest } from '../models/types';
import {
  createUser,
  getUserByEmail,
  verifyPassword,
  markEmailVerified,
} from '../services/userService';
import { sendVerificationEmail } from '../services/emailService';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection';
import Joi from 'joi';

const registerSchema = Joi.object({
  name: Joi.string().required().min(3),
  email: Joi.string().email().required(),
  province: Joi.string().required(),
  password: Joi.string().required().min(8),
  acceptsMarketing: Joi.boolean().default(false),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const register = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const existingUser = await getUserByEmail(value.email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await createUser(
      value.name,
      value.email,
      value.password,
      value.province,
      value.acceptsMarketing
    );

    const verificationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await query(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, verificationToken, expiresAt]
    );

    try {
      await sendVerificationEmail(
        user.email,
        verificationToken,
        process.env.FRONTEND_URL!
      );
    } catch (emailError) {
      console.warn('Email sending failed, but continuing:', emailError);
    }

    return res.status(201).json({
      userId: user.id,
      message: 'Registration successful. Check your email to verify.',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    const result = await query(
      `SELECT user_id, expires_at FROM email_verification_tokens 
       WHERE token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const { user_id, expires_at } = result.rows[0];

    if (new Date(expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token expired' });
    }

    await markEmailVerified(user_id);
    await query(`DELETE FROM email_verification_tokens WHERE token = $1`, [
      token,
    ]);

    return res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await getUserByEmail(value.email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.emailVerified) {
      return res
        .status(403)
        .json({ error: 'Please verify your email first' });
    }

    const passwordMatch = await verifyPassword(
      value.password,
      user.passwordHash
    );
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRATION || '7d') as SignOptions['expiresIn'] }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
