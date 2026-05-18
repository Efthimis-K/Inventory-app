const { Router } = require("express");
const categoriesController = require("../controllers/categoriesController");
const categoriesRouter = Router();

categoriesRouter.get("/", categoriesController.categoriesListGet);
categoriesRouter.get("/new", categoriesController.categoryCreateGet);
categoriesRouter.post("/new", categoriesController.categoryCreatePost);
categoriesRouter.get("/:id", categoriesController.categoryDetailGet);
categoriesRouter.get("/:id/edit", categoriesController.categoryUpdateGet);
categoriesRouter.post("/:id/edit", categoriesController.categoryUpdatePost);
categoriesRouter.post("/:id/delete", categoriesController.categoryDeletePost);

module.exports = categoriesRouter;
