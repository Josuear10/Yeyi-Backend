import sql from "../config/supabase.js";

export const getAllPayments = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const payments = await sql`
      SELECT * FROM payment_method
      ORDER BY pay_id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const total = await sql`SELECT COUNT(*) FROM payment_method`;
    res.json({
      data: payments,
      total: Number(total[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const createPayment = async (req, res) => {
  const {
    pay_method,
    pay_description,
    pay_is_active,
  } = req.body;
  try {
    const newPayment = await sql`
      INSERT INTO payment_method (
        pay_method, pay_description, pay_is_active
      ) VALUES (
        ${pay_method}, ${pay_description}, ${pay_is_active}
      ) RETURNING *`;
    res.status(201).json(newPayment[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updatePayment = async (req, res) => {
  const { id } = req.params;
  const { pay_method, pay_description, pay_is_active } = req.body;
  try {
    const updated = await sql`
      UPDATE payment_method SET
        pay_method = ${pay_method},
        pay_description = ${pay_description},
        pay_is_active = ${pay_is_active}
      WHERE pay_id = ${id}
      RETURNING *;
    `;
    if (updated.length === 0) {
      return res.status(404).json({ error: "Payment method not found" });
    }
    res.json({ message: "Payment method updated", data: updated[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deletePayment = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  try {
    const result = await sql`
      DELETE FROM payment_method WHERE pay_id = ${parseInt(id)} RETURNING *;
    `;
    if (result.length === 0) {
      return res.status(404).json({ error: "Payment method not found" });
    }
    res.json({ message: "Payment method deleted", deleted: result[0] });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    res.status(500).json({ error: error.message });
  }
};
