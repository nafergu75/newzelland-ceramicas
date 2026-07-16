import { Response, NextFunction } from 'express';
import { AuthRequest } from '../models/types';
import {
  createUser,
  getUserByEmail,
  verifyPassword,
  markEmailVerified,
  getUserById,
} from '../services/userService';
import { sendVerificationEmail } from '../services/emailService';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection';
import Joi from 'joi';

const registerSchema = Joi.object({
  nombre: Joi.string().required().min(3).max(50),
  apellidos: Joi.string().required().min(3).max(50),
  empresa: Joi.string().optional().max(100),
  email: Joi.string().email().required(),
  telefono: Joi.string().required().min(7).max(20),
  password: Joi.string().required().min(8).max(100),
  terminos: Joi.boolean().required().valid(true),
  privacidad: Joi.boolean().required().valid(true),
  newsletter: Joi.boolean().default(false),
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
    console.log('📝 [REGISTER] Iniciando registro con datos:', {
      nombre: req.body.nombre,
      email: req.body.email,
      empresa: req.body.empresa,
    });

    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      console.warn('⚠️ [REGISTER] Validación fallida:', error.details[0].message);
      return res.status(400).json({
        error: error.details[0].message,
        code: 'VALIDATION_ERROR',
      });
    }

    console.log('✅ [REGISTER] Validación exitosa. Verificando email duplicado...');
    const existingUser = await getUserByEmail(value.email);
    if (existingUser) {
      console.warn('⚠️ [REGISTER] Email ya registrado:', value.email);
      return res.status(409).json({
        error: 'Email already registered',
        code: 'EMAIL_ALREADY_EXISTS',
      });
    }

    console.log('✅ [REGISTER] Email disponible. Creando usuario en BD...');
    const fullName = `${value.nombre} ${value.apellidos}`;
    const user = await createUser(
      fullName,
      value.email,
      value.password,
      value.empresa || 'N/A',
      value.newsletter,
      value.telefono
    );
    console.log('✅ [REGISTER] Usuario creado exitosamente. ID:', user.id);

    // En desarrollo: verificar email automáticamente
    await markEmailVerified(user.id);
    console.log('✅ [REGISTER] Email verificado automáticamente (desarrollo)');

    const verificationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await query(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, verificationToken, expiresAt]
    );
    console.log('✅ [REGISTER] Token de verificación creado');

    try {
      await sendVerificationEmail(
        user.email,
        verificationToken,
        process.env.FRONTEND_URL!
      );
      console.log('✅ [REGISTER] Email de verificación enviado a:', user.email);
    } catch (emailError: any) {
      console.warn('⚠️ [REGISTER] Email no se pudo enviar (continuando):', emailError.message);
    }

    console.log('✅ [REGISTER] Registro completado exitosamente');
    return res.status(201).json({
      success: true,
      userId: user.id,
      message: 'Registration successful. Check your email to verify.',
    });
  } catch (error: any) {
    console.error('❌ [REGISTER] ERROR NO CONTROLADO:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      stack: error.stack,
    });
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

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      nif: user.nif,
      province: user.province,
      role: user.role,
      acceptsMarketing: user.acceptsMarketing,
      billingAddress: user.billingAddress,
      shippingAddress: user.shippingAddress,
    });
  } catch (error) {
    next(error);
  }
};
