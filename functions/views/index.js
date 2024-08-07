export async function onRequestPost(context) {
    const pathname = decodeURI(new URL(context.request.url).searchParams.get("q"))
    if (!(pathname.startsWith("/")) || pathname.includes("'")) {
        return new Response("403 Forbidden", {"status":403})
    }
    var originData = await context.env.BLOG_DB.prepare('SELECT * FROM views LIMIT 1').first();

    var ps;
    if (typeof originData[pathname] == "number") {
        ps = context.env.BLOG_DB.prepare(`UPDATE views SET '${pathname}' = ${parseInt(originData[pathname])+1}`);
        originData[pathname] = parseInt(originData[pathname])+1;
    } else {
        ps = context.env.BLOG_DB.prepare(`ALTER TABLE views ADD '${pathname}' INTEGER NOT NULL DEFAULT 1`);
        originData[pathname] = 1;
    }
    await ps.all();

    let total = Object.values(originData).reduce((acr, cur) => {return acr + cur;});
    if ((total%100) == 0) {
        await context.env.BLOG_DB.prepare(`ALTER TABLE views_total ADD '${total}' INTEGER NOT NULL DEFAULT ${Date.now()}`).all();
    }
    return Response.json(originData);
}