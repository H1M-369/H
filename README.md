# H. — Portfolio

> Front ends that load fast. LLM agents that run unattended.
> Live at **[saintlife.dev](https://saintlife.dev)**

---

## Overview

A hand-coded portfolio site with no front-end framework and no build step. Every page is plain HTML, CSS and JavaScript, served as static files.

The site doubles as a working demo reel. Each project has a case page with an animated, scripted demo, and a separate live build that runs the real thing.

---

## Project Structure

```
H1M/
├── index.html                          # Home: hero, about, capabilities, projects, process, contact
├── 404.html                            # Not-found page (served automatically by the host)
├── privacy.html / terms.html           # Legal pages
├── serve.mjs                           # Local static server (Node.js, no dependencies)
├── robots.txt, sitemap.xml, llms.txt   # Crawler rules, sitemap, LLM-readable overview
├── favicon.svg / .ico, apple-touch-icon.png, icon-192/512.png, site.webmanifest
│
├── css/
│   ├── main.css                        # Tokens, layout, components, glass panels, both themes
│   ├── portfolio.css                   # Portfolio + project pages: hero card, illustration, neumorphic buttons
│   └── showcase.css                    # Project case pages: scripted demo frames
│
├── js/
│   ├── main.js                         # Theme, nav, reveals, contact form, particles, text disperse
│   ├── sky.js                          # WebGL backdrop for every page: clouds (light) / shooting stars (dark)
│   ├── portfolio.js                    # Portfolio page: scroll progress, illustration reduced-motion
│   └── showcase.js                     # Scripted demos on the project case pages
│
├── portfolio/
│   ├── index.html                      # Portfolio: marquee, hero card, project buttons, who I am, contact
│   └── <project>/index.html            # Case page per project: write-up, running demo, back + prev/next
│                                       #   drape, ember-oak, email-support,
│                                       #   competitor-analysis, daily-briefing, email-autoresponder
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
└── images/                             # WebP thumbnails and product photos; og/ holds share images
```

---

## Pages

### Home (`index.html`)
- **Hero** over the site backdrop
- **About** (personal section)
- **Capabilities**: six cards covering front-end builds, refactors, LLM agents, pipelines, interface systems and LLM integration
- **Projects**: six cards linking to the project case pages
- **Process**: four steps, from defining the output to shipping and instrumenting
- **Contact**: Formspree enquiry form, email and WhatsApp links, click-to-burst particles
- **Phone CTA**: text-disperse hover on the phone number

### Portfolio (`portfolio/`)
- Marquee strip, then a hero card with an animated line illustration of the work
- Six neumorphic project buttons, each opening its case page
- **Who I am** (personal section), then contact

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
- **Formspree**: contact form delivery (set the form ID in `index.html` and `portfolio/index.html`)

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

**Particle canvas**: click the contact section (outside the form) to burst amber particles with velocity, gravity, drag and sine drift.

**Text disperse**: the phone number's characters scatter to precomputed offsets on hover and snap back on leave.

---

## Deployment

**Live URL:** [https://saintlife.dev](https://saintlife.dev)

---

## Contact

**Jonathan Kariuki**
[saintlife54@gmail.com](mailto:saintlife54@gmail.com)
