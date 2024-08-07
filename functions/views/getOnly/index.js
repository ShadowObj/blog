export async function onRequestGet(context) {
    let data = await context.env.BLOG_DB.prepare('SELECT * FROM views LIMIT 1').first();
    return Response.json(data);
}