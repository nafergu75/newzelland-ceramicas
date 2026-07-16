import bcryptjs from 'bcryptjs';
import { query } from '../db/connection';
import { User, Address } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export const createUser = async (
  name: string,
  email: string,
  password: string,
  province: string,
  acceptsMarketing: boolean = false,
  phone?: string
): Promise<User> => {
  try {
    console.log('🔐 [USER SERVICE] Hasheando contraseña...');
    const id = uuidv4();
    const passwordHash = await bcryptjs.hash(password, 10);
    console.log('✅ [USER SERVICE] Contraseña hasheada. Insertando en BD...');

    const result = await query(
      `INSERT INTO users (id, name, email, password_hash, province, accepts_marketing, phone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [id, name, email, passwordHash, province, acceptsMarketing, phone || null]
    );

    if (!result.rows || result.rows.length === 0) {
      throw new Error('User creation returned no rows');
    }

    console.log('✅ [USER SERVICE] Usuario insertado correctamente en BD');
    return mapUserRow(result.rows[0]);

  } catch (error: any) {
    console.error('❌ [USER SERVICE] Error al crear usuario:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
    });
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const result = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    return result.rows.length > 0 ? mapUserRow(result.rows[0]) : null;
  } catch (error: any) {
    console.error('❌ [USER SERVICE] Error al buscar usuario por email:', error.message);
    throw error;
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  const result = await query(`SELECT * FROM users WHERE id = $1`, [id]);
  return result.rows.length > 0 ? mapUserRow(result.rows[0]) : null;
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcryptjs.compare(password, hash);
};

export const markEmailVerified = async (userId: string): Promise<void> => {
  await query(
    `UPDATE users SET email_verified = true, email_verified_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [userId]
  );
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
): Promise<User> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.entries(updates).forEach(([key, value]) => {
    if (key === 'id' || key === 'role' || key === 'createdAt') return;

    if (key === 'billingAddress' || key === 'shippingAddress') {
      fields.push(`${snakeCase(key)} = $${paramIndex}`);
      values.push(JSON.stringify(value));
    } else if (value !== undefined) {
      fields.push(`${snakeCase(key)} = $${paramIndex}`);
      values.push(value);
    }
    paramIndex++;
  });

  if (fields.length === 0) {
    return getUserById(userId) as Promise<User>;
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);

  const result = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return mapUserRow(result.rows[0]);
};

const mapUserRow = (row: any): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  passwordHash: row.password_hash,
  province: row.province,
  emailVerified: row.email_verified,
  emailVerifiedAt: row.email_verified_at,
  billingAddress: row.billing_address,
  shippingAddress: row.shipping_address,
  phone: row.phone,
  nif: row.nif,
  role: row.role,
  acceptsMarketing: row.accepts_marketing,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const snakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};
