# Deploying to Cloudflare Pages (Free Tier)

This site is a fully static Astro build (`output: 'static'`), making it a perfect fit for Cloudflare Pages. Build runs at deploy time; Sanity data is fetched then and baked into the HTML.

---

## Prerequisites

- Cloudflare account (free at cloudflare.com)
- Sanity project created and credentials ready (see `.env.example`)
- Code pushed to a GitHub or GitLab repository

---

## Step 1 — Push the code to GitHub

If you haven't already:

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create kaijutv-website --private --source=. --push
# or push to an existing remote manually
```

---

## Step 2 — Create a Cloudflare Pages project

1. Go to **Cloudflare Dashboard → Workers & Pages → Create → Pages**
2. Click **Connect to Git** and authorize Cloudflare to access your GitHub account
3. Select the `kaijutv-website` repository
4. Configure the build:

| Setting | Value |
|---------|-------|
| Framework preset | `Astro` (or leave blank — same result) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *(leave blank — repo root)* |

---

## Step 3 — Set environment variables

In the Pages project settings (**Settings → Environment variables**), add these under **Production** (and optionally **Preview**):

| Variable | Value |
|----------|-------|
| `PUBLIC_SANITY_PROJECT_ID` | Your Sanity project ID |
| `PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_API_TOKEN` | Your Sanity read token (used at build time only) |
| `NODE_VERSION` | `22` |

> `NODE_VERSION=22` is required — Cloudflare Pages defaults to an older Node; this project requires ≥22.12.0.

---

## Step 4 — Add your Cloudflare domain to Sanity CORS

Cloudflare Pages assigns a URL like `https://kaijutv-website.pages.dev`. The embedded Sanity Studio at `/studio` makes browser requests from that origin.

1. Go to **sanity.io/manage → your project → API → CORS origins**
2. Add `https://kaijutv-website.pages.dev` (allow credentials: yes)
3. If you set up a custom domain (e.g. `kaiju-tv.com`), add that too

---

## Step 5 — Deploy

Click **Save and Deploy** in the Cloudflare Pages wizard. The first build takes ~2–3 minutes. When it finishes, your site is live at `https://kaijutv-website.pages.dev`.

---

## Custom domain (optional)

1. **Cloudflare Dashboard → Pages → your project → Custom domains → Set up a custom domain**
2. Enter `kaiju-tv.com` (and optionally `www.kaiju-tv.com`)
3. Cloudflare handles DNS and SSL automatically if the domain is already on Cloudflare; otherwise follow the nameserver instructions

---

## Keeping content up to date

Because the site is statically built, **new or edited Sanity content won't appear until the site is rebuilt.** Two options:

### Option A — Sanity deploy hook (recommended)

1. In Cloudflare Pages → **Settings → Builds & deployments → Deploy hooks**, create a hook named `sanity-content-change` and copy the URL
2. In **sanity.io/manage → your project → API → Webhooks**, add a new webhook:
   - URL: the Cloudflare hook URL
   - Dataset: `production`
   - Trigger on: **Create**, **Update**, **Delete**
3. Now every content save in Studio triggers a rebuild automatically (≈2 min to go live)

### Option B — Manual redeploy

In Cloudflare Pages, click **Manage deployments → Retry deployment** on the latest build, or push any commit to trigger a new build.

---

## Local → production parity check

Before deploying, verify the build works locally:

```bash
cp .env.example .env          # fill in real credentials
npm run build                 # should exit 0, output to dist/
npm run preview               # serve dist/ at localhost:4321
```

---

## Free tier limits (Cloudflare Pages)

| Resource | Free limit |
|----------|-----------|
| Builds per month | 500 |
| Bandwidth | Unlimited |
| Requests | Unlimited |
| Custom domains | Unlimited |
| Files per deployment | 20,000 (max 25 MB each) |

This site comfortably fits within all limits.
