import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';

export const sanityClient = createClient({
  projectId: projectId || 'placeholder',
  dataset,
  useCdn: import.meta.env.PROD,
  apiVersion: '2024-01-01',
  token: import.meta.env.SANITY_API_TOKEN,
});

const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// --- Types ---

export type GalleryItem =
  | (SanityImageSource & { _type: 'image'; _key: string })
  | { _type: 'vimeoItem'; _key: string; vimeoUrl: string };

export interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  client?: string;
  thumbnail?: SanityImageSource;
  vimeoUrl?: string;
  behanceUrl?: string;
  description?: string;
  gallery?: GalleryItem[];
  featured: boolean;
  order: number;
}

export interface Stat {
  _key: string;
  value: string;
  label: string;
}

export interface SocialLink {
  _key: string;
  platform: 'vimeo' | 'instagram' | 'behance' | 'facebook';
  url: string;
}

export interface SiteSettings {
  heroHeadline: string;
  heroSubtitle: string;
  reelVimeoId?: string;
  aboutIntro: string;
  aboutBio: string;
  aboutPhoto?: SanityImageSource;
  aboutStats: Stat[];
  email: string;
  socialLinks: SocialLink[];
}

export interface Service {
  _id: string;
  title: string;
  description: string;
  icon?: SanityImageSource;
  order: number;
}

// --- GROQ helpers ---
// All helpers return null/[] on failure so pages render with fallback content
// when Sanity credentials are not yet configured.

async function safeFetch<T>(query: string, params?: Record<string, unknown>): Promise<T | null> {
  if (!projectId) return null;
  try {
    return await sanityClient.fetch<T>(query, params ?? {});
  } catch {
    return null;
  }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return safeFetch<SiteSettings>(`*[_type == "siteSettings"][0]`);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await safeFetch<Project[]>(
    `*[_type == "project" && featured == true] | order(order asc)[0...12]`
  )) ?? [];
}

export async function getHomeProjects(): Promise<Project[]> {
  return (await safeFetch<Project[]>(
    `*[_type == "project"] | order(order asc)[0...12]`
  )) ?? [];
}

export async function getAllProjects(): Promise<Project[]> {
  return (await safeFetch<Project[]>(`*[_type == "project"] | order(order asc)`)) ?? [];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return safeFetch<Project>(
    `*[_type == "project" && slug.current == $slug][0]`,
    { slug }
  );
}

export async function getAllProjectSlugs(): Promise<{ slug: string }[]> {
  return (await safeFetch<{ slug: string }[]>(
    `*[_type == "project"]{ "slug": slug.current }`
  )) ?? [];
}

export async function getServices(): Promise<Service[]> {
  return (await safeFetch<Service[]>(`*[_type == "service"] | order(order asc)`)) ?? [];
}

export function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}
