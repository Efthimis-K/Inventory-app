const { Router } = require("express");
const itemsController = require("../controllers/itemsController");
const itemsRouter = Router();

itemsRouter.get("/new/:categoryId", itemsController.itemCreateGet);
itemsRouter.post("/new/:categoryId", itemsController.itemCreatePost);
itemsRouter.get("/:id/edit", itemsController.itemUpdateGet);
itemsRouter.post("/:id/edit", itemsController.itemUpdatePost);
itemsRouter.post("/:id/delete", itemsController.itemDeletePost);

module.exports = itemsRouter;
