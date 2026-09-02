import * as Markdoc from "@markdoc/markdoc";
import type { Config as MarkdocConfig } from "@markdoc/markdoc";
import type { ComponentType, ReactNode } from "react";
import React from "react";

const config: MarkdocConfig = {
  nodes: {
    heading: {
      render: "Heading",
      attributes: { level: { type: Number, default: 2 } },
    },
    paragraph: { render: "Paragraph" },
    list: {
      render: "List",
      attributes: { ordered: { type: Boolean, default: false } },
    },
    item: { render: "Item" },
    link: {
      render: "Link",
      attributes: {
        href: { type: String },
        title: { type: String },
      },
    },
    fence: {
      render: "CodeBlock",
      attributes: { language: { type: String } },
    },
    blockquote: { render: "Blockquote" },
    hr: { render: "Hr" },
    image: {
      render: "Image",
      attributes: {
        src: { type: String },
        alt: { type: String, default: "" },
        title: { type: String },
      },
    },
    strong: { render: "Strong" },
    em: { render: "Emphasis" },
  },
  tags: {},
};

type HeadingProps = { level: number; children?: ReactNode };
type ChildrenProps = { children?: ReactNode };
type ListProps = { ordered: boolean; children?: ReactNode };
type LinkProps = { href?: string; title?: string; children?: ReactNode };
type CodeBlockProps = { language?: string; children?: ReactNode };
type ImageProps = { src?: string; alt?: string; title?: string };

const BLOCK_CLASSES: Record<string, true> = {
  "md-heading": true,
  "md-pre": true,
  "md-quote": true,
  "md-hr": true,
  "md-image": true,
  "md-list": true,
};

const isBlockClassName = (className: unknown): boolean => {
  if (typeof className !== "string") return false;
  const first = className.split(/\s+/)[0];
  if (first === undefined || first === "") return false;
  return BLOCK_CLASSES[first] === true;
};

const isBlockChild = (node: unknown): boolean => {
  if (!React.isValidElement(node)) return false;
  if (node.props === null || typeof node.props !== "object") return false;
  if (!("className" in node.props)) return false;
  return isBlockClassName((node.props as { className: unknown }).className);
};

const Heading = ({ level, children }: HeadingProps) => {
  const safe = Math.min(Math.max(level, 1), 6);
  const Tag = (`h${safe}` as unknown) as keyof React.JSX.IntrinsicElements;
  return React.createElement(Tag, { className: "md-heading" }, children);
};

const Paragraph = ({ children }: ChildrenProps) => {
  const arr = React.Children.toArray(children);
  const inlines: ReactNode[] = [];
  const blocks: ReactNode[] = [];
  for (const child of arr) {
    if (isBlockChild(child)) blocks.push(child);
    else inlines.push(child);
  }
  if (blocks.length === 0) {
    return React.createElement("p", { className: "md-paragraph" }, inlines);
  }
  return React.createElement(
    React.Fragment,
    null,
    inlines.length > 0
      ? React.createElement("p", { className: "md-paragraph" }, inlines)
      : null,
    ...blocks,
  );
};

const List = ({ ordered, children }: ListProps) =>
  React.createElement(ordered ? "ol" : "ul", { className: "md-list" }, children);
const Item = ({ children }: ChildrenProps) =>
  React.createElement("li", { className: "md-item" }, children);
const Link = ({ href, title, children }: LinkProps) =>
  React.createElement("a", { className: "md-link", href: href ?? "#", title }, children);
const CodeBlock = ({ language, children }: CodeBlockProps) =>
  React.createElement(
    "pre",
    { className: "md-pre", "data-language": language ?? "text" },
    React.createElement("code", null, children),
  );
const Blockquote = ({ children }: ChildrenProps) =>
  React.createElement("blockquote", { className: "md-quote" }, children);
const Hr = () => React.createElement("hr", { className: "md-hr" });
const Image = ({ src, alt, title }: ImageProps) =>
  React.createElement("img", {
    className: "md-image",
    src,
    alt: alt ?? "",
    title,
    loading: "lazy",
  });
const Strong = ({ children }: ChildrenProps) =>
  React.createElement("strong", { className: "md-strong" }, children);
const Emphasis = ({ children }: ChildrenProps) =>
  React.createElement("em", { className: "md-em" }, children);

const components: Record<string, ComponentType<unknown>> = {
  Heading: Heading as ComponentType<unknown>,
  Paragraph: Paragraph as ComponentType<unknown>,
  List: List as ComponentType<unknown>,
  Item: Item as ComponentType<unknown>,
  Link: Link as ComponentType<unknown>,
  CodeBlock: CodeBlock as ComponentType<unknown>,
  Blockquote: Blockquote as ComponentType<unknown>,
  Hr: Hr as ComponentType<unknown>,
  Image: Image as ComponentType<unknown>,
  Strong: Strong as ComponentType<unknown>,
  Emphasis: Emphasis as ComponentType<unknown>,
};

export const renderMarkdoc = (source: string): ReactNode => {
  const ast = Markdoc.parse(source);
  const transformed = Markdoc.transform(ast, config);
  return Markdoc.renderers.react(transformed, React, { components });
};