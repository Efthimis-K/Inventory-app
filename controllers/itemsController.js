const db = require("../db/queries");
const renderPage = require("../utils/renderPage");
const { body, validationResult, matchedData } = require("express-validator");

const nameErr = "Must be between 2 and 200 characters";
const priceErr = "Must be a valid price greater than 0";
const quantityErr = "Must be a non-negative integer";
const skuErr = "Must not exceed 50 characters";
const brandErr = "Must not exceed 100 characters";
const categoryErr = "Please choose a valid category";

const validateItem = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage(`Name ${nameErr}`),
  body("price")
    .isFloat({ gt: 0 })
    .withMessage(priceErr),
  body("quantity")
    .isInt({ min: 0 })
    .withMessage(quantityErr),
  body("sku")
    .trim()
    .isLength({ max: 50 })
    .withMessage(skuErr),
  body("brand")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage(brandErr),
  body("description")
    .optional()
    .trim(),
  body("category_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage(categoryErr)
    .toInt(),
];

function isDuplicateSkuError(error) {
  return error && error.code === "23505";
}

exports.itemCreateGet = async (req, res) => {
  const category = await db.getCategoryById(req.params.categoryId);
  if (!category) {
    return renderPage(res, "error", {
      title: "Category Not Found",
      message: "The requested category does not exist.",
    }, 404);
  }
  await renderPage(res, "item-form", {
    title: "Create New Item",
    item: null,
    category,
    categories: null,
    errors: [],
  });
};

exports.itemCreatePost = [
  validateItem,
  async (req, res) => {
    const category = await db.getCategoryById(req.params.categoryId);
    if (!category) {
      return renderPage(res, "error", {
        title: "Category Not Found",
        message: "The requested category does not exist.",
      }, 404);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return renderPage(res, "item-form", {
        title: "Create New Item",
        item: req.body,
        category,
        categories: null,
        errors: errors.array(),
      }, 400);
    }
    const { name, description, price, quantity, sku, brand } = matchedData(req);
    try {
      await db.createItem(name, description, price, quantity, sku, brand, req.params.categoryId);
      res.redirect(`/categories/${req.params.categoryId}`);
    } catch (error) {
      if (!isDuplicateSkuError(error)) {
        throw error;
      }

      return renderPage(res, "item-form", {
        title: "Create New Item",
        item: req.body,
        category,
        categories: null,
        errors: [{ msg: "SKU must be unique. Please choose another SKU or leave it blank." }],
      }, 400);
    }
  },
];

exports.itemUpdateGet = async (req, res) => {
  const item = await db.getItemById(req.params.id);
  const categories = await db.getAllCategories();
  if (!item) {
    return renderPage(res, "error", {
      title: "Item Not Found",
      message: "The requested item does not exist.",
    }, 404);
  }
  await renderPage(res, "item-form", {
    title: "Update Item",
    item,
    category: null,
    categories,
    errors: [],
  });
};

exports.itemUpdatePost = [
  validateItem,
  async (req, res) => {
    const item = await db.getItemById(req.params.id);
    const categories = await db.getAllCategories();
    if (!item) {
      return renderPage(res, "error", {
        title: "Item Not Found",
        message: "The requested item does not exist.",
      }, 404);
    }
    const formData = matchedData(req);
    const formErrors = validationResult(req).array();
    const categoryExists = categories.some((category) => category.id === formData.category_id);
    const hasCategoryError = formErrors.some((error) => error.path === "category_id");
    if (!hasCategoryError && (!formData.category_id || !categoryExists)) {
      formErrors.push({ msg: categoryErr });
    }
    if (formErrors.length > 0) {
      return renderPage(res, "item-form", {
        title: "Update Item",
        item: { ...item, ...req.body },
        category: null,
        categories,
        errors: formErrors,
      }, 400);
    }
    const { name, description, price, quantity, sku, brand, category_id } = formData;
    try {
      await db.updateItem(req.params.id, name, description, price, quantity, sku, brand, category_id);
      res.redirect(`/categories/${category_id}`);
    } catch (error) {
      if (!isDuplicateSkuError(error)) {
        throw error;
      }

      return renderPage(res, "item-form", {
        title: "Update Item",
        item: { ...item, ...req.body },
        category: null,
        categories,
        errors: [{ msg: "SKU must be unique. Please choose another SKU or leave it blank." }],
      }, 400);
    }
  },
];

exports.itemDeletePost = async (req, res) => {
  const item = await db.getItemById(req.params.id);
  if (!item) {
    return renderPage(res, "error", {
      title: "Item Not Found",
      message: "The requested item does not exist.",
    }, 404);
  }
  const categoryId = item.category_id;
  await db.deleteItem(req.params.id);
  res.redirect(`/categories/${categoryId}`);
};
