/**
 * Address-harvesting protection.
 *
 * Plain `mailto:` links in static HTML are the single easiest thing for spam
 * crawlers to scrape, so no page ever renders the address in a machine-readable
 * form. The markup carries a base64 payload that only client-side JS turns back
 * into a working link; visitors without JS still see a human-readable version.
 */

export function encodeEmail(email: string): string {
  return Buffer.from(email, 'utf-8').toString('base64');
}

/** Human-readable, non-scrapable rendering: `info (at) kaiju-tv (dot) com`. */
export function humanizeEmail(email: string): string {
  return email.replace('@', ' (at) ').replace(/\.([a-z]+)$/i, ' (dot) $1');
}
