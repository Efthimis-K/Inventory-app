const db = require("../db/queries");
const renderPage = require("../utils/renderPage");
const {
  body,
  validationResult,
  matchedData,
  param,
} = require("express-validator");

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
  body("price").isFloat({ gt: 0 }).withMessage(priceErr),
  body("quantity").isInt({ min: 0 }).withMessage(quantityErr),
  body("sku").trim().isLength({ max: 50 }).withMessage(skuErr),
  body("brand").optional().trim().isLength({ max: 100 }).withMessage(brandErr),
  body("description").optional().trim(),
  body("category_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage(categoryErr)
    .toInt(),
];

const validateItemId = [param("id").isInt({ min: 1 }).toInt()];

const validateCategoryId = [param("categoryId").isInt({ min: 1 }).toInt()];

function isDuplicateSkuError(error) {
  return error && error.code === "23505";
}

function handleParamError(req, res, message = "The provided ID is not valid.") {
  const allErrors = validationResult(req).array();
  const paramErrors = allErrors.filter((e) => e.location === "params");

  if (paramErrors.length > 0) {
    return renderPage(
      res,
      "error",
      {
        title: "Invalid Request",
        message: message,
      },
      400,
    );
  }
  return null;
}

exports.itemCreateGet = [
  validateCategoryId,
  async (req, res) => {
    try {
      if (handleParamError(req, res, "The provided category ID is not valid.")) return;
      const category = await db.getCategoryById(req.params.categoryId);
      if (!category) {
        return renderPage(
          res,
          "error",
          {
            title: "Category Not Found",
            message: "The requested category does not exist.",
          },
          404,
        );
      }
      await renderPage(res, "item-form", {
        title: "Create New Item",
        item: null,
        category,
        categories: null,
        errors: [],
      });
    } catch (error) {
      return renderPage(
        res,
        "error",
        {
          title: "Database Error",
          message:
            "Unable to load category. Please check your database connection.",
        },
        500,
      );
    }
  },
];

exports.itemCreatePost = [
  validateItem,
  validateCategoryId,
  async (req, res) => {
    try {
      if (handleParamError(req, res, "The provided category ID is not valid.")) return;
      const category = await db.getCategoryById(req.params.categoryId);
      if (!category) {
        return renderPage(
          res,
          "error",
          {
            title: "Category Not Found",
            message: "The requested category does not exist.",
          },
          404,
        );
      }
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return renderPage(
          res,
          "item-form",
          {
            title: "Create New Item",
            item: req.body,
            category,
            categories: null,
            errors: errors.array(),
          },
          400,
        );
      }
      const { name, description, price, quantity, sku, brand } =
        matchedData(req);
      await db.createItem(
        name,
        description,
        price,
        quantity,
        sku,
        brand,
        req.params.categoryId,
      );
      res.redirect(`/categories/${req.params.categoryId}`);
    } catch (error) {
      if (!isDuplicateSkuError(error)) {
        console.error("Error creating item:", error);
        return renderPage(
          res,
          "error",
          {
            title: "Create Failed",
            message: "An error occurred while creating the item.",
          },
          500,
        );
      }

      return renderPage(
        res,
        "item-form",
        {
          title: "Create New Item",
          item: req.body,
          category,
          categories: null,
          errors: [
            {
              msg: "SKU must be unique. Please choose another SKU or leave it blank.",
            },
          ],
        },
        400,
      );
    }
  },
];

exports.itemUpdateGet = [
  validateItemId,
  async (req, res) => {
    try {
      if (handleParamError(req, res, "The provided item ID is not valid.")) return;
      const item = await db.getItemById(req.params.id);
      const categories = await db.getAllCategories();
      if (!item) {
        return renderPage(
          res,
          "error",
          {
            title: "Item Not Found",
            message: "The requested item does not exist.",
          },
          404,
        );
      }
      await renderPage(res, "item-form", {
        title: "Update Item",
        item,
        category: null,
        categories,
        errors: [],
      });
    } catch (error) {
      return renderPage(
        res,
        "error",
        {
          title: "Database Error",
          message:
            "Unable to load item. Please check your database connection.",
        },
        500,
      );
    }
  },
];

exports.itemUpdatePost = [
  validateItem,
  validateItemId,
  async (req, res) => {
    try {
      if (handleParamError(req, res, "The provided item ID is not valid.")) return;
      const item = await db.getItemById(req.params.id);
      const categories = await db.getAllCategories();
      if (!item) {
        return renderPage(
          res,
          "error",
          {
            title: "Item Not Found",
            message: "The requested item does not exist.",
          },
          404,
        );
      }
      const allErrors = validationResult(req).array();
      const formData = matchedData(req);
      const formErrors = allErrors.filter((e) => e.location === "body");
      const categoryExists = categories.some(
        (category) => category.id === formData.category_id,
      );
      const hasCategoryError = formErrors.some(
        (error) => error.path === "category_id",
      );
      if (!hasCategoryError && (!formData.category_id || !categoryExists)) {
        formErrors.push({ msg: categoryErr });
      }
      if (formErrors.length > 0) {
        return renderPage(
          res,
          "item-form",
          {
            title: "Update Item",
            item: { ...item, ...req.body },
            category: null,
            categories,
            errors: formErrors,
          },
          400,
        );
      }
      const { name, description, price, quantity, sku, brand, category_id } =
        formData;
      await db.updateItem(
        req.params.id,
        name,
        description,
        price,
        quantity,
        sku,
        brand,
        category_id,
      );
      res.redirect(`/categories/${category_id}`);
    } catch (error) {
      if (!isDuplicateSkuError(error)) {
        console.error("Error updating item:", error);
        return renderPage(
          res,
          "error",
          {
            title: "Update Failed",
            message: "An error occurred while updating the item.",
          },
          500,
        );
      }

      return renderPage(
        res,
        "item-form",
        {
          title: "Update Item",
          item: { ...item, ...req.body },
          category: null,
          categories,
          errors: [
            {
              msg: "SKU must be unique. Please choose another SKU or leave it blank.",
            },
          ],
        },
        400,
      );
    }
  },
];

exports.itemDeletePost = [
  validateItemId,
  async (req, res) => {
      if (handleParamError(req, res, "The provided item ID is not valid.")) return;
    const item = await db.getItemById(req.params.id);
    if (!item) {
      return renderPage(
        res,
        "error",
        {
          title: "Item Not Found",
          message: "The requested item does not exist.",
        },
        404,
      );
    }
    const categoryId = item.category_id;
    try {
      await db.deleteItem(req.params.id);
    } catch (error) {
      console.error("Error deleting item:", error);
      return renderPage(
        res,
        "error",
        {
          title: "Delete Failed",
          message: "An error occurred while deleting the item.",
        },
        500,
      );
    }
    res.redirect(`/categories/${categoryId}`);
  },
];
