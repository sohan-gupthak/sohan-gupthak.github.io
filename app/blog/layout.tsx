import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./blog.css";

const SITE_URL_FALLBACK = "https://sohan-gupthak.github.io";

const getSiteUrl = (): string =>
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || SITE_URL_FALLBACK;

export const metadata: Metadata = {
  alternates: {
    canonical: "/blog",
    types: {
      "application/rss+xml": [
        { url: "/blog/rss.xml", title: "Sohan Guptha — Blog RSS" },
      ],
    },
  },
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  const siteUrl = getSiteUrl();
  return (
    <div className="blog-shell">
      <link
        rel="alternate"
        type="application/rss+xml"
        title={`Blog RSS — ${siteUrl.replace(/^https?:\/\//, "")}`}
        href="/blog/rss.xml"
      />
      <header className="blog-header">
        <Link href="/blog" className="blog-header__brand">
          Blog
        </Link>
        <nav className="blog-header__nav" aria-label="Blog navigation">
          <Link href="/" className="blog-header__link">
            Home
          </Link>
          <a href="/blog/rss.xml" className="blog-header__link">
            RSS
          </a>
        </nav>
      </header>
      {children}
    </div>
  );
}