
import type { LucideIcon } from 'lucide-react';
import { Globe, Linkedin, Github, Twitter, Instagram, Facebook, Youtube, Link, Mail, Phone } from 'lucide-react';

type LinkIconInfo = {
  icon: LucideIcon;
  title: string;
  urlPrefix: string;
};

export const linkIconData: Record<string, LinkIconInfo> = {
  Link: { icon: Link, title: 'Website', urlPrefix: 'https://' },
  Globe: { icon: Globe, title: 'Portfolio', urlPrefix: 'https://' },
  Mail: { icon: Mail, title: 'Email', urlPrefix: 'mailto:' },
  Phone: { icon: Phone, title: 'Phone', urlPrefix: 'tel:' },
  Linkedin: { icon: Linkedin, title: 'LinkedIn', urlPrefix: 'https://www.linkedin.com/in/' },
  Github: { icon: Github, title: 'GitHub', urlPrefix: 'https://github.com/' },
  Twitter: { icon: Twitter, title: 'Twitter / X', urlPrefix: 'https://x.com/' },
  Instagram: { icon: Instagram, title: 'Instagram', urlPrefix: 'https://www.instagram.com/' },
  Facebook: { icon: Facebook, title: 'Facebook', urlPrefix: 'https://www.facebook.com/' },
  Youtube: { icon: Youtube, title: 'YouTube', urlPrefix: 'https://www.youtube.com/@' },
};


export const linkIcons: Record<string, LucideIcon> = Object.fromEntries(
  Object.entries(linkIconData).map(([key, { icon }]) => [key, icon])
);

export const availableIconNames = Object.keys(linkIcons) as (keyof typeof linkIcons)[];
