const db = require("../db/queries");
const renderPage = require("../utils/renderPage");
const {
  body,
  validationResult,
  matchedData,
  param,
} = require("express-validator");

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

const validateCategoryId = [param("id").isInt({ min: 1 }).toInt()];

exports.categoriesListGet = async (req, res) => {
  try {
    const categories = await db.getAllCategories();
    await renderPage(res, "index", {
      title: "Electronics Inventory - Categories",
      categories,
    });
  } catch (error) {
    return renderPage(
      res,
      "error",
      {
        title: "Database Error",
        message:
          "Unable to load categories. Please check your database connection.",
      },
      500,
    );
  }
};

exports.categoryDetailGet = [
  validateCategoryId,
  async (req, res) => {
    try {
      const paramErrors = validationResult(req);
      if (!paramErrors.isEmpty()) {
        return renderPage(
          res,
          "error",
          {
            title: "Invalid Request",
            message: "The provided ID is not valid.",
          },
          400,
        );
      }
      const category = await db.getCategoryById(req.params.id);
      const items = await db.getItemsByCategory(req.params.id);
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
      await renderPage(res, "category", {
        title: category.name,
        category,
        items,
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

exports.categoryCreateGet = async (req, res) => {
  try {
    await renderPage(res, "category-form", {
      title: "Create New Category",
      category: null,
      errors: [],
    });
  } catch (error) {
    return renderPage(
      res,
      "error",
      {
        title: "Database Error",
        message: "Unable to load page. Please check your database connection.",
      },
      500,
    );
  }
};

exports.categoryCreatePost = [
  validateCategory,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return renderPage(
          res,
          "category-form",
          {
            title: "Create New Category",
            category: null,
            errors: errors.array(),
          },
          400,
        );
      }
      const { name, description } = matchedData(req);
      await db.createCategory(name, description);
      res.redirect("/");
    } catch (error) {
      console.error("Error creating category:", error);
      return renderPage(
        res,
        "error",
        {
          title: "Create Failed",
          message: "An error occurred while creating the category.",
        },
        500,
      );
    }
  },
];

exports.categoryUpdateGet = [
  validateCategoryId,
  async (req, res) => {
    try {
      const paramErrors = validationResult(req);
      if (!paramErrors.isEmpty()) {
        return renderPage(
          res,
          "error",
          {
            title: "Invalid Request",
            message: "The provided ID is not valid.",
          },
          400,
        );
      }
      const category = await db.getCategoryById(req.params.id);
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
      await renderPage(res, "category-form", {
        title: "Update Category",
        category,
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

exports.categoryUpdatePost = [
  validateCategory,
  validateCategoryId,
  async (req, res) => {
    try {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        const paramErrors = validationErrors.mappedErrors["id"];
        const bodyErrors =
          validationErrors.mappedErrors["name"] ||
          validationErrors.mappedErrors["description"];

        if (paramErrors && paramErrors.length > 0) {
          return renderPage(
            res,
            "error",
            {
              title: "Invalid Request",
              message: "The provided ID is not valid.",
            },
            400,
          );
        }

        if (bodyErrors && bodyErrors.length > 0) {
          const category = await db.getCategoryById(req.params.id);
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
          return renderPage(
            res,
            "category-form",
            {
              title: "Update Category",
              category,
              errors: bodyErrors.map((err) => err.msg),
            },
            400,
          );
        }
      }
      const category = await db.getCategoryById(req.params.id);
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
      const { name, description } = matchedData(req);
      await db.updateCategory(req.params.id, name, description);
      res.redirect(`/categories/${req.params.id}`);
    } catch (error) {
      console.error("Error updating category:", error);
      return renderPage(
        res,
        "error",
        {
          title: "Update Failed",
          message: "An error occurred while updating the category.",
        },
        500,
      );
    }
  },
];

exports.categoryDeletePost = [
  validateCategoryId,
  async (req, res) => {
    try {
      const paramErrors = validationResult(req);
      if (!paramErrors.isEmpty()) {
        return renderPage(
          res,
          "error",
          {
            title: "Invalid Request",
            message: "The provided ID is not valid.",
          },
          400,
        );
      }
      const itemCount = await db.getCategoryItemCount(req.params.id);
      if (itemCount > 0) {
        const category = await db.getCategoryById(req.params.id);
        return renderPage(
          res,
          "error",
          {
            title: "Cannot Delete Category",
            message: `Cannot delete category "${category.name}" because it contains ${itemCount} item(s). Please delete or reassign the items first.`,
          },
          400,
        );
      }
      const category = await db.getCategoryById(req.params.id);
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
      await db.deleteCategory(req.params.id);
      res.redirect("/");
    } catch (error) {
      console.error("Error deleting category:", error);
      return renderPage(
        res,
        "error",
        {
          title: "Delete Failed",
          message: "An error occurred while deleting the category.",
        },
        500,
      );
    }
  },
];
