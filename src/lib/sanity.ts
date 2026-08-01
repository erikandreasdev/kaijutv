import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url';
import type { PortableTextBlock } from '@portabletext/types';

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

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export type SanityImage = SanityImageSource & {
  _type: 'image';
  _key?: string;
  alt?: string;
  caption?: string;
  wide?: boolean;
  dimensions?: ImageDimensions | null;
  lqip?: string | null;
};

export interface VimeoItem {
  _type: 'vimeoItem';
  _key: string;
  vimeoUrl: string;
}

export type GalleryItem = SanityImage | VimeoItem;

export interface Tag {
  _id: string;
  title: string;
  slug: string;
  order?: number;
}

export interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  client?: string;
  tags?: Tag[];
  thumbnail?: SanityImage;
  vimeoUrl?: string;
  /** Rich text (Portable Text). Preferred over the legacy `description`. */
  body?: PortableTextBlock[];
  /** Plain-text description kept for pre-migration documents and SEO excerpts. */
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
  aboutPhoto?: SanityImage;
  aboutStats: Stat[];
  email: string;
  ogImage?: SanityImage;
  socialLinks: SocialLink[];
}

export interface Service {
  _id: string;
  title: string;
  description: string;
  icon?: SanityImageSource;
  order: number;
}

// --- GROQ projections ---
// `asset` is left as a reference so `urlFor()` still works, while the image
// metadata is flattened alongside it for width/height and LQIP placeholders.

const IMAGE_META = `..., "dimensions": asset->metadata.dimensions, "lqip": asset->metadata.lqip`;

const PROJECT_FIELDS = `
  ...,
  thumbnail{ ${IMAGE_META} },
  gallery[]{ ${IMAGE_META} },
  tags[]->{ _id, title, "slug": slug.current, order }
`;

// --- GROQ helpers ---
// All helpers return null/[] on failure so pages render with fallback content
// when Sanity credentials are not yet configured.

async function safeFetch<T>(query: string, params?: Record<string, unknown>): Promise<T | null> {
  if (!projectId) return null;
  try {
    return await sanityClient.fetch<T>(query, params ?? {});
  } catch (error) {
    console.warn('[sanity] query failed, falling back to empty content:', error);
    return null;
  }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return safeFetch<SiteSettings>(
    `*[_type == "siteSettings"][0]{
      ...,
      aboutPhoto{ ${IMAGE_META} },
      ogImage{ ${IMAGE_META} }
    }`
  );
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (
    (await safeFetch<Project[]>(
      `*[_type == "project" && featured == true] | order(order asc)[0...12]{ ${PROJECT_FIELDS} }`
    )) ?? []
  );
}

export async function getHomeProjects(): Promise<Project[]> {
  return (
    (await safeFetch<Project[]>(
      `*[_type == "project"] | order(order asc)[0...12]{ ${PROJECT_FIELDS} }`
    )) ?? []
  );
}

export async function getAllProjects(): Promise<Project[]> {
  return (
    (await safeFetch<Project[]>(
      `*[_type == "project"] | order(order asc){ ${PROJECT_FIELDS} }`
    )) ?? []
  );
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return safeFetch<Project>(
    `*[_type == "project" && slug.current == $slug][0]{ ${PROJECT_FIELDS} }`,
    { slug }
  );
}

export async function getAllProjectSlugs(): Promise<{ slug: string }[]> {
  return (
    (await safeFetch<{ slug: string }[]>(
      `*[_type == "project" && defined(slug.current)]{ "slug": slug.current }`
    )) ?? []
  );
}

export async function getServices(): Promise<Service[]> {
  return (await safeFetch<Service[]>(`*[_type == "service"] | order(order asc)`)) ?? [];
}

/** Tags that are actually used by at least one project, in filter order. */
export async function getUsedTags(): Promise<Tag[]> {
  return (
    (await safeFetch<Tag[]>(
      `*[_type == "tag" && count(*[_type == "project" && references(^._id)]) > 0]
        | order(order asc, title asc){ _id, title, "slug": slug.current, order }`
    )) ?? []
  );
}

function assetRef(image: SanityImage | undefined): string {
  const asset = (image as { asset?: { _ref?: string; _id?: string } } | undefined)?.asset;
  return asset?._ref ?? asset?._id ?? '';
}

/**
 * GIFs must be served untransformed — any width/format transform flattens them
 * to a still frame.
 */
export function isAnimated(image?: SanityImage): boolean {
  return /-gif$/.test(assetRef(image));
}

/** Display-sized source, safe for both static images and animated GIFs. */
export function imageSrc(image: SanityImage, width: number, quality = 82): string {
  if (isAnimated(image)) return urlFor(image).url();
  return urlFor(image).width(width).quality(quality).auto('format').url();
}

/** Full-resolution source used by the lightbox. */
export function imageFullSrc(image: SanityImage): string {
  if (isAnimated(image)) return urlFor(image).url();
  return urlFor(image).width(2400).quality(92).auto('format').url();
}

export function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

/** Flattens Portable Text to plain text — used for meta descriptions. */
export function toPlainText(blocks?: PortableTextBlock[]): string {
  if (!blocks?.length) return '';
  return blocks
    .filter((block) => block._type === 'block')
    .map((block) =>
      ((block as { children?: { text?: string }[] }).children ?? [])
        .map((child) => child.text ?? '')
        .join('')
    )
    .join(' ')
    .trim();
}
