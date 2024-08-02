export async function onRequestGet(context) {
    const pathname = decodeURI(new URL(context.request.url).searchParams.get("q"))
    if (!(pathname.startsWith("/")) || pathname.includes('"')) {
        return new Response("403 Forbidden", {"status":403})
    }
    const originPS = context.env.BLOG_DB.prepare('SELECT * FROM views LIMIT 1');
    const originData = await originPS.first();

    var ps;
    if (originData.hasOwnProperty(pathname)) {
        ps = context.env.BLOG_DB.prepare('UPDATE views SET ?1 = ?2'
            .replace("?1",pathname)
            .replace("?2",parseInt(originData[pathname])+1)
        );
        originData[pathname] = parseInt(originData[pathname])+1;
    } else {
        ps = context.env.BLOG_DB.prepare('ALTER TABLE views ADD ?1 INTEGER DEFAULT 1'
            .replace("?1",pathname)
        );
        originData[pathname] = 1;
    }

    result = await ps.all();
    return Response.json(originData);
}