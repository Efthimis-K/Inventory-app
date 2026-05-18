const db = require("../db/queries");
const renderPage = require("../utils/renderPage");
const { body, validationResult, matchedData } = require("express-validator");

const nameErr = "Must be between 2 and 100 characters";
const descErr = "Must not exceed 500 characters";

const validateCategory = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage(`Name ${nameErr}`),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage(descErr),
];

exports.categoriesListGet = async (req, res) => {
  const categories = await db.getAllCategories();
  await renderPage(res, "index", {
    title: "Electronics Inventory - Categories",
    categories,
  });
};

exports.categoryDetailGet = async (req, res) => {
  const category = await db.getCategoryById(req.params.id);
  const items = await db.getItemsByCategory(req.params.id);
  if (!category) {
    return renderPage(res, "error", {
      title: "Category Not Found",
      message: "The requested category does not exist.",
    }, 404);
  }
  await renderPage(res, "category", {
    title: category.name,
    category,
    items,
  });
};

exports.categoryCreateGet = async (req, res) => {
  await renderPage(res, "category-form", {
    title: "Create New Category",
    category: null,
    errors: [],
  });
};

exports.categoryCreatePost = [
  validateCategory,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return renderPage(res, "category-form", {
        title: "Create New Category",
        category: null,
        errors: errors.array(),
      }, 400);
    }
    const { name, description } = matchedData(req);
    await db.createCategory(name, description);
    res.redirect("/");
  },
];

exports.categoryUpdateGet = async (req, res) => {
  const category = await db.getCategoryById(req.params.id);
  if (!category) {
    return renderPage(res, "error", {
      title: "Category Not Found",
      message: "The requested category does not exist.",
    }, 404);
  }
  await renderPage(res, "category-form", {
    title: "Update Category",
    category,
    errors: [],
  });
};

exports.categoryUpdatePost = [
  validateCategory,
  async (req, res) => {
    const category = await db.getCategoryById(req.params.id);
    if (!category) {
      return renderPage(res, "error", {
        title: "Category Not Found",
        message: "The requested category does not exist.",
      }, 404);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return renderPage(res, "category-form", {
        title: "Update Category",
        category,
        errors: errors.array(),
      }, 400);
    }
    const { name, description } = matchedData(req);
    await db.updateCategory(req.params.id, name, description);
    res.redirect(`/categories/${req.params.id}`);
  },
];

exports.categoryDeletePost = async (req, res) => {
  const itemCount = await db.getCategoryItemCount(req.params.id);
  if (itemCount > 0) {
    const category = await db.getCategoryById(req.params.id);
    return renderPage(res, "error", {
      title: "Cannot Delete Category",
      message: `Cannot delete category "${category.name}" because it contains ${itemCount} item(s). Please delete or reassign the items first.`,
    }, 400);
  }
  await db.deleteCategory(req.params.id);
  res.redirect("/");
};
