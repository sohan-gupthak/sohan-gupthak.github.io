export type BlogFrontmatter = {
  title: string;
  date: string;
  description?: string;
  author?: string;
  updated?: string;
  tags?: string[];
  image?: string;
  draft?: boolean;
  slug?: string;
  readTime?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  description?: string;
  author?: string;
  updated?: string;
  tags?: string[];
  image?: string;
  draft?: boolean;
  readTime?: string;
  content: string;
  filePath: string;
};

export type BlogPostMeta = Omit<BlogPost, "content" | "filePath">;