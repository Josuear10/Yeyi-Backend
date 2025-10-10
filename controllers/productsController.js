import sql from "../config/supabase.js";

export const getAllProducts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const products = await sql`
      SELECT * FROM products
      ORDER BY prod_id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const total = await sql`SELECT COUNT(*) FROM products`;
    res.json({
      data: products,
      total: Number(total[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  const { prod_name, prod_description, prod_price, prod_stock, cat_id } = req.body;
  try {
    const newProduct = await sql`
      INSERT INTO products (
        prod_name, prod_description, prod_price, prod_stock, cat_id
      ) VALUES (
        ${prod_name}, ${prod_description}, ${prod_price}, ${prod_stock}, ${cat_id}
      ) RETURNING *;
    `;
    res.status(201).json({ message: "Product created", data: newProduct[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const { prod_name, prod_description, prod_price, prod_stock, cat_id } = req.body;
  try {
    const updated = await sql`
      UPDATE products SET
        prod_name = ${prod_name},
        prod_description = ${prod_description},
        prod_price = ${prod_price},
        prod_stock = ${prod_stock},
        cat_id = ${cat_id}
      WHERE prod_id = ${id}
      RETURNING *;
    `;
    if (updated.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product updated", data: updated[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  try {
    const result = await sql`
      DELETE FROM products WHERE prod_id = ${parseInt(id)} RETURNING *;
    `;
    if (result.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted", deleted: result[0] });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: error.message });
  }
};
