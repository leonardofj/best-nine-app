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
    const { username, year } = ctx.query;
    const errorDetails = { username: username, year: year };
    if (err.status === 404) {
      errorDetails.title = "Not found";
      errorDetails.error = err.message;
      errorDetails.message = "Please check the input values";
    } else {
      errorDetails.title = "Error";
      errorDetails.error = err.message || "Ops, something went wrong!";
      errorDetails.message = "Please try again later";
    }
    await ctx.render("error", errorDetails);
  }
});

App.use(router.routes());
App.listen(port, () => {
  console.log(`🚀 Server listening http://127.0.0.1:${port}/ 🚀`);
});
