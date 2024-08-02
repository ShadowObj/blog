export async function onRequestGet(context) {
    const pathname = decodeURI(new URL(context.request.url).searchParams.get("q"))
    if (pathname == null) {
        return new Response("403 Forbidden", {"status":403})
    }
    const originPs = context.env.BLOG_DB.prepare('SELECT * FROM views LIMIT 1');
    const originData = await originPs.first();

    var result = false;
    var ps;
    if (originData.hasOwnProperty(pathname)) {
        ps = context.env.BLOG_DB.prepare('UPDATE views SET ?1 = ?2'
            .replace("?1",pathname.replace("/","//"))
            .replace("?2",parseInt(originData[pathname])+1)
        );
    } else {
        ps = context.env.BLOG_DB.prepare('ALTER TABLE views ADD ?1 INTEGER NOT NULL DEFAULT 1'
            .replace("?1",pathname.replace("/","//"))
        );
    }

    result = await ps.all();
    originData[pathname] = parseInt(originData[pathname])+1;
    return Response.json(originData);
}