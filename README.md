# H. — Portfolio

> Websites, AI agents and automations, with open prices.
> Live at **[saintlife.dev](https://saintlife.dev)**

---

## Overview

A hand-coded portfolio site with no front-end framework and no build step. Every page is plain HTML, CSS and JavaScript, served as static files.

The site doubles as a working demo reel. Each project has a case page with an animated, scripted demo, and a separate live build that runs the real thing.

---

## Project Structure

```
H1M/
├── index.html                          # Home: hero, what I do, links to Services and About
├── 404.html                            # Not-found page (served automatically by the host)
├── privacy.html / terms.html           # Legal pages
├── about/index.html                    # About + how I work (four steps), FAQ
├── services/index.html                 # Services: price modals, request checkout, plans, why the price, FAQ
├── services/<service>/index.html       # Detail pages: websites, ai-agents, automation
├── contact/index.html                  # Contact: enquiry form, email/WhatsApp, phone CTA
├── serve.mjs                           # Local static server (Node.js, no dependencies)
├── robots.txt, sitemap.xml, llms.txt   # Crawler rules, sitemap, LLM-readable overview
├── favicon.svg / .ico, apple-touch-icon.png, icon-192/512.png, site.webmanifest
│
├── css/
│   ├── main.css                        # Tokens, layout, components, glass panels, footer, modals, both themes
│   ├── portfolio.css                   # Portfolio + project pages: hero card, illustration, neumorphic buttons
│   └── showcase.css                    # Project case pages: scripted demo frames
│
├── js/
│   ├── main.js                         # Theme, nav, reveals, contact form, particles, text disperse
│   ├── sky.js                          # WebGL backdrop for every page: clouds (light) / shooting stars (dark)
│   ├── portfolio.js                    # Portfolio page: scroll progress, illustration reduced-motion
│   ├── services.js                     # Services price modals, request checkout (Formspree + WhatsApp)
│   ├── whatsapp.js                     # Floating WhatsApp button
│   └── showcase.js                     # Scripted demos on the project case pages
│
├── portfolio/
│   ├── index.html                      # Portfolio: marquee, hero card, project buttons, who I am
│   └── <project>/index.html            # Case page per project: write-up, running demo, back + prev/next
│                                       #   drape, ember-oak, email-support,
│                                       #   competitor-analysis, daily-briefing, email-autoresponder,
│                                       #   whatsapp-mpesa
│
├── shop/                               # Live build: DRAPE clothing store
├── websites/restaurant/                # Live build: Ember & Oak restaurant site
├── agents/email-support/               # Live build: Email Support Agent
├── agents/competitor-analysis/         # Live build: Competitor Analysis Agent
├── workflows/daily-briefing/           # Live build: Daily Briefing pipeline
├── workflows/email-autoresponder/      # Live build: Email Autoresponder pipeline
│
├── tools/
│   ├── email_watcher.py                # Gmail inbox watcher (Python)
│   └── email_responder.py              # LLM reply generator (Python)
│
├── docs/image-credits.md               # Photo (Pexels) and illustration (unDraw) credits
│
└── images/                             # WebP photos; art/ illustrations, menu/ dish photos, og/ share images
```

---

## Pages

### Home (`index.html`)
- **Hero** over the site backdrop, with "View Projects" and "Get in Touch"
- **What I do**: six plain-language cards
- **More**: cards linking to Services and About

### Services (`services/`)
- Four categories (websites, AI agents, automations, website add-ons); each opens a price modal
- **Choose** on any option opens a request form (Formspree) with a WhatsApp alternative
- Management plans, a worked example, why prices differ, and a pricing FAQ

### About (`about/`)
- Who I am, the four steps every project follows, and an FAQ

### Contact (`contact/`)
- **Enquiry form** (Formspree), email and WhatsApp links, click-to-burst particles
- **Phone CTA**: text-disperse hover on the phone number

### Portfolio (`portfolio/`)
- Marquee strip, then a hero card with an animated line illustration of the work
- Project buttons, each opening its case page
- **Who I am** (personal section)

### Project case pages (`portfolio/<project>/`)
Write-up, step list and a scripted demo that plays while on screen, plus a link to the live build, a back button and previous/next navigation.

---

## Tech Stack

- **HTML / CSS / JavaScript**: no framework, no bundler. The shop and restaurant builds use Tailwind via its CDN.
- **Google Fonts**: DM Serif Display (headings) and Inter (body)
- **Theming**: `data-theme="light"` on `<html>` switches every token; an inline `<head>` script applies the saved theme before first paint
- **WebGL2**: two fragment shaders in `sky.js`, fixed behind every page
- **Canvas 2D**: contact-section particle bursts
- **IntersectionObserver**: scroll reveals and demo playback
- **Formspree**: delivers the contact form (`contact/index.html`) and service requests (`services/index.html`)
- **Vercel Web Analytics**: cookie-free page-view counts; skipped on localhost

---

## Running Locally

**Requirements:** Node.js 18+

```bash
node serve.mjs
```

Then open [http://localhost:3000](http://localhost:3000). No install step. The server handles WebP, paths with spaces and the 404 page, the same way the host does.

---

## Email Automation Tools (Python)

**Requirements:**
```bash
pip install anthropic python-dotenv google-auth google-auth-oauthlib google-api-python-client
```

**Setup:**
1. Enable the Gmail API at [console.cloud.google.com](https://console.cloud.google.com)
2. Download OAuth credentials as `credentials.json` and place it in the project root
3. Add your Anthropic API key to `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
4. Create `support_docs.txt` in the project root with your support documentation
5. Run:
   ```bash
   python tools/email_watcher.py
   ```

On first run a browser window opens for Gmail OAuth. After that, `token.json` handles re-authentication automatically. The poll interval defaults to 30 seconds.

---

## Implementation Notes

**Backdrop (`sky.js`)**: light mode renders domain-warped fBm cumulus in two parallax layers; dark mode renders streaking light trails over an amber nebula. Both run at reduced resolution and 30fps, redraw immediately on scroll, and keep their clock and scroll offset in `sessionStorage` so the sky continues across pages. A low-power mode shows a still frame for reduced motion, Data Saver or a low battery, and steps resolution down, then freezes, on devices that can't keep up. It waits out a 4-second warm-up first.

**Glass panels**: one shared rule in `main.css` makes every section a translucent, blurred panel; each theme sets only the tints. Cards inside are denser tiles, so text stays readable over the backdrop.

**Particle canvas**: click the contact page (outside the form) to burst amber particles with velocity, gravity, drag and sine drift.

**Text disperse**: the phone number's characters scatter to precomputed offsets on hover and snap back on leave.

---

## Deployment

**Live URL:** [https://saintlife.dev](https://saintlife.dev)

---

## Contact

**Jonathan Kariuki**
[saintlife54@gmail.com](mailto:saintlife54@gmail.com)
