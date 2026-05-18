function renderPage(res, view, locals = {}, statusCode = 200) {
  return new Promise((resolve, reject) => {
    res.render(view, locals, (viewError, body) => {
      if (viewError) {
        return reject(viewError);
      }

      res.status(statusCode).render("layout", { ...locals, body }, (layoutError, html) => {
        if (layoutError) {
          return reject(layoutError);
        }

        res.send(html);
        resolve();
      });
    });
  });
}

module.exports = renderPage;
