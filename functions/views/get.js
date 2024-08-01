export async function onRequestGet(context) {
    const ps = context.env.BLOG_DB.prepare('SELECT * FROM views LIMIT 1');
    const data = await ps.first();
  
    return Response.json(data);
}