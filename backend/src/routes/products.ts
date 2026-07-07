import { Router } from 'express';
import { query } from '../db/connection';

const router = Router();

const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Atlas Gris',
    description: 'Cerámica premium gris 60x60',
    price: 45.99,
    format: '60x60',
    m2_per_box: 1.44,
  },
  {
    id: '2',
    name: 'Calacatta Blanco',
    description: 'Cerámica mármol blanco 100x100',
    price: 89.99,
    format: '100x100',
    m2_per_box: 2.0,
  },
  {
    id: '3',
    name: 'Travertino Natural',
    description: 'Cerámica travertino 45x45',
    price: 32.50,
    format: '45x45',
    m2_per_box: 0.81,
  },
  {
    id: '4',
    name: 'Pietra Serena',
    description: 'Cerámica pizarra 60x60',
    price: 55.00,
    format: '60x60',
    m2_per_box: 1.44,
  },
  {
    id: '5',
    name: 'Garden Marfil',
    description: 'Cerámica rustica crema 30x60',
    price: 28.75,
    format: '30x60',
    m2_per_box: 0.54,
  },
];

router.get('/', (req, res) => {
  res.json({ products: MOCK_PRODUCTS, total: MOCK_PRODUCTS.length });
});

router.get('/:id', (req, res) => {
  const product = MOCK_PRODUCTS.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

export default router;
