import { Response, NextFunction } from 'express';
import { AuthRequest } from '../models/types';
import { createOrder, generateInvoice } from '../services/orderService';
import Joi from 'joi';

const checkoutSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        name: Joi.string().required(),
        quantity: Joi.number().required(),
        unitPrice: Joi.number().required(),
        vatPercentage: Joi.number().default(21),
      })
    )
    .required(),
  billingAddress: Joi.object({
    street: Joi.string().required(),
    number: Joi.string().required(),
    floor: Joi.string().optional(),
    postalCode: Joi.string().required(),
    city: Joi.string().required(),
    province: Joi.string().required(),
    country: Joi.string().default('ES'),
  }).required(),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    number: Joi.string().required(),
    floor: Joi.string().optional(),
    postalCode: Joi.string().required(),
    city: Joi.string().required(),
    province: Joi.string().required(),
    country: Joi.string().default('ES'),
  }).required(),
  nif: Joi.string().required(),
  phone: Joi.string().required(),
});

export const createCheckout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error, value } = checkoutSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const items = value.items.map((item: any) => ({
      ...item,
      totalLine: item.quantity * item.unitPrice,
    }));

    const order = await createOrder(
      req.user!.userId,
      items,
      value.billingAddress,
      value.shippingAddress,
      value.nif,
      value.phone
    );

    try {
      const invoiceUrl = await generateInvoice(order, req.user!.userId);
      const updateResult = await (require('../db/connection')).query(
        `UPDATE orders SET invoice_url = $1 WHERE id = $2 RETURNING *`,
        [invoiceUrl, order.id]
      );
      return res.status(201).json(updateResult.rows[0]);
    } catch (pdfError) {
      console.warn('PDF generation failed:', pdfError);
      return res.status(201).json(order);
    }
  } catch (error) {
    next(error);
  }
};
