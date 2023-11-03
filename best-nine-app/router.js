const Router = require("koa-router");
const { getMostLiked, getCollage } = require("./modules/insta-api.js");
const router = new Router();

router.get("/", async (ctx) => {
  await ctx.render("home");
});

router.get("/most-liked", async (ctx) => {
  const { username, year } = ctx.query;
  const posts = await getMostLiked(username, year);
  await ctx.render("most-liked", {
    username: username,
    year: year,
    posts: posts,
  });
});

router.get("/collage", async (ctx) => {
  const { username, year } = ctx.query;
  const collage = await getCollage(username, year);
  await ctx.render("collage", {
    username: username,
    year: year,
    collage: collage,
  });
});

module.exports = router;
