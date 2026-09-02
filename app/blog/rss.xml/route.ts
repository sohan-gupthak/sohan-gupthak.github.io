import { getPublishedPostMetas } from "@/lib/blog/posts";
import { buildRssXml, getSiteUrl } from "@/lib/blog/rss";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET(): Promise<Response> {
  const posts = await getPublishedPostMetas();
  const xml = buildRssXml(posts, { siteUrl: getSiteUrl() });
  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}