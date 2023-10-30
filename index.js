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

App.use(router.routes());
App.listen(port, () => {
  console.log(`🚀 Server listening http://127.0.0.1:${port}/ 🚀`);
});
