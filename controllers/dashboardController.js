import sql from '../config/supabase.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Total de ventas
    const totalSalesResult = await sql`
      SELECT COUNT(*) as count FROM sales
    `;
    const totalSales = Number(totalSalesResult[0]?.count || 0);

    // Total de productos
    const totalProductsResult = await sql`
      SELECT COUNT(*) as count FROM products
    `;
    const totalProducts = Number(totalProductsResult[0]?.count || 0);

    // Ingresos totales
    const totalRevenueResult = await sql`
      SELECT COALESCE(SUM(sale_total), 0) as total FROM sales
    `;
    const totalRevenue = Number(totalRevenueResult[0]?.total || 0);

    // Categorías activas
    const activeCategoriesResult = await sql`
      SELECT COUNT(*) as count FROM categories WHERE cat_status = true
    `;
    const activeCategories = Number(activeCategoriesResult[0]?.count || 0);

    // Ventas del mes actual vs mes anterior (para calcular cambio)
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentMonthSalesResult = await sql`
      SELECT COUNT(*) as count FROM sales 
      WHERE sale_date >= ${currentMonthStart.toISOString().split('T')[0]}
    `;
    const currentMonthSales = Number(currentMonthSalesResult[0]?.count || 0);

    const lastMonthSalesResult = await sql`
      SELECT COUNT(*) as count FROM sales 
      WHERE sale_date >= ${lastMonthStart.toISOString().split('T')[0]}
      AND sale_date < ${currentMonthStart.toISOString().split('T')[0]}
    `;
    const lastMonthSales = Number(lastMonthSalesResult[0]?.count || 0);
    const salesChange = currentMonthSales - lastMonthSales;

    // Ingresos del mes actual vs anterior
    const currentMonthRevenueResult = await sql`
      SELECT COALESCE(SUM(sale_total), 0) as total FROM sales 
      WHERE sale_date >= ${currentMonthStart.toISOString().split('T')[0]}
    `;
    const currentMonthRevenue = Number(
      currentMonthRevenueResult[0]?.total || 0
    );

    const lastMonthRevenueResult = await sql`
      SELECT COALESCE(SUM(sale_total), 0) as total FROM sales 
      WHERE sale_date >= ${lastMonthStart.toISOString().split('T')[0]}
      AND sale_date < ${currentMonthStart.toISOString().split('T')[0]}
    `;
    const lastMonthRevenue = Number(lastMonthRevenueResult[0]?.total || 0);
    const revenueChangePercent =
      lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    res.json({
      totalSales,
      totalProducts,
      totalRevenue,
      activeCategories,
      salesChange,
      revenueChange: revenueChangePercent,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getRecentSales = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const sales = await sql`
      SELECT 
        s.sale_id,
        TO_CHAR(s.sale_date, 'YYYY-MM-DD') as sale_date,
        s.sale_total,
        s.pay_id,
        e.emp_name as employee_name,
        p.pay_method as payment_method
      FROM sales s
      LEFT JOIN employees e ON s.emp_id = e.emp_id
      LEFT JOIN payment_method p ON s.pay_id = p.pay_id
      ORDER BY s.sale_date DESC, s.sale_id DESC
      LIMIT ${limit}
    `;

    // Obtener los productos de cada venta
    const salesWithDetails = await Promise.all(
      sales.map(async sale => {
        const details = await sql`
          SELECT 
            d.prod_id,
            d.det_quantity,
            d.det_unit_price,
            d.det_subtotal,
            p.prod_name
          FROM details d
          LEFT JOIN products p ON d.prod_id = p.prod_id
          WHERE d.sale_id = ${sale.sale_id}
          LIMIT 1
        `;

        return {
          ...sale,
          firstProduct: details[0] || null,
        };
      })
    );

    res.json({ data: salesWithDetails });
  } catch (error) {
    console.error('Error fetching recent sales:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getWeeklyRevenue = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysOfWeek = [];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    // Calcular los últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];

      const revenueResult = await sql`
        SELECT COALESCE(SUM(sale_total), 0) as total 
        FROM sales 
        WHERE sale_date::date = ${dateStr}
      `;

      daysOfWeek.push({
        day: dayName,
        date: dateStr,
        value: Number(revenueResult[0]?.total || 0),
      });
    }

    res.json({ data: daysOfWeek });
  } catch (error) {
    console.error('Error fetching weekly revenue:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const topProducts = await sql`
      SELECT 
        p.prod_id,
        p.prod_name,
        COALESCE(SUM(d.det_quantity), 0) as total_sold,
        COALESCE(SUM(d.det_subtotal), 0) as total_revenue
      FROM products p
      LEFT JOIN details d ON p.prod_id = d.prod_id
      GROUP BY p.prod_id, p.prod_name
      ORDER BY total_sold DESC, total_revenue DESC
      LIMIT ${limit}
    `;

    res.json({ data: topProducts });
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getCategoriesWithProducts = async (req, res) => {
  try {
    const categories = await sql`
      SELECT 
        c.cat_id,
        c.cat_name,
        c.cat_status,
        COUNT(p.prod_id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.cat_id = p.cat_id
      WHERE c.cat_status = true
      GROUP BY c.cat_id, c.cat_name, c.cat_status
      ORDER BY product_count DESC, c.cat_name ASC
    `;

    res.json({ data: categories });
  } catch (error) {
    console.error('Error fetching categories with products:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getSalesStatus = async (req, res) => {
  try {
    // Obtener ventas de los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const totalSalesResult = await sql`
      SELECT COUNT(*) as count 
      FROM sales 
      WHERE sale_date >= ${dateStr}
    `;
    const totalSales = Number(totalSalesResult[0]?.count || 0);

    // Para efectos de demostración, asumimos que todas las ventas están completadas
    // Si tuvieras un campo de estado, lo usarías aquí
    const completedSales = totalSales;
    const pendingSales = 0;
    const inProcessSales = 0;

    const total = completedSales + pendingSales + inProcessSales;

    const statusData = [
      {
        label: 'Completadas',
        value: total > 0 ? Math.round((completedSales / total) * 100) : 0,
        count: completedSales,
      },
      {
        label: 'En Proceso',
        value: total > 0 ? Math.round((inProcessSales / total) * 100) : 0,
        count: inProcessSales,
      },
      {
        label: 'Pendientes',
        value: total > 0 ? Math.round((pendingSales / total) * 100) : 0,
        count: pendingSales,
      },
    ];

    res.json({ data: statusData, total });
  } catch (error) {
    console.error('Error fetching sales status:', error);
    res.status(500).json({ error: error.message });
  }
};
