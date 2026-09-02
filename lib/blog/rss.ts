import type { BlogPostMeta } from "./types";

export const SITE_URL_DEFAULT = "https://sohan-gupthak.github.io";

export const getSiteUrl = (): string => {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv.replace(/\/$/, "") : SITE_URL_DEFAULT;
};

const xmlEscape = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const cdataEscape = (value: string): string =>
  value.replace(/]]>/g, "]]]]><![CDATA[>");

const toRfc822 = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return new Date(0).toUTCString();
  return d.toUTCString();
};

export const buildRssXml = (posts: BlogPostMeta[], opts?: { siteUrl?: string; buildDate?: Date }): string => {
  const siteUrl = (opts?.siteUrl ?? getSiteUrl()).replace(/\/$/, "");
  const buildDate = opts?.buildDate ?? new Date();
  const feedUrl = `${siteUrl}/blog/rss.xml`;
  const blogUrl = `${siteUrl}/blog`;
  const latestDate = posts
    .map((p) => new Date(p.updated ?? p.date).getTime())
    .filter((t) => !Number.isNaN(t))
    .sort((a, b) => b - a)[0];

  const items = posts
    .map((post) => {
      const link = `${siteUrl}/blog/${post.slug}`;
      const pubDate = toRfc822(post.date);
      const categories = (post.tags ?? [])
        .map((t) => `      <category>${xmlEscape(t)}</category>`)
        .join("\n");
      const authorBlock = post.author
        ? `      <author>${xmlEscape(post.author)}</author>`
        : "";
      return [
        "    <item>",
        `      <title>${xmlEscape(post.title)}</title>`,
        `      <link>${xmlEscape(link)}</link>`,
        `      <guid isPermaLink="true">${xmlEscape(link)}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        post.description
          ? `      <description>${xmlEscape(post.description)}</description>`
          : "      <description></description>",
        authorBlock,
        categories,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">`,
    `  <channel>`,
    `    <title>${xmlEscape("Sohan Guptha — Blog")}</title>`,
    `    <link>${xmlEscape(blogUrl)}</link>`,
    `    <description>${xmlEscape("Notes from a software engineer — React, Nodejs, Spring, and the slow craft of building for the web.")}</description>`,
    `    <language>en</language>`,
    `    <atom:link href="${xmlEscape(feedUrl)}" rel="self" type="application/rss+xml" />`,
    `    <lastBuildDate>${toRfc822(
      latestDate ? new Date(latestDate).toISOString() : buildDate.toISOString(),
    )}</lastBuildDate>`,
    items,
    `  </channel>`,
    `</rss>`,
  ].join("\n");
};

export const __test = { xmlEscape, cdataEscape, toRfc822 };