# H. — Portfolio

> Personal portfolio for a web developer and AI agent builder.  
> Live at **[saintlife.dev](https://saintlife.dev)**

---

## Overview

This is a fully hand-coded portfolio site built without any frontend framework or build pipeline. Every page is plain HTML, CSS, and vanilla JavaScript. The goal was to prove that thoughtful design and production-quality animation don't need React, Vite, or npm — just a sharp eye and a good text editor.

The site doubles as a working demo reel: each project card links to a real, functioning demo of the thing it describes.

---

## Project Structure

```
H1M/
├── index.html                          # Main portfolio landing page
├── terms.html                          # Terms of Use
├── serve.mjs                           # Local static file server (Node.js)
├── robots.txt                          # Search engine crawler rules
├── llms.txt                            # LLM-readable site overview
│
├── css/
│   └── main.css                        # All styles, tokens, keyframes, responsive
│
├── js/
│   └── main.js                         # All JS: theme, nav, WebGL shader, animations
│
├── agents/
│   ├── email-support/index.html        # Email Support Agent demo
│   └── competitor-analysis/index.html  # Competitor Analysis Agent demo
│
├── websites/
│   └── restaurant/index.html           # Ember & Oak — restaurant site demo
│
├── workflows/
│   ├── daily-briefing/index.html       # Daily Briefing Pipeline demo
│   └── email-autoresponder/index.html  # Email Autoresponder Pipeline demo
│
├── shop/
│   └── index.html                      # DRAPE — clothing store demo
│
├── tools/
│   ├── email_watcher.py                # Gmail inbox watcher (Python)
│   └── email_responder.py              # Claude-powered reply generator (Python)
│
└── images/                             # Project thumbnails + shop product photos
```

---

## Pages & Demos

### Landing Page (`index.html`)
The main portfolio. Sections:

- **Hero** — WebGL2 star/nebula shader background (dark mode only)
- **About** — Background and approach
- **Skills** — Six skill cards: Website Creation, Site Upgrades, Custom AI Agents, Agent Workflows, Frontend Design, AI Integration
- **Projects** — Six project cards linking to live demos
- **Process** — Four-step working methodology
- **Get in Touch** — Contact links + click-to-burst dot particle canvas
- **Phone CTA** — Text-disperse hover animation on the phone number
- **Footer** — Social links (Email, Twitter, WhatsApp, GitHub) + Terms of Use

### Agent Demos
| Page | What it shows |
|---|---|
| `agents/email-support` | AI agent that reads your support docs and auto-replies to customer emails |
| `agents/competitor-analysis` | Agent that analyses any business and surfaces competitive intelligence |

### Website Demos
| Page | What it shows |
|---|---|
| `websites/restaurant` | **Ember & Oak** — premium restaurant site with menu, reservations, and ambiance-first design |

### Workflow Demos
| Page | What it shows |
|---|---|
| `workflows/daily-briefing` | Pipeline that compiles a personalised daily briefing (news, weather, tasks) |
| `workflows/email-autoresponder` | End-to-end email automation: watch inbox → draft reply → send |

### Shop Demo (`shop/`)
**DRAPE** — A minimal clothing store with product cards, color/size variants, and a live cart.

---

## Tech Stack

### Frontend
- **HTML5 / CSS3 / Vanilla JS** — no framework, no bundler
- **Google Fonts** — DM Serif Display (headings) + Inter (body)
- **CSS custom properties** — full dark/light theme via `[data-theme="light"]` on `<html>`
- **WebGL2** — GLSL fragment shader for the hero nebula (dark mode only)
- **Canvas 2D** — dot particle burst on the contact section (click-interactive)
- **Intersection Observer** — scroll-triggered entrance animations

### Design tokens
| Token | Dark | Light |
|---|---|---|
| `--bg` | `#09090C` | `#FAF7F0` |
| `--surface` | `#0F0F14` | `#F2EDE3` |
| `--amber-l` | `#DFB520` | `#D4A017` |
| `--text` | `#E8E4DC` | `#1C1710` |
| `--muted` | `#6A7080` | `#8A7E6A` |

### Backend / Tooling
- **`serve.mjs`** — Lightweight Node.js HTTP server. No dependencies. Handles MIME types and directory index resolution on port 3000.
- **`tools/email_watcher.py`** — Polls Gmail via OAuth2 for unread emails, triggers the responder, marks emails read after reply.
- **`tools/email_responder.py`** — Calls the Claude API (`claude-sonnet-4-6`) with the incoming email and a support documentation file. Returns a grounded reply — never invents information outside the docs.

---

## Running Locally

**Requirements:** Node.js 18+

```bash
node serve.mjs
```

Then open [http://localhost:3000](http://localhost:3000). No install step. No `node_modules`.

---

## Email Automation Tools (Python)

**Requirements:**
```bash
pip install anthropic python-dotenv google-auth google-auth-oauthlib google-api-python-client
```

**Setup:**
1. Enable the Gmail API at [console.cloud.google.com](https://console.cloud.google.com)
2. Download OAuth credentials as `credentials.json` → place in project root
3. Add your Anthropic API key to `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
4. Create `support_docs.txt` in the project root with your support documentation
5. Run:
   ```bash
   python tools/email_watcher.py
   ```

On first run a browser window opens for Gmail OAuth. After that, `token.json` handles re-authentication automatically. Poll interval defaults to 30 seconds.

---

## Notable Implementation Details

**WebGL Hero Shader** — A real-time GLSL fragment shader using layered fractal Brownian motion (fBm) to generate a nebula/star-field. A `MutationObserver` watches `data-theme` on `<html>` — starts and stops the render loop on theme switch, fades opacity with a CSS transition.

**Theme System** — One `data-theme="light"` attribute on `<html>` flips the entire palette via CSS custom properties. A one-liner inline script in `<head>` reads `localStorage` before first paint to prevent flash.

**Dot Particle Canvas** — Click anywhere in the contact section to burst 33–48 amber particles. Each has velocity, gravity (`vy += 0.02`), air resistance (`* 0.995`), and organic sine drift. Particles fade over 2–6 seconds.

**Text Disperse** — The phone number characters scatter to pre-calculated `translate + rotate` offsets on `mouseenter`, snap back on `mouseleave`.

---

## Deployment

**Live URL:** [https://saintlife.dev](https://saintlife.dev)

---

## Contact

**Jonathan Kariuki**  
[saintlife54@gmail.com](mailto:saintlife54@gmail.com)  
[github.com/H1M-369](https://github.com/H1M-369)
