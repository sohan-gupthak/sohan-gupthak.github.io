import { FooterLink } from "../types";

export const FOOTER_LINKS: FooterLink[] = [
  {
    name: 'LinkedIn',
    hoverText: 'Connect with me',
    icon: 'icons/linkedin.svg',
    url: 'https://www.linkedin.com/in/sohan-guptha/',
  },
  {
    name: 'GitHub',
    hoverText: 'Open Sourcing',
    icon: 'icons/github.svg',
    url: 'https://github.com/sohan-gupthak',
  },
  {
    name: 'Skills',
    hoverText: 'Agent skills',
    icon: 'icons/skills.svg',
    url: 'https://www.skills.sh/sohan-gupthak/skills',
  },
  {
    name: 'Blog',
    hoverText: 'Read the blog',
    icon: 'icons/blog.svg',
    url: '/blog',
  },
  {
    name: 'Resume',
    hoverText: 'Download',
    icon: 'icons/file.svg',
    url: './Resume_latest.pdf',
  }
];