import { Request } from 'express';

export interface Address {
  street: string;
  number: string;
  floor?: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  province: string;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  billingAddress?: Address;
  shippingAddress?: Address;
  phone?: string;
  nif?: string;
  role: 'customer' | 'admin';
  acceptsMarketing: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  collection: string;
  format: string;
  m2_per_box: number;
  description?: string;
  color?: string;
  finish?: 'mate' | 'brillo' | 'satinado';
  specifications?: Record<string, any>;

  // Campos de disponibilidad
  stock: number;                    // Cantidad en stock (0 si no disponible)
  isActive: boolean;                // Producto activo/disponible
  replenishable: boolean;           // Se puede reponer (mostrar "Avisarme")
  requiresConsultation: boolean;    // Requiere consultar (artículos a medida, bajo pedido)
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  vatPercentage: number;
  totalLine: number;
}

export interface Order {
  id: string;
  userId: string;
  billingAddress: Address;
  shippingAddress: Address;
  nif: string;
  phone: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;

  // Desglose de envío separado
  base_shipping: number;           // Envío base fijo
  distance_surcharge: number;      // Recargo por distancia
  total_shipping: number;          // Total envío = base + distance

  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  invoiceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export interface EmailVerificationToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface PageViewLog {
  id: string;
  url: string;
  userId?: string;
  userAgent?: string;
  ipHash?: string;
  timestamp: Date;
}

export interface CatalogDownloadLog {
  id: string;
  catalogId: string;
  catalogName: string;
  userId?: string;
  email?: string;
  timestamp: Date;
}
