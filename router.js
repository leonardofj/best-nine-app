const Router = require("koa-router");
const router = new Router();

router.get('/', async (ctx) => {
    await ctx.render('home');
});
router.get("/most-liked", async (ctx) => {
    const { username, year } = ctx.query;
    const posts = [];
    await ctx.render('most_liked', { username: username, year: year, posts: posts });
});
router.get("/collage", async (ctx) => {
    const { username, year } = ctx.query;
    const collage = null;
    await ctx.render('collage', { username: username, year: year, collage: collage });
});
router.get("/not-found", async (ctx) => {
    ctx.status = 404;
    await ctx.render('error', { title: "Page not found", error: "Page not found!" });
});
router.get("/error", async (ctx) => {
    ctx.status = 500;
    await ctx.render('error', { title: "Error", error: "Ops, something went wrong!" });
});

module.exports = router;