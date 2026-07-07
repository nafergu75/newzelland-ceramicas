import pool from './connection';

const migrations = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        province VARCHAR(100) NOT NULL,
        email_verified BOOLEAN DEFAULT false,
        email_verified_at TIMESTAMP,
        billing_address JSONB,
        shipping_address JSONB,
        phone VARCHAR(20),
        nif VARCHAR(20),
        role VARCHAR(50) DEFAULT 'customer',
        accepts_marketing BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_verification_tokens_user ON email_verification_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON email_verification_tokens(token);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        billing_address JSONB NOT NULL,
        shipping_address JSONB NOT NULL,
        nif VARCHAR(20) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        items JSONB NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) NOT NULL,
        shipping_surcharge DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        invoice_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS page_view_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        url VARCHAR(500) NOT NULL,
        user_id UUID,
        user_agent TEXT,
        ip_hash VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_page_views_url ON page_view_logs(url);
      CREATE INDEX IF NOT EXISTS idx_page_views_user ON page_view_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_view_logs(timestamp);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS catalog_download_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        catalog_id VARCHAR(100) NOT NULL,
        catalog_name VARCHAR(255) NOT NULL,
        user_id UUID,
        email VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_downloads_catalog ON catalog_download_logs(catalog_id);
      CREATE INDEX IF NOT EXISTS idx_downloads_user ON catalog_download_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_downloads_timestamp ON catalog_download_logs(timestamp);
    `);

    await client.query('COMMIT');
    console.log('✓ Migrations ejecutadas correctamente');
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('✗ Error en migrations:', error);
    process.exit(1);
  } finally {
    client.release();
  }
};

migrations();
