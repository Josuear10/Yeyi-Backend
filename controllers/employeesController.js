import sql from '../config/supabase.js';

export const getAllEmployees = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const employees = await sql`
      SELECT * FROM employees
      ORDER BY emp_id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const total = await sql`SELECT COUNT(*) FROM employees`;
    res.json({
      data: employees,
      total: Number(total[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const createEmployee = async (req, res) => {
  const {
    emp_name,
    emp_phone,
    emp_email,
    emp_position,
    emp_commission,
    emp_is_active,
    user_id,
    emp_dpi,
  } = req.body;
  try {
    // Convertir emp_is_active a booleano
    const isActive =
      emp_is_active === true || emp_is_active === 'true' || emp_is_active === 1;

    const newEmployee = await sql`
      INSERT INTO employees (
        emp_name, emp_phone, emp_email, emp_position,
        emp_commission, emp_is_active, user_id, emp_dpi
      ) VALUES (
        ${emp_name}, ${emp_phone}, ${emp_email}, ${emp_position},
        ${emp_commission}, ${isActive}, ${user_id}, ${emp_dpi}
      ) RETURNING *`;
    res.status(201).json(newEmployee[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  const {
    emp_name,
    emp_phone,
    emp_email,
    emp_position,
    emp_commission,
    emp_is_active,
    user_id,
    emp_dpi,
  } = req.body;
  try {
    // Convertir emp_is_active a booleano
    const isActive =
      emp_is_active === true || emp_is_active === 'true' || emp_is_active === 1;

    const updated = await sql`
      UPDATE employees SET
        emp_name = ${emp_name},
        emp_phone = ${emp_phone},
        emp_email = ${emp_email},
        emp_position = ${emp_position},
        emp_commission = ${emp_commission},
        emp_is_active = ${isActive},
        user_id = ${user_id},
        emp_dpi = ${emp_dpi}
      WHERE emp_id = ${id}
      RETURNING *`;

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(updated[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  try {
    const result = await sql`
      DELETE FROM employees WHERE emp_id = ${parseInt(id)} RETURNING *;
    `;
    if (result.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ mensaje: 'Employee deleted', eliminado: result[0] });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: error.message });
  }
};
