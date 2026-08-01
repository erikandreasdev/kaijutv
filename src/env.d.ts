/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

interface ImportMetaEnv {
  readonly PUBLIC_SANITY_PROJECT_ID: string;
  readonly PUBLIC_SANITY_DATASET: string;
  readonly SANITY_API_TOKEN: string;
  /** Canonical origin used for canonical URLs, OG tags and the sitemap. */
  readonly PUBLIC_SITE_URL?: string;
  /** Form backend the contact form POSTs to (Web3Forms, Formspree…). */
  readonly PUBLIC_CONTACT_ENDPOINT?: string;
  /** Public access key required by some form backends (e.g. Web3Forms). */
  readonly PUBLIC_CONTACT_ACCESS_KEY?: string;
  /** Cloudflare Turnstile site key. When set, the widget replaces the maths check. */
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
