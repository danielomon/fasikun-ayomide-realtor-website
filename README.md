# Fasikun Ayomide | Realtor — Website

A premium, mobile-first real estate advisory website with a working backend.
No build tools, no npm install required — pure HTML/CSS/JS frontend and a
vanilla Node.js backend.

## Run it locally

Requires Node.js 16+. No npm install needed — this project has zero dependencies.

```bash
node backend/server.js
```

Then open **http://localhost:3000**

To use a different port:
```bash
PORT=8080 node backend/server.js
```

Email notifications need a bit of setup first — see **"Setting up email notifications"** below.
Without it, the site works fully and leads are still saved; you just won't get emailed about them.

## Project structure

```
frontend/
  index.html            Homepage
  pages/
    properties.html      Full property listing + filters
    property.html         Single property template (loads data by ID)
    about.html
    why-invest.html
    how-it-works.html
    testimonials.html
    insights.html
    contact.html
  css/style.css          Full design system (colors, type, components)
  js/
    components.js         Header, footer, mobile nav, WhatsApp float — edit CONFIG here
    main.js                FAQ accordion + contact form submission
    properties.js          Fetches property data from the API and renders cards/detail pages

backend/
  server.js               Vanilla Node HTTP server + REST API
  email.js                Sends lead notification + auto-reply emails via the Resend API
  data/
    properties.json        Property listings — edit this to add/change properties
    testimonials.json      Client testimonials
    leads.json              Auto-created — stores contact form submissions

.env.example              Copy to .env and fill in your Resend API key
```

## Current status

The site now ships with your real content:

- **Profile photo** — `frontend/images/profile.jpg` (your real headshot, already wired into the About,
  Home, and Contact pages).
- **Contact details** — WhatsApp/phone `+234 903 560 1704`, email `fasikunayomide3@gmail.com`,
  set in `frontend/js/components.js`.
- **Three live listings** in `backend/data/properties.json`, each with real photos in
  `frontend/images/properties/`:
  - **Oluyole Modern Market** — Ibadan (commercial shop units)
  - **Mowe Prime** — Ogun State (residential land)
  - **Bankole Estate, Magboro** — Ogun State (half plot)

Things still worth doing before launch:
- Add your Instagram/LinkedIn handles in `CONFIG` (currently placeholder URLs).
- Swap `calendlyUrl` for a real booking link once you have one.
- The homepage hero stats (₦2.4bn+, 180+ investors, etc.) and the four testimonials are
  illustrative placeholders — replace them with your real numbers and real client quotes
  before this goes live, since they're currently not accurate claims.
- Payment plan and documentation details on Oluyole Modern Market and Mowe Prime are written
  generically ("confirm during consultation") since the flyers didn't specify exact terms —
  tighten these once you have the developer's current terms in writing.

## Setting up email notifications

The contact form saves every lead to `backend/data/leads.json` regardless of email being
configured. But to actually get notified the moment someone submits the form, connect a free
[Resend](https://resend.com) account — no Google account settings, no 2-Step Verification, no
"less secure apps" issues to fight with.

### 1. Get a Resend API key

1. Go to [resend.com](https://resend.com) and sign up free (no card required) — use
   `fasikunayomide3@gmail.com` so the next step works without extra setup.
2. In the dashboard, go to **API Keys → Create API Key**. "Sending access" is enough.
3. Copy the key — Resend only shows it once.

### 2. Configure the project

```bash
cp .env.example .env
```

Open `.env` and fill in:
```
RESEND_API_KEY=re_your_key_here
NOTIFY_EMAIL=fasikunayomide3@gmail.com
```

Leave `RESEND_FROM_EMAIL` as `onboarding@resend.dev` for now — see the important note below.

### 3. Run it

```bash
node backend/server.js
```

On startup you'll see one of these:
```
[email] Configured — lead notifications will be sent to fasikunayomide3@gmail.com
```
or, if something's missing:
```
[email] Not configured — leads will still be saved, but no emails will be sent. See README.
```

### 4. Test it — and one important limitation to know about

Submit the contact form on the live site. Two emails are attempted:

- **The notification to you** works immediately, because Resend's shared test sender
  (`onboarding@resend.dev`) is allowed to deliver to the email address your Resend account was
  created with — which is `fasikunayomide3@gmail.com` if you followed step 1.
- **The auto-reply to the person who enquired** will fail (silently, from their point of view —
  it's only logged on your server) until you verify your own domain in Resend. Resend restricts
  the shared test sender to only deliver to your own account email, as an anti-abuse measure —
  it's not something this code can work around.

So: **owner notifications work today, out of the box.** The visitor auto-reply is a nice-to-have
you can switch on later:
1. Buy or use a domain you own (e.g. `fasikunayomide.com`).
2. In Resend, go to **Domains → Add Domain**, and add the DNS records it gives you at your domain
   registrar (usually takes minutes to show verified, sometimes up to a few hours).
3. Update `RESEND_FROM_EMAIL` in `.env` to an address on that domain, e.g.
   `hello@fasikunayomide.com`.

If an email fails to send for any reason, it's logged to the server console (e.g. `[email] Failed
to send auto-reply: ...`) but the form still shows success to the visitor and the lead is still
saved — a failed email should never make someone think their enquiry was lost.

**Note:** this was wired up against Resend's standard REST API using Node's built-in `https`
module — no libraries, nothing that can go out of date. I wasn't able to send a live test from the
environment I built this in (no internet access there), so please do one real test submission
after adding your API key to confirm the owner notification lands in your inbox.

## First things to edit before you launch

1. **`frontend/js/components.js`** — top of the file, `CONFIG` object:
   - `whatsappNumber` — your real WhatsApp number, digits only, country code first (e.g. `234801...`)
   - `phone`, `email`, `instagram`, `linkedin`
   - `calendlyUrl` — swap in a real booking link (Calendly, TidyCal, etc.) once you have one

2. **`backend/server.js`** — set a real `ADMIN_KEY` (used to protect the leads and property-write API):
   ```bash
   ADMIN_KEY=your-secret-key node backend/server.js
   ```

3. **`backend/data/properties.json`** — replace the sample properties with your real listings.
   Each property needs: `id` (used in the URL, must be unique, no spaces), `name`, `location`,
   `type`, `status`, `priceFrom`, `sizes`, `paymentPlan`, `documentation`, `heroImage`, `gallery`,
   `features`, `locationAdvantages`, `investmentPotential`, `inspection`, `summary`.

4. **`backend/data/testimonials.json`** — replace with real client testimonials once you have them.

5. **Property images** — the sample data uses stock photos from Unsplash so the site looks complete
   out of the box. Replace `heroImage` and `gallery` URLs with your own property photos (any hosted
   image URL works — Cloudinary, S3, Google Drive public link, etc.).

6. **Your professional photo** — already in place at `frontend/images/profile.jpg`, used on the
   About, Home and Contact pages. To update it later, just replace that file with a new image
   of the same name (or update the `src` in those three pages if you rename it).

   Choose a photo that looks approachable, not overly corporate — this is doing a lot of work to
   make the "trust and personal, not generic agency" positioning land.

## The API (used by the frontend, and usable directly)

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/api/properties` | List all properties | — |
| GET | `/api/properties/:id` | Get one property | — |
| POST | `/api/properties` | Add a property | `x-admin-key` header |
| DELETE | `/api/properties/:id` | Remove a property | `x-admin-key` header |
| GET | `/api/testimonials` | List testimonials | — |
| POST | `/api/leads` | Submit contact/consultation form (triggers notification + auto-reply emails) | — |
| GET | `/api/leads` | View captured leads | `x-admin-key` header |

Example — add a property from the command line:
```bash
curl -X POST http://localhost:3000/api/properties \
  -H "Content-Type: application/json" \
  -H "x-admin-key: your-secret-key" \
  -d '{ "id": "new-plot", "name": "...", ... }'
```

View captured leads:
```bash
curl -H "x-admin-key: your-secret-key" http://localhost:3000/api/leads
```

## Deploying

This runs anywhere Node.js runs — no build step, no database setup. Good options:

- **Render / Railway / Fly.io** — connect the repo, set the start command to
  `node backend/server.js`, and set these environment variables in the host's dashboard: `PORT`,
  `ADMIN_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NOTIFY_EMAIL`. (Don't upload your `.env`
  file to these platforms — use their environment variable settings instead; `.env` is for local
  development only.)
- **A basic VPS** — keep it alive with `pm2 start backend/server.js --name realtor-site`, put
  Nginx in front for HTTPS. A `.env` file next to `package.json` works fine here since it's your
  own server.

Note: `leads.json` and `properties.json` are plain files on disk. On platforms with an ephemeral
filesystem (some free tiers), data written after deploy (new leads, properties added via the API)
may not persist across restarts — properties.json and testimonials.json you edit before deploying
are fine since they ship with the code. If you outgrow this, swap the `readJSON`/`writeJSON`
helpers in `backend/server.js` for calls to a real database.

## Design system quick reference

Colors, type and spacing are all defined as CSS variables at the top of `frontend/css/style.css`
— change a value there and it updates across every page.

- Ink navy: `--ink` · Brass accent: `--brass` · Warm paper background: `--paper`
- Headline font: Fraunces (serif) · Body/UI font: Manrope (sans-serif)
