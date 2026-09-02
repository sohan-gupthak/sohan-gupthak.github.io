import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { renderMarkdoc } from "@/lib/blog/markdoc";
import { getAllSlugs, getPostBySlug } from "@/lib/blog/posts";

const SITE_URL_FALLBACK = "https://sohan-gupthak.github.io";
const getSiteUrl = (): string =>
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || SITE_URL_FALLBACK;

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  const siteUrl = getSiteUrl();
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `${siteUrl}/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: post.author ? { "@type": "Person", name: post.author } : undefined,
    keywords: post.tags?.join(", "),
  };

  return (
    <main className="blog-article">
      <div className="blog-container">
        <Link href="/blog" className="blog-article__back">
          ← Back to all posts
        </Link>
        <header className="blog-article__header">
          <h1 className="blog-article__title">{post.title}</h1>
          <p className="blog-article__meta">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.author ? <span>· {post.author}</span> : null}
            {post.updated && post.updated !== post.date ? (
              <span>
                · updated <time dateTime={post.updated}>{formatDate(post.updated)}</time>
              </span>
            ) : null}
          </p>
        </header>
        <article className="blog-prose">
          {renderMarkdoc(post.content)}
        </article>
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}

        />
        <footer className="blog-footer">
          <span>{post.slug}</span>
          <a href="/blog/rss.xml">Subscribe via RSS</a>
        </footer>
      </div>
    </main>
  );
}