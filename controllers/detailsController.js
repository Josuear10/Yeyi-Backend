import sql from "../config/supabase.js";

export const getAllDetails = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const details = await sql`
      SELECT * FROM details
      ORDER BY det_id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const total = await sql`SELECT COUNT(*) FROM details`;
    res.json({
      data: details,
      total: Number(total[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const createDetail = async (req, res) => {
  const { sale_id, prod_id, det_quantity, det_unit_price } = req.body;

  if (!sale_id || !prod_id) {
    return res.status(400).json({ error: "sale_id and prod_id are required" });
  }

  try {
    const newDetail = await sql`
    INSERT INTO details (
        sale_id, prod_id, det_quantity, det_unit_price
    ) VALUES (
        ${sale_id}, ${prod_id}, ${det_quantity}, ${det_unit_price}
    ) RETURNING *;
    `;
    res.status(201).json({ message: "Detail created", data: newDetail[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateDetail = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const { sale_id, prod_id, det_quantity, det_unit_price } = req.body;
  try {
    const updated = await sql`
    UPDATE details SET
        sale_id = ${sale_id},
        prod_id = ${prod_id},
        det_quantity = ${det_quantity},
        det_unit_price = ${det_unit_price}
    WHERE det_id = ${id}
    RETURNING *;
    `;
    if (updated.length === 0) {
      return res.status(404).json({ error: "Detail not found" });
    }
    res.json({ message: "Detail updated", data: updated[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteDetail = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  try {
    const result = await sql`
      DELETE FROM details WHERE det_id = ${parseInt(id)} RETURNING *;
    `;
    if (result.length === 0) {
      return res.status(404).json({ error: "Detail not found" });
    }
    res.json({ message: "Detail deleted", deleted: result[0] });
  } catch (error) {
    console.error("Error deleting detail:", error);
    res.status(500).json({ error: error.message });
  }
};
