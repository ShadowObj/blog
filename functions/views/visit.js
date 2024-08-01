export async function onRequestGet(context) {
    const pathname = new URL(context.request.url).searchParams.get("q")
    if (pathname == null) {
        return Response("403 Forbidden", {"status":403})
    }
    const originPs = context.env.BLOG_DB.prepare('SELECT * FROM views LIMIT 1');
    const originData = await originPs.first();
    var ok = false;
    var ps
    if (originData.hasOwnProperty(pathname)) {
        ps = context.env.BLOG_DB.prepare('UPDATE views SET ?1 = ?2').bind(pathname,originData[pathname] + 1);
    } else {
        ps = context.env.BLOG_DB.prepare('ALTER TABLE views ADD ?1 INTEGER NOT NULL DEFAULT ?2').bind(pathname,1);
    }
    ok = await ps.all().success;
    return Response.json({"ok": ok});
}