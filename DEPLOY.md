# Deployment & Content Guide

---

## Part 1 — Astro Website (Cloudflare Workers)

The site builds to a static `dist/` folder and is served via **Cloudflare Workers** using the `wrangler.toml` config at the repo root.

- **Production URL:** `https://kaijutv.hidden-truth-5462.workers.dev`
- **Worker name:** `kaijutv`
- **Compatibility date:** `2025-05-16`

### First-time setup

1. Install Wrangler globally if not already present:
   ```bash
   npm install -g wrangler
   wrangler login   # opens browser to authenticate with Cloudflare
   ```

2. Copy and fill in credentials:
   ```bash
   cp .env.example .env
   # Set PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, SANITY_API_TOKEN
   ```

### Deploy

```bash
npm run build          # builds to dist/
npx wrangler deploy    # uploads dist/ to Cloudflare Workers
```

### Environment variables

Wrangler does not automatically read `.env` for builds — set these in the Cloudflare Dashboard under **Workers & Pages → kaijutv → Settings → Variables and Secrets**, or pass them manually at build time:

| Variable | Required | Value |
|----------|----------|-------|
| `PUBLIC_SANITY_PROJECT_ID` | yes | Your Sanity project ID |
| `PUBLIC_SANITY_DATASET` | yes | `production` |
| `SANITY_API_TOKEN` | yes | Your Sanity read token (build time only) |
| `PUBLIC_SITE_URL` | no | Canonical origin — canonical tags, Open Graph, sitemap. Defaults to `https://kaiju-tv.com` |
| `PUBLIC_CONTACT_ENDPOINT` | no | Form backend the contact form POSTs to (see *Contact form* below) |
| `PUBLIC_CONTACT_ACCESS_KEY` | no | Public access key for that backend (Web3Forms) |
| `PUBLIC_TURNSTILE_SITE_KEY` | no | Cloudflare Turnstile site key |

### Automatic deploys (GitHub Actions)

`.github/workflows/deploy.yml` builds and publishes on every push to `main`, and can
be run manually from the Actions tab. Add under **Settings → Secrets and variables → Actions**:

- **Secrets:** `CLOUDFLARE_API_TOKEN` (permission: *Edit Cloudflare Workers*), `CLOUDFLARE_ACCOUNT_ID`, `PUBLIC_SANITY_PROJECT_ID`, `SANITY_API_TOKEN`
- **Variables** (optional): `PUBLIC_SANITY_DATASET`, `PUBLIC_SITE_URL`, `PUBLIC_CONTACT_ENDPOINT`, `PUBLIC_CONTACT_ACCESS_KEY`, `PUBLIC_TURNSTILE_SITE_KEY`

### Custom domain

1. **Cloudflare Dashboard → Workers & Pages → kaijutv → Domains → Add Domain**
2. Enter `kaiju-tv.com` (and/or `www.kaiju-tv.com`)
3. Cloudflare handles DNS and SSL automatically if the domain is managed by Cloudflare

### Preview deployments

Preview URLs follow the pattern `*-kaijutv.hidden-truth-5462.workers.dev`. Use `wrangler versions upload` to push a preview without affecting production.

### Local development

```bash
npm run dev       # Astro dev server at localhost:4321 (hot reload, Studio at /studio)
npm run build     # static build to dist/
npm run preview   # serve dist/ locally via Astro's preview server
npx astro check   # TypeScript type-check all .astro files
```

---

## Part 2 — Sanity Studio (CMS)

The Sanity Studio is **embedded in the site** and served at `/studio` (e.g. `https://kaijutv.hidden-truth-5462.workers.dev/studio`). It can also be accessed locally at `http://localhost:4321/studio` during `npm run dev`.

### First-time Studio setup

#### 1. Create a Sanity project

If starting from scratch:
```bash
npx sanity@latest init
# Choose: new project → name it "kaijutv" → dataset: production
```

Copy the project ID and dataset into `.env`.

#### 2. Add CORS origins

The Studio makes API calls from the browser — the origin must be whitelisted.

1. Go to **sanity.io/manage → kaijutv project → API → CORS origins**
2. Add each origin with **Allow credentials: yes**:
   - `http://localhost:4321` (local dev)
   - `https://kaijutv.hidden-truth-5462.workers.dev` (production worker)
   - `https://kaiju-tv.com` (custom domain, once configured)

#### 3. Create a read API token

Used at build time to fetch content into the static build.

1. **sanity.io/manage → API → Tokens → Add API token**
2. Name: `build-token` — Permission: **Viewer**
3. Copy the token into `.env` as `SANITY_API_TOKEN`

---

### Content schemas

#### `siteSettings` (singleton)

Accessed in Studio as **Ajustes del Sitio**. There is always exactly one document (ID: `siteSettings`).

| Field | Description |
|-------|-------------|
| `heroHeadline` | Main heading on the homepage hero |
| `heroSubtitle` | Subtext beneath the headline |
| `reelVimeoId` | Numeric Vimeo ID for the showreel (e.g. `383493000`) |
| `aboutBio` | Biography text on the Sobre Mí page (separate paragraphs with a blank line) |
| `aboutPhoto` | Profile photo (hotspot-enabled) |
| `aboutStats` | Array of `{ value, label }` — the 3 metrics (years, clients, projects) |
| `email` | Contact email. Never rendered in plain text — the site obfuscates it against spam harvesters |
| `ogImage` | Image shown when the site is shared on WhatsApp/LinkedIn/X (1200×630 px) |
| `socialLinks` | Array of `{ platform, url }` — vimeo, instagram, behance, facebook |

#### `project`

Portfolio items shown on `/portfolio` and the homepage grid.

| Field | Description |
|-------|-------------|
| `title` | Project name |
| `slug` | URL slug — **must match** one of the 47 slugs from the original sitemap for URL continuity |
| `category` | Dropdown: motion-graphics, branding, explainer-video, contenido-rrss, publicidad-online, broadcast-design, brand-video, otro |
| `tags` | References to **Etiqueta** documents (dirección de arte, motion graphics, ilustración…). Drive the portfolio filter |
| `body` | **Descripción** — rich text: bold, italic, underline, strike, links, lists, small headings, quotes |
| `description` | Deprecated plain-text field. Only visible on documents that still hold old copy; move it to `body` and clear it, and it disappears |
| `thumbnail` | GIF or image used in the portfolio grid (+ optional `alt`) |
| `vimeoUrl` | Full Vimeo URL — the app extracts the numeric ID automatically |
| `gallery` | Images and Vimeo videos. Each image takes `alt`, `caption` and `wide` (full-row) |
| `featured` | Boolean — if true, project appears on the homepage grid |
| `order` | Number — lower = appears first in the homepage featured grid |

#### `tag` (Etiqueta)

Disciplines used to filter the portfolio. Create as many as you need.

| Field | Description |
|-------|-------------|
| `title` | Ej: Dirección de arte, Motion graphics, Ilustración, 3D |
| `slug` | Used in the `/portfolio?tag=…` filter URL — press *Generate* |
| `order` | Position in the filter row (lower = first) |

#### `service`

The three service cards on the homepage.

| Field | Description |
|-------|-------------|
| `title` | Service name |
| `description` | Short description |
| `icon` | PNG icon image |
| `order` | Display order (1 = first) |

---

### Common Studio operations

**Edit hero text or reel:**
Studio → Ajustes del Sitio → change `heroHeadline`, `heroSubtitle`, or `reelVimeoId` → Publish

**Update biography or photo:**
Studio → Ajustes del Sitio → edit `aboutBio` (blank line between paragraphs) or replace `aboutPhoto` → Publish

**Update metrics (years / clients / projects):**
Studio → Ajustes del Sitio → `aboutStats` array → edit each `value` and `label` → Publish

**Add a new portfolio project:**
Studio → Proyecto → New → fill title, slug, category, tags, thumbnail, vimeoUrl, descripción → set `featured` and `order` if it should appear on homepage → Publish

**Upload gallery images (no external hosting needed):**
Open the project → **Galería** tab → drag a whole folder of images onto the gallery field, or
*Add item → Image* and multi-select files in the picker. They upload straight to Sanity's CDN —
imgbb or any other intermediate host is no longer involved. Reorder by dragging, add `alt`/`caption`
per image, and tick **Ocupar todo el ancho** for the ones that should span the full row.
The **Media** tab in the Studio's top bar is a full asset library: bulk upload once, reuse anywhere.

**Create a new discipline tag:**
Studio → Etiquetas → New → título + *Generate* slug + orden → Publish. It then appears in the
project's *Etiquetas* field and in the `/portfolio` filter as soon as a project uses it.

**Write a formatted description:**
Open the project → **Descripción** → use the toolbar for bold, italic, underline, lists, quotes and
links. Old projects show a read-only *Descripción (formato antiguo)* box — paste that text into the
new field, clear the old one, and it disappears for good.

**Change which projects appear on the homepage:**
Studio → Proyecto → open a project → toggle `featured` on/off, adjust `order` → Publish

**Edit or reorder service cards:**
Studio → Servicio → open a card → edit fields or change `order` → Publish

**Update social links or contact email:**
Studio → Ajustes del Sitio → `socialLinks` array or `email` field → Publish

---

### Keeping the site in sync with content

The site is **statically built** — content changes in Studio don't appear live until a rebuild and redeploy.

#### Option A — Manual redeploy (quickest)

```bash
npm run build && npx wrangler deploy
```

#### Option B — Sanity webhook → auto redeploy (recommended for production)

Set up a webhook in Sanity that calls a CI trigger (e.g. a GitHub Actions workflow or a Cloudflare Worker cron) on content publish:

1. **sanity.io/manage → API → Webhooks → Add webhook**
   - URL: your CI trigger endpoint
   - Dataset: `production`
   - Trigger on: **Create**, **Update**, **Delete**
2. The webhook fires on every publish and kicks off `npm run build && npx wrangler deploy`

---

### Useful Sanity CLI commands

```bash
npx sanity@latest manage          # open sanity.io/manage in browser
npx sanity@latest dataset list    # list datasets
npx sanity@latest dataset export production ./backup.tar.gz   # export full dataset
npx sanity@latest dataset import ./backup.tar.gz production   # restore from backup
npx sanity@latest documents query '*[_type == "project"]'     # GROQ query via CLI
```

---

## Part 3 — Contact form & anti-spam

The homepage contact section (`/#contacto`) is a real form with layered spam protection. It works
out of the box with **no configuration**, and gets stronger as you configure it.

### Protection that is always on

| Layer | What it does |
|-------|--------------|
| Email obfuscation | The address never appears in the HTML in machine-readable form. Harvester bots that crawl the page find nothing to scrape — this alone kills most of the incoming spam, since the old site exposed `mailto:info@kaiju-tv.com` on every page. |
| Honeypot field | An invisible field only bots fill in. If it has a value the form reports success and sends nothing. |
| Time trap | Submissions faster than 4 s are held back until the window elapses. Scripts do not wait; people are never blocked. |
| Maths challenge | A small sum, generated in the browser so it is not sitting in the static HTML for a crawler to pre-solve. |

### Level 1 — no backend (current default)

With `PUBLIC_CONTACT_ENDPOINT` empty, a valid submission opens the visitor's mail client with
name, email and message already filled in. Nothing to set up, nothing to pay for.

### Level 2 — a form backend (recommended)

Messages then arrive in the inbox directly, and the sender's address never leaves the browser as a
`mailto:`.

**Web3Forms** (free tier, no account needed):

1. Go to <https://web3forms.com> → enter the destination email → copy the access key.
2. Set the build-time variables:
   ```
   PUBLIC_CONTACT_ENDPOINT=https://api.web3forms.com/submit
   PUBLIC_CONTACT_ACCESS_KEY=<your access key>
   ```

**Formspree** works the same way — set `PUBLIC_CONTACT_ENDPOINT=https://formspree.io/f/xxxxxxx`
and leave the access key empty.

### Level 3 — Cloudflare Turnstile (strongest)

A real bot-detection challenge, free and privacy-friendly. It replaces the maths question.

1. **dash.cloudflare.com → Turnstile → Add site** → enter the domain → copy the **site key**.
2. Set `PUBLIC_TURNSTILE_SITE_KEY=<site key>` and rebuild.
3. In the form backend, enable Turnstile verification and paste the **secret key** there
   (Web3Forms and Formspree both verify the `cf-turnstile-response` token server-side).

Without step 3 the widget is decorative — the token has to be checked by whoever receives the
message.

Remember: all four variables are **build-time**. After changing any of them, rebuild and redeploy.
