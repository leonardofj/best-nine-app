const Koa = require("koa");
const nunjucks = require("koa-nunjucks-2");
const router = require("./best-nine-app/router");
const App = new Koa();
const port = 8000;

App.use(
  nunjucks({
    ext: "njk",
    path: __dirname + "/best-nine-app/views",
  }),
);

App.use(async (ctx, next) => {
  try {
    await next();
    if (ctx.status === 404) {
      ctx.throw(404);
    }
  } catch (err) {
    console.log(err);
    const errorDetails = {};
    if (ctx.status === 404) {
      errorDetails.title = "Page not found";
      errorDetails.error = "Page not found!";
    } else {
      errorDetails.title = "Error";
      errorDetails.error = "Ops, something went wrong!";
    }
    await ctx.render("error", errorDetails);
  }
});

App.use(router.routes());
App.listen(port, () => {
  console.log(`🚀 Server listening http://127.0.0.1:${port}/ 🚀`);
});
