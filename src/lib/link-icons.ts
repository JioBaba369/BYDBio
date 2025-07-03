import type { LucideIcon } from 'lucide-react';
import { Globe, Linkedin, Github, Twitter, Instagram, Facebook, Youtube, Link, Mail, Phone } from 'lucide-react';

export const linkIcons: Record<string, LucideIcon> = {
  Link,
  Globe,
  Mail,
  Phone,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
};

export const availableIconNames = Object.keys(linkIcons) as (keyof typeof linkIcons)[];
