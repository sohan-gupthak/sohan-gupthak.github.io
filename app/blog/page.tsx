import Link from "next/link";
import type { Metadata } from "next";

import { getPublishedPostMetas } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes from a software engineer — React, Nodejs, Spring, and the slow craft of building for the web.",
  alternates: {
    canonical: "/blog",
  },
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPostMetas();

  return (
    <main className="blog-index">
      <div className="blog-container">
        <h1 className="blog-index__title">Notes from the workshop.</h1>
        <p className="blog-index__lede">
          Long-form writing on the tools I build with — React, Nodejs, Spring,
          and whatever else I&apos;m poking at this month.
        </p>

        {posts.length === 0 ? (
          <p className="blog-empty">No posts yet. Check back soon.</p>
        ) : (
          <ol className="blog-list">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="blog-card">
                  <p className="blog-card__meta">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    {post.author ? <span>· {post.author}</span> : null}
                  </p>
                  <h2 className="blog-card__title">{post.title}</h2>
                  {post.description ? (
                    <p className="blog-card__desc">{post.description}</p>
                  ) : null}
                  {post.tags && post.tags.length > 0 ? (
                    <p className="blog-card__tags">
                      {post.tags.map((tag) => (
                        <span key={tag} className="blog-card__tag">
                          {tag}
                        </span>
                      ))}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}