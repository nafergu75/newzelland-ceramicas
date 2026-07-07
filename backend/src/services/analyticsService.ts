import { query } from '../db/connection';

export async function getVisitStats(days: number = 30): Promise<any> {
  const result = await query(
    `SELECT 
      DATE(timestamp) as date,
      COUNT(*) as visits,
      COUNT(DISTINCT user_id) as unique_users
     FROM page_view_logs
     WHERE timestamp > NOW() - INTERVAL '${days} days'
     GROUP BY DATE(timestamp)
     ORDER BY date DESC`,
    []
  );
  return result.rows;
}

export async function getDownloadStats(days: number = 30): Promise<any> {
  const result = await query(
    `SELECT 
      catalog_name,
      COUNT(*) as downloads,
      COUNT(DISTINCT COALESCE(user_id, email)) as unique_downloads
     FROM catalog_download_logs
     WHERE timestamp > NOW() - INTERVAL '${days} days'
     GROUP BY catalog_name
     ORDER BY downloads DESC`,
    []
  );
  return result.rows;
}

export async function getOrderStats(days: number = 30): Promise<any> {
  const result = await query(
    `SELECT 
      DATE(created_at) as date,
      COUNT(*) as orders,
      SUM(total) as revenue,
      AVG(total) as avg_order_value
     FROM orders
     WHERE created_at > NOW() - INTERVAL '${days} days'
     GROUP BY DATE(created_at)
     ORDER BY date DESC`,
    []
  );
  return result.rows;
}

export async function getTotalStats(): Promise<any> {
  const orders = await query(`SELECT COUNT(*) as total, SUM(total) as revenue FROM orders WHERE status = 'delivered'`, []);
  const users = await query(`SELECT COUNT(*) as total FROM users`, []);
  const visits = await query(`SELECT COUNT(*) as total FROM page_view_logs WHERE timestamp > NOW() - INTERVAL '30 days'`, []);

  return {
    totalOrders: parseInt(orders.rows[0].total || 0),
    totalRevenue: parseFloat(orders.rows[0].revenue || 0),
    totalUsers: parseInt(users.rows[0].total || 0),
    visitorsLast30Days: parseInt(visits.rows[0].total || 0),
  };
}
