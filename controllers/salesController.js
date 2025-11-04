import sql from '../config/supabase.js';

export const getAllSales = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  try {
    // Use TO_CHAR to format date as YYYY-MM-DD string to avoid timezone conversion issues
    // This ensures the date is sent exactly as stored, without timezone interpretation
    const sales = await sql`
      SELECT 
        sale_id,
        emp_id,
        TO_CHAR(sale_date, 'YYYY-MM-DD') as sale_date,
        sale_total,
        pay_id
      FROM sales
      ORDER BY sale_id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const total = await sql`SELECT COUNT(*) FROM sales`;
    res.json({
      data: sales,
      total: Number(total[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const createSale = async (req, res) => {
  const { emp_id, sale_date, sale_total, pay_id } = req.body;
  try {
    // Extract date part if it includes time component
    let processedDate = sale_date;
    if (sale_date && sale_date.includes('T')) {
      processedDate = sale_date.split('T')[0];
    }

    // Validate date format
    if (!processedDate || !processedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res
        .status(400)
        .json({ error: 'Invalid date format. Expected YYYY-MM-DD' });
    }

    // Insert using DATE type to avoid timezone conversion
    const newSale = await sql`
      INSERT INTO sales (
        emp_id, sale_date, sale_total, pay_id
      ) VALUES (
        ${emp_id}, ${processedDate}::date, ${sale_total}, ${pay_id}
      ) RETURNING sale_id, emp_id, TO_CHAR(sale_date, 'YYYY-MM-DD') as sale_date, sale_total, pay_id;
    `;

    res.status(201).json({ message: 'Sale created', data: newSale[0] });
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateSale = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  const { emp_id, sale_date, sale_total, pay_id } = req.body;
  try {
    // Extract date part if it includes time component
    let processedDate = sale_date;
    if (sale_date && sale_date.includes('T')) {
      processedDate = sale_date.split('T')[0];
    }

    // Validate date format
    if (!processedDate || !processedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res
        .status(400)
        .json({ error: 'Invalid date format. Expected YYYY-MM-DD' });
    }

    // Update using DATE type to avoid timezone conversion
    const updated = await sql`
      UPDATE sales SET
        emp_id = ${emp_id},
        sale_date = ${processedDate}::date,
        sale_total = ${sale_total},
        pay_id = ${pay_id}
      WHERE sale_id = ${id}
      RETURNING sale_id, emp_id, TO_CHAR(sale_date, 'YYYY-MM-DD') as sale_date, sale_total, pay_id;
    `;

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json({ message: 'Sale updated', data: updated[0] });
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteSale = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  try {
    const result = await sql`
      DELETE FROM sales WHERE sale_id = ${parseInt(id)} RETURNING *;
    `;
    if (result.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    res.json({ message: 'Sale deleted', deleted: result[0] });
  } catch (error) {
    console.error('Error deleting Sale:', error);
    res.status(500).json({ error: error.message });
  }
};
