export async function onRequestGet(context) {
    const pathname = decodeURI(new URL(context.request.url).searchParams.get("q"))
    if (!(pathname.startsWith("/")) || pathname.includes("'")) {
        return new Response("403 Forbidden", {"status":403})
    }
    var originData = await context.env.BLOG_DB.prepare('SELECT * FROM views LIMIT 1').first();

    var ps;
    if (
        (typeof originData[pathname] == null) || 
        (typeof originData[pathname] == undefined)
    ) {
        ps = context.env.BLOG_DB.prepare("UPDATE views SET '?1' = ?2"
            .replace("?1",pathname)
            .replace("?2",parseInt(originData[pathname])+1)
        );
        originData[pathname] = parseInt(originData[pathname])+1;
    } else {
        ps = context.env.BLOG_DB.prepare("ALTER TABLE views ADD '?1' INTEGER NOT NULL DEFAULT 1"
            .replace("?1",pathname)
        );
        originData[pathname] = 1;
    }

    result = await ps.all();
    return Response.json(originData);
}