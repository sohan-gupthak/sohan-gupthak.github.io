import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import type { BlogPost, BlogPostMeta } from "./types";

const CONTENT_ROOT = path.join(process.cwd(), "content", "blogs");
const SUPPORTED_EXTENSIONS: Record<string, true> = { ".mdoc": true, ".md": true };

const slugifyFromFilename = (filename: string): string =>
  filename.replace(/\.(mdoc|md)$/i, "").toLowerCase();

const toIsoDate = (raw: unknown, fallback: string): string => {
  if (typeof raw !== "string" || raw.length === 0) return fallback;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toISOString();
};

const asStringArray = (raw: unknown): string[] | undefined => {
  if (!Array.isArray(raw)) return undefined;
  const filtered = raw.filter((v): v is string => typeof v === "string" && v.length > 0);
  return filtered.length > 0 ? filtered : undefined;
};

const readAllPosts = async (): Promise<BlogPost[]> => {
  let entries: string[];
  try {
    entries = await fs.readdir(CONTENT_ROOT);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }

  const files = entries.filter((name) => {
    const ext = path.extname(name).toLowerCase();
    return SUPPORTED_EXTENSIONS[ext] === true && !name.startsWith("_");
  });

  const posts: BlogPost[] = [];
  const seenSlugs = new Map<string, string>();

  for (const file of files) {
    const fullPath = path.join(CONTENT_ROOT, file);
    const raw = await fs.readFile(fullPath, "utf8");
    const parsed = matter(raw);
    const data = parsed.data ?? {};

    const fallbackSlug = slugifyFromFilename(file);
    const declaredSlug =
      typeof data.slug === "string" && data.slug.trim().length > 0
        ? data.slug
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-_/]/g, "")
        : undefined;
    const slug = declaredSlug ?? fallbackSlug;

    if (seenSlugs.has(slug)) {
      throw new Error(
        `Duplicate blog slug "${slug}" (files: ${seenSlugs.get(slug)}, ${file})`,
      );
    }
    seenSlugs.set(slug, file);

    const fallbackDate = new Date(0).toISOString();
    const date = toIsoDate(data.date, fallbackDate);

    posts.push({
      slug,
      title: typeof data.title === "string" ? data.title : slug,
      date,
      description: typeof data.description === "string" ? data.description : undefined,
      author: typeof data.author === "string" ? data.author : undefined,
      updated: toIsoDate(data.updated, date),
      tags: asStringArray(data.tags),
      image: typeof data.image === "string" ? data.image : undefined,
      draft: data.draft === true,
      content: parsed.content,
      filePath: fullPath,
    });
  }

  return posts;
};

const sortPosts = (posts: BlogPost[]): BlogPost[] =>
  [...posts].sort((a, b) => {
    const dateDelta = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDelta !== 0) return dateDelta;
    return a.slug.localeCompare(b.slug);
  });

const toMeta = (post: BlogPost): BlogPostMeta => ({
  slug: post.slug,
  title: post.title,
  date: post.date,
  description: post.description,
  author: post.author,
  updated: post.updated,
  tags: post.tags,
  image: post.image,
  draft: post.draft,
});


const isPublished = (post: BlogPost): boolean => post.draft !== true;

let cachedAll: BlogPost[] | undefined;
const getAllPosts = async (): Promise<BlogPost[]> => {
  if (!cachedAll) {
    cachedAll = sortPosts(await readAllPosts());
  }
  return cachedAll;
};

export const getPublishedPosts = async (): Promise<BlogPost[]> => {
  const all = await getAllPosts();
  return all.filter(isPublished);
};

export const getPublishedPostMetas = async (): Promise<BlogPostMeta[]> => {
  const published = await getPublishedPosts();
  return published.map(toMeta);
};

export const getPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  const all = await getAllPosts();
  const match = all.find((p) => p.slug === slug);
  if (!match) return undefined;
  if (!isPublished(match)) return undefined;
  return match;
};

export const getAllSlugs = async (): Promise<string[]> => {
  const published = await getPublishedPosts();
  return published.map((p) => p.slug);
};

export const resetBlogCacheForBuild = (): void => {
  cachedAll = undefined;
};