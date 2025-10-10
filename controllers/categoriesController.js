import sql from "../config/supabase.js";

export const getAllCategories = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const categories = await sql`
      SELECT * FROM categories
      ORDER BY cat_id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const total = await sql`SELECT COUNT(*) FROM categories`;
    res.json({
      data: categories,
      total: Number(total[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const createCategory = async (req, res) => {
  const { cat_name, cat_description, cat_status } = req.body;
  try {
    const newCategory = await sql`
      INSERT INTO categories (
        cat_name, cat_description, cat_status
      ) VALUES (
        ${cat_name}, ${cat_description}, ${cat_status}
      ) RETURNING *;
    `;
    res.status(201).json({ message: "Category created", data: newCategory[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const { cat_name, cat_description, cat_status } = req.body;
  try {
    const updated = await sql`
      UPDATE categories SET
        cat_name = ${cat_name},
        cat_description = ${cat_description},
        cat_status = ${cat_status}
      WHERE cat_id = ${id}
      RETURNING *;
    `;
    if (updated.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ message: "Category updated", data: updated[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  try {
    const result = await sql`
      DELETE FROM categories WHERE cat_id = ${parseInt(id)} RETURNING *;
    `;
    if (result.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ message: "Category deleted", deleted: result[0] });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: error.message });
  }
};
