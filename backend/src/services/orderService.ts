import { query } from '../db/connection';
import { Order, OrderItem } from '../models/types';
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const PROVINCES_WITH_SURCHARGE = 21;
const SURCHARGE_PER_M2 = 3;

export async function createOrder(
  userId: string,
  items: OrderItem[],
  billingAddress: any,
  shippingAddress: any,
  nif: string,
  phone: string
): Promise<Order> {
  const orderId = uuidv4();
  
  const subtotal = items.reduce((sum, item) => sum + item.totalLine, 0);
  const taxAmount = subtotal * 0.21;
  const shippingSurcharge = Math.ceil(items.reduce((sum, item) => {
    const m2 = (item.quantity || 1) * 1.2;
    return sum + m2;
  }, 0) / PROVINCES_WITH_M2) * SURCHARGE_PER_M2;
  
  const total = subtotal + taxAmount + shippingSurcharge;

  const result = await query(
    `INSERT INTO orders (id, user_id, items, billing_address, shipping_address, nif, phone, subtotal, tax_amount, shipping_surcharge, total, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
     RETURNING *`,
    [
      orderId,
      userId,
      JSON.stringify(items),
      JSON.stringify(billingAddress),
      JSON.stringify(shippingAddress),
      nif,
      phone,
      subtotal,
      taxAmount,
      shippingSurcharge,
      total,
    ]
  );

  return result.rows[0];
}

export async function getOrdersByUserId(
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ orders: Order[]; total: number }> {
  const result = await query(
    `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const countResult = await query(
    `SELECT COUNT(*) as total FROM orders WHERE user_id = $1`,
    [userId]
  );

  return {
    orders: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const result = await query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
  return result.rows[0] || null;
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<Order> {
  const result = await query(
    `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, orderId]
  );
  return result.rows[0];
}

export async function generateInvoice(order: Order, userId: string): Promise<string> {
  const invoicesDir = path.join(process.cwd(), 'invoices');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const fileName = `invoice-${order.id}.pdf`;
  const filePath = path.join(invoicesDir, fileName);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      doc.fontSize(20).text('FACTURA / INVOICE', { align: 'center' });
      doc.fontSize(12).text(`Newzelland Cerámicas`, { align: 'center' });
      doc.text(`Nº ${order.id}`, { align: 'center' });
      doc.moveDown();

      doc.fontSize(10);
      doc.text(`Fecha: ${new Date(order.created_at).toLocaleDateString('es-ES')}`);
      doc.text(`NIF Cliente: ${order.nif}`);
      doc.moveDown();

      doc.text('DIRECCIÓN DE FACTURACIÓN:', { underline: true });
      const billing = order.billing_address;
      doc.text(
        `${billing.street} ${billing.number}${billing.floor ? ' ' + billing.floor : ''}`
      );
      doc.text(`${billing.postalCode} ${billing.city}`);
      doc.text(`${billing.province}, ${billing.country}`);
      doc.moveDown();

      doc.text('ARTÍCULOS:', { underline: true });
      const items = order.items as OrderItem[];
      items.forEach((item) => {
        doc.text(
          `${item.name} x${item.quantity} - €${(item.totalLine).toFixed(2)}`
        );
      });
      doc.moveDown();

      doc.text(`Subtotal: €${(order.subtotal).toFixed(2)}`);
      doc.text(`IVA (21%): €${(order.tax_amount).toFixed(2)}`);
      doc.text(`Recargo por envío: €${(order.shipping_surcharge).toFixed(2)}`);
      doc.fontSize(12).text(`TOTAL: €${(order.total).toFixed(2)}`, {
        underline: true,
      });

      doc.end();

      stream.on('finish', () => {
        resolve(`/invoices/${fileName}`);
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

const PROVINCES_WITH_M2 = 21;
