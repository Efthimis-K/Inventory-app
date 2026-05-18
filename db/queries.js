const pool = require("./pool");

function normalizeSku(sku) {
  return sku && sku.trim() !== "" ? sku.trim() : null;
}

// Category CRUD operations
async function getAllCategories() {
  const { rows } = await pool.query("SELECT * FROM categories ORDER BY name");
  return rows;
}

async function getCategoryById(id) {
  const { rows } = await pool.query("SELECT * FROM categories WHERE id = $1", [id]);
  return rows[0];
}

async function createCategory(name, description) {
  const { rows } = await pool.query(
    "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *",
    [name, description]
  );
  return rows[0];
}

async function updateCategory(id, name, description) {
  const { rows } = await pool.query(
    "UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *",
    [name, description, id]
  );
  return rows[0];
}

async function deleteCategory(id) {
  const { rows } = await pool.query("DELETE FROM categories WHERE id = $1 RETURNING *", [id]);
  return rows[0];
}

async function getCategoryItemCount(id) {
  const { rows } = await pool.query(
    "SELECT COUNT(*) as count FROM items WHERE category_id = $1",
    [id]
  );
  return parseInt(rows[0].count);
}

// Item CRUD operations
async function getItemsByCategory(categoryId) {
  const { rows } = await pool.query(
    "SELECT * FROM items WHERE category_id = $1 ORDER BY name",
    [categoryId]
  );
  return rows;
}

async function getItemById(id) {
  const { rows } = await pool.query("SELECT * FROM items WHERE id = $1", [id]);
  return rows[0];
}

async function createItem(name, description, price, quantity, sku, brand, categoryId) {
  const { rows } = await pool.query(
    "INSERT INTO items (name, description, price, quantity, sku, brand, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [name, description, price, quantity, normalizeSku(sku), brand, categoryId]
  );
  return rows[0];
}

async function updateItem(id, name, description, price, quantity, sku, brand, categoryId) {
  const { rows } = await pool.query(
    "UPDATE items SET name = $1, description = $2, price = $3, quantity = $4, sku = $5, brand = $6, category_id = $7 WHERE id = $8 RETURNING *",
    [name, description, price, quantity, normalizeSku(sku), brand, categoryId, id]
  );
  return rows[0];
}

async function deleteItem(id) {
  const { rows } = await pool.query("DELETE FROM items WHERE id = $1 RETURNING *", [id]);
  return rows[0];
}

module.exports = {
  // Category functions
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryItemCount,
  // Item functions
  getItemsByCategory,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
