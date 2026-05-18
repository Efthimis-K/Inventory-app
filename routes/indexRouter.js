const { Router } = require("express");
const categoriesRouter = require("./categoriesRouter");
const itemsRouter = require("./itemsRouter");
const indexRouter = Router();

indexRouter.get("/", (req, res) => {
  res.redirect("/categories");
});

indexRouter.use("/categories", categoriesRouter);
indexRouter.use("/items", itemsRouter);

module.exports = indexRouter;
