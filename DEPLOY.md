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

| Variable | Value |
|----------|-------|
| `PUBLIC_SANITY_PROJECT_ID` | Your Sanity project ID |
| `PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_API_TOKEN` | Your Sanity read token (build time only) |

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
| `email` | Contact email shown in footer and nav |
| `socialLinks` | Array of `{ platform, url }` — vimeo, instagram, behance, facebook |

#### `project`

Portfolio items shown on `/portfolio` and the homepage grid.

| Field | Description |
|-------|-------------|
| `title` | Project name |
| `slug` | URL slug — **must match** one of the 47 slugs from the original sitemap for URL continuity |
| `category` | Dropdown: motion-graphics, branding, explainer-video, contenido-rrss, publicidad-online, broadcast-design, brand-video, otro |
| `thumbnail` | GIF or image used in the portfolio grid. **Do not apply width transforms on GIFs** (breaks animation) |
| `vimeoUrl` | Full Vimeo URL — the app extracts the numeric ID automatically |
| `description` | Project description shown on the project detail page |
| `featured` | Boolean — if true, project appears on the homepage grid |
| `order` | Number — lower = appears first in the homepage featured grid |

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
Studio → Proyecto → New → fill title, slug, category, thumbnail, vimeoUrl, description → set `featured` and `order` if it should appear on homepage → Publish

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
