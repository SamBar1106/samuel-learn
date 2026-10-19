# Samuel Barrios learning list

Una lista personal de estudio, en inglés sencillo, sacada de cómo trabajas de verdad.

This is one document in three parts: how you use AIs, the words those projects already use, and a grouped study list. Each heading has a one-line Spanish gloss. Each study item says, in one line, why it matters to you.

Names below are project, bot, and tool names. Client names, identifiers, and amounts stay out of this note.

The Division One picture comes from the public floor plan in `org-dashboard`, which the private `division-one-bots` repo publishes. The ERP stack, the Claude lane, and the teammate bots are the setup you run on private `sam-erp`. The rest is from the public repos: `samuel-learn`, `takeod-site`, `daykodee-home`, `gold-elite-landing`, and `mge-triage-hub`.

## How you use AIs

Cómo usas las IAs entre tus proyectos.

A coordinator hands work to specialist bots, and three coding lanes write the code.

**ED** is the coordinator. On the public floor plan he is the Executive assistant in Division 7: a Grok assistant that triggers routines. The other divisions report to that hub (daily report, weekly summary, Monday brief, ready-to-close list, build status). Your teammate bots sit beside that org chart:

- **Web Dev** builds websites.
- **Tax I/C** handles tax work.
- **Financial Assistant / Claims Hunter** handles money questions and claims.
- **MGE Assistant** works the MGE triage hub.
- **Professor** teaches and explains.

The scheduled org in `division-one-bots` (published to `org-dashboard`) is seven divisions plus a Shared Tools Lab:

| Division | What it is for |
| --- | --- |
| 1 Bot Development | Builds and maintains every bot |
| 2 Sales | Tax-prep lead intake and client profiles |
| 3 Treasury | Income, expenses, and budget, read-only |
| 4 Production | Tax prep and website building |
| 5 Quality Control | Complaints, refund checks, Odoo tickets |
| 6 Brand & Marketing | Content, research, stories, referrals |
| 7 Executive (hub) | Tracks all divisions, strategy, Monday brief |
| Shared Tools Lab | Libraries every bot reuses |

Production owns **Tax Expert**, **Bookkeeper Expert**, **Tax Engine**, and the **refund workflow**. Shared tools include a **doc parser** (statements, stubs, W-2s), **client doc intake**, and a **P&L builder**. QC is the one daily job on the board (4:54 AM America/Chicago, through `scripts/run_bot.sh`). Most other bots stay idle until a schedule is approved. Live vs locked comes from `shared/running.py`. The approval gate is its own row in the side panel. Heartbeats go out through `shared/heartbeat.py`. The public page only draws bot names, states, generic step names, small counts, timestamps, and exit codes.

### Three coding lanes

Tres carriles distintos escriben el código.

1. **Claude lane.** On `sam-erp`, the GitHub workflow `claude-ed-lane.yml` runs **CLAUDE-###** tickets. That is the Anthropic lane.
2. **Cursor cloud agents.** They open a branch, edit the repo, and leave a pull request for you to merge. `samuel-learn` was scaffolded that way (`cursor/bilingual-scaffold-dee1`).
3. **Antigravity.** On `mge-triage-hub`, a failing scraper makes GitHub Actions write `ANTIGRAVITY_ALERT.md`. `AGENTS.md` tells the agent to read that file first. The org dashboard stores Antigravity run stats (`agy_usage`: input, output, thinking, cached tokens). Task write-ups live in `docs/ANTIGRAVITY-TASK-###.md`.

The public ticket shape, in `mge-triage-hub`, is the same idea as the Claude lane: a markdown ticket in `.ed/inbox/` (`TASK-###`), a result in `.ed/outbox/`, a branch such as `ed/TASK-008`, a file allow-list, and a rule that the agent does not merge.

### Connectors

Los enchufes que un agente puede llamar.

Your MCP connectors are **Gmail**, **Google Drive**, **Calendar**, **GitHub**, **Finance (Plaid)**, **X**, and **Blender MCP** (planned). MCP is the deep dive in the study list below. It is the plug. ED and the lane are still the boss.

### Projects and what each one is made of

Qué es cada repo y con qué está hecho.

- **`sam-erp`** is the business app: FastAPI and Jinja templates on SQLite, Google OIDC sign-in, a DigitalOcean server reached through Tailscale (Serve / Funnel). A React rebuild is in progress. The repo layout you work in is `hub/`, `app/`, `frontend/`, `.ed/inbox`, `.github/workflows`, and `.claude/skills`.
- **`division-one-bots`** is the private bot org. Python helpers (`shared/heartbeat.py`, `shared/running.py`, `scripts/run_bot.sh`) publish the public floor plan.
- **`samuel-learn`** is your bilingual study site: React 19, Vite, React Router, i18next, GSAP, Lenis, Framer Motion. Copy lives in `src/i18n/es.json` and `src/i18n/en.json`. Data is local JSON, with a Supabase adapter that is still a stub. GitHub Pages serves it at `/samuel-learn/`.
- **`takeod-site`** is the Daykodee / TakeOD React rebuild: Vite, React Router, GSAP, Lenis, and the Wix Headless SDK (`@wix/sdk`, `@wix/stores`, `@wix/ecom`, `@wix/redirects`) with `OAuthStrategy`. An empty `SPLINE_SCENE_URL` reserves a future Spline scene. The Ponytail skill is in `.claude/skills/ponytail`.
- **`daykodee-home`** is the effects homepage those pages grow from. It is plain JavaScript, Vite, GSAP, Lenis, and Three.js. Product models are `bottle.glb`, `cap.glb`, and `backpack.glb`. It is built to embed in Wix.
- **`gold-elite-landing`** is a React + TypeScript landing page: Lenis, the Motion library, an Embla carousel, a dark CSS-variable palette, and GitHub Pages.
- **`mge-triage-hub`** is a static GitHub Pages dashboard. A Chrome extension (Manifest V3) scrapes NetSuite, encrypts CSVs in the browser (AES-GCM-256), and pushes them with the GitHub Contents API. Firebase holds a do-not-call list. A future headless port is specified as Python + Playwright on a small Google Cloud VM.
- **`org-dashboard`** is one HTML/CSS/JS page with no build step. It reads `data/org.json`, sanitizes live events, and listens with `EventSource`.

### Habits that already show up in the code

Costumbres que ya están en el código.

- **Ponytail** (`.claude/skills/ponytail` in `samuel-learn` and `takeod-site`): the smallest change that fully solves the task.
- **agent-trace.dev**: cost and traces for agent runs.
- **Supabase**: selected in `samuel-learn` only when both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set. Today the stub still reads local JSON.
- **GitHub Pages** for the public sites, with a copied `404.html` so a client-side router survives a refresh.
- **Gemini M3 dark design tokens** for dark UI color roles. The public dark page (`gold-elite-landing`) still uses its own variables (`--bg`, `--surface`, `--text`).
- **Privacy as a code rule.** `org-dashboard/sanitize.js` drops events that look like a phone, an email, an SSN, or money. `mge-triage-hub` refuses plaintext CSVs, saved NetSuite pages, tokens, and passphrases. Tickets repeat the same rule.

## Terms and keywords

Términos y palabras clave de tu uso real, con los nombres exactos de los proyectos.

### People, bots, and lanes

ED, Web Dev, Tax I/C, Financial Assistant, Claims Hunter, MGE Assistant, Professor, Tax Expert, Bookkeeper Expert, Tax Engine, refund workflow, doc parser, P&L builder, QC bot, Executive brief bot, Bot Dev bot, Sales bot, Treasury bot, Production bot, Brand bot. Claude lane, `claude-ed-lane.yml`, `CLAUDE-###`, Cursor cloud agents, Antigravity, `ANTIGRAVITY_ALERT.md`, `agy_usage`, `.ed/inbox`, `.ed/outbox`, `AGENTS.md`, Ponytail.

### `sam-erp`

FastAPI, Jinja, SQLite, Google OIDC, DigitalOcean, Tailscale Serve, Tailscale Funnel, `hub/`, `app/`, `frontend/`, React rebuild.

### `samuel-learn`

React 19, Vite, `react-router-dom`, `BrowserRouter`, `basename`, i18next, `react-i18next`, `es.json`, `en.json`, `localStorage` key `samuel-learn-lang`, Framer Motion, `AnimatePresence`, GSAP ticker, Lenis, `prefers-reduced-motion`, Supabase adapter, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `content.json`, oxlint, Playwright screenshots, GitHub Pages, `404.html`, `.nojekyll`.

### `takeod-site` and `daykodee-home`

Wix Headless, `OAuthStrategy`, `wixSession`, `@wix/ecom`, `@wix/redirects`, `createRedirectSession`, demo mode, `products.json`, Spline, `@splinetool/viewer`, `SPLINE_SCENE_URL`, `.spline-slot`, Three.js, `GLTFLoader`, `MeshoptDecoder`, `DecalGeometry`, `WebGLRenderer`, `PerspectiveCamera`, `AmbientLight`, `DirectionalLight`, `MeshBasicMaterial`, `TextureLoader`, glTF, `.glb`, `logo-decal.png`, sRGB, anisotropy, Raycaster, Box3, `powerPreference`, `webglcontextlost`, `readPixels`, IntersectionObserver, GSAP, ScrollTrigger, SplitText, `gsap.matchMedia`, Lenis, `gsap.ticker`, `lagSmoothing`, embed, `prefers-reduced-motion`, `pointer: coarse`.

### `gold-elite-landing`

TypeScript, TSX, Motion, Embla, Lenis, CSS custom properties, `backdrop-filter`, `perspective`, `rotateX`, `translateZ`, `color-scheme` habits from the other sites, `100svh`, `safe-area-inset`, oxlint, GitHub Pages.

### `mge-triage-hub` and `org-dashboard`

Chrome extension, Manifest V3, `chrome.storage.local`, GitHub Contents API, fine-grained token, AES-GCM-256, PBKDF2-HMAC-SHA256, AAD, gzip, Web Crypto, Firebase Realtime Database, Playwright, Python, Google Cloud e2-micro, systemd, NetSuite, SuiteTalk, TBA, OAuth, SuiteQL, RESTlet, `workflow_dispatch`, cron, `issues: write`, ntfy, `EventSource`, SSE, sanitize whitelist, `schedule approval`, `use approval`, `tax-expert.yaml`, `bookkeeper-expert.yaml`, Odoo read, Odoo write.

### MCP connectors

Gmail, Google Drive, Calendar, GitHub, Finance, Plaid, X, Blender MCP.

## Learning list

Lista de estudio ampliada. Cada entrada dice en una línea por qué te importa.

Start with MCP. Then study the lane you are about to open (Claude, Cursor, or Antigravity) and the language of that repo.

### MCP

El protocolo que conecta un agente con herramientas externas. Empieza aquí.

**What it is.** MCP (Model Context Protocol) is a standard way for an AI app to talk to a tool server. The app is the client (Cursor, Claude, another host). The server offers tools. The model asks the host to call a tool, the host runs it, and the result comes back as data the model can read. Under the hood the messages are JSON-RPC: the client asks `tools/list`, then `tools/call` with a name and arguments. Servers can also expose resources (files or records to read) and prompt templates. A local server often speaks over stdio. A remote server speaks HTTP. One server works for every MCP host.

**Why it matters for agents.** ED can stay the coordinator and still reach Gmail or the calendar, because the connector is a server the host can call. Financial Assistant / Claims Hunter can be allowed Finance (Plaid). Web Dev stays off that connector. The permission lives on the connection, which is the right place for it.

**Why it matters for skills.** A skill (Ponytail in `.claude/skills/ponytail`) is text the model reads before it edits. An MCP server is a live tool it can call. The skill tells the agent to keep the change small. The GitHub server lets it open the repo. Use both on the same turn when the edit needs a rule and a live tool.

**How it relates to tool use and orchestration.** Tool use is the model's loop: look at the tool list, emit a call, wait, continue. Function calling is that loop in the model's API. MCP is the shared plug so the same Gmail tool works in Cursor and in the Claude lane. Orchestration is who may call what, and in what order. ED, the ticket (`.ed/inbox` or `CLAUDE-###`), and the lane decide the order. MCP only carries the call. A handoff on the org chart (QC to ED, "daily report") is orchestration. An MCP call during that run is tool use.

**Your servers.** Gmail, Google Drive, Calendar, GitHub, Finance (Plaid), X, and Blender MCP (planned). Treat mail, drive, calendar, and finance as private. Public repos (`samuel-learn`, `takeod-site`, `daykodee-home`, `gold-elite-landing`, `org-dashboard`, `mge-triage-hub`) must never receive client rows from those tools.

**Practical next steps.**

1. Before a Cursor cloud agent starts, confirm the MCP servers you expect are connected. A missing login fails the tool call. The agent should stop and say so.
2. Give Finance (Plaid) to Financial Assistant / Claims Hunter and to Treasury thinking. Leave it off Web Dev, Professor, and every public website repo.
3. Give Gmail and Calendar to ED and to lanes that already send mail the way `mge-triage-hub` does (the scraper workflow emails on failure). Leave Gmail off site-building agents.
4. Use the GitHub connector to read pull requests, workflow runs, and ticket files. Match the ticket habit you already have: one markdown ticket, one branch, a human merges. `mge-triage-hub` uses `ed/TASK-###`. `sam-erp` uses `CLAUDE-###` through `claude-ed-lane.yml`.
5. Practice on `samuel-learn`: one read-only turn that looks at the repo and one Drive or Calendar search. Write nothing until you have seen the tool result.
6. Leave Blender MCP planned until the 3D page needs it. Until then, models stay in `daykodee-home/public/models` and the Spline slot in `takeod-site` stays empty (`SPLINE_SCENE_URL`).
7. After a run, open agent-trace.dev and check which tools fired and what they cost. The org dashboard already keeps a small Antigravity version of that (`agy_usage`).

### Anthropic

La empresa de Claude, que es tu carril de GitHub para los tickets CLAUDE-###.

- **Anthropic.** The lab that makes Claude. Your Claude lane is this vendor, on purpose, separate from Cursor and from Antigravity.
- **Claude.** The model family that workflow runs. When a `CLAUDE-###` ticket moves, this is the model reading `sam-erp`.
- **`claude-ed-lane.yml`.** The GitHub Actions workflow that picks up those tickets. Learn what triggers it, which secrets it needs, and that it should push a branch and leave the merge to you.
- **Messages API.** Anthropic's HTTP API: you send a list of messages and get the next message. Tool use is a stop in that same list.
- **Tool use.** Claude's function-calling format. MCP is how a host turns those tool calls into Gmail, Drive, or GitHub.
- **Skills.** Folders of instructions, such as `.claude/skills/ponytail`. Claude Code and compatible hosts load them so the model follows a standing rule.
- **System prompt.** The standing instructions above the ticket. `AGENTS.md` in `mge-triage-hub` is that file for every coding agent that opens the repo.
- **Prompt caching.** Reuse of a repeated prompt prefix so a long `AGENTS.md` or skill is not rebilled in full on every turn. The org dashboard already counts cached tokens on Antigravity runs. Claude has the same idea.
- **Extended thinking.** A hidden reasoning pass before the answer. Useful on a tax or architecture ticket. Useless on a one-line CSS change. Ponytail would skip it there.

### React

La biblioteca de interfaz de samuel-learn, takeod-site y gold-elite-landing, y la reconstrucción de sam-erp.

`samuel-learn` is React 19 and Vite. `takeod-site` is the same pair, plus React Router and the Wix SDK. `gold-elite-landing` is React and TypeScript. `sam-erp/frontend` is the React rebuild of the Jinja app. `daykodee-home` is Vite and plain JavaScript, which is why its Three.js scene lives outside React.

- **Component.** A function that returns UI. `PageFade`, `LanguageSwitch`, and `Home` in `samuel-learn` are components. One component, one job.
- **JSX.** HTML-shaped syntax inside JavaScript. It compiles to function calls. Write `className` where HTML has `class`.
- **Props.** Inputs a parent passes in. They are how `Home` stays free of router details.
- **State.** Data that, when it changes, redraws the component. `Home` keeps the loaded page in `useState`.
- **`useEffect`.** Run something after render: load `data.getPage('home')`, set `document.title`. Always cancel it if the component goes away. `Home` does that with an `active` flag.
- **`useRef`.** A box that survives re-renders without causing one. `takeod-site` keeps the Lenis instance in a ref so scroll handlers see the latest object.
- **React Router.** Client-side pages. `BrowserRouter` in `samuel-learn` uses `basename` from Vite's `BASE_URL` so `/samuel-learn/` works on GitHub Pages. A copied `404.html` lets a direct link load the app.
- **i18next and `react-i18next`.** Your Spanish/English layer. `useTranslation` gives `t`. `i18n.changeLanguage` switches. `npm run i18n:check` fails the build if a key exists in only one language.
- **Framer Motion.** The page fade in `samuel-learn` (`AnimatePresence`, `motion.div`). It is turned off when `prefers-reduced-motion` is set.
- **Motion and Embla.** `gold-elite-landing` uses the Motion package for section movement and Embla for the "what we buy" carousel. Same idea as Framer Motion, different library. Use one motion library per repo.
- **Vite.** The dev server and bundler. `import.meta.env.VITE_*` is how public config gets into the browser. Anything with that prefix is visible in the built site. Keep secrets on the server or in GitHub Actions secrets. In `takeod-site` the only Wix credential in the client is the public client id.
- **Adapter.** `src/lib/data.js` picks a local JSON adapter or a Supabase adapter. The React page calls `data.getPage` and does not care which one answered. That is the pattern to copy when `sam-erp/frontend` starts reading the FastAPI app.

### CSS, and how it fits with React

El lenguaje de estilo, y cómo se junta con React en tus sitios.

React decides which elements exist. CSS decides how they look. In your repos those are separate files: `src/index.css` in `samuel-learn`, `src/styles.css` plus `src/effects.css` in `takeod-site`, `src/index.css` in `gold-elite-landing` and `daykodee-home`. A component sets `className`. The stylesheet defines the class. Those global stylesheets hold the look. Framer Motion animates a few inline styles on top. Keep the palette in CSS.

**How a change should go.** Add a class in the component, add the rule in the global sheet, and put shared colors on `:root` as custom properties. `takeod-site` does this with `--navy`, `--cream`, `--royal`, `--gold`. `gold-elite-landing` does it with `--bg`, `--surface`, `--text`, `--green`. Gemini M3 dark tokens are the named roles (surface, on-surface, primary, outline) to grow those variables from, so a dark ERP screen and a dark landing page use the same roles even when the hex values differ.

Keywords you already use, and why the next one is worth knowing:

- **Custom properties** (`--navy`, `var(--gold)`). One place to change a brand color.
- **Cascade and specificity.** Later rules win, and a more specific selector beats a class. Your sheets stay easy because they are mostly single classes.
- **Box model and `box-sizing: border-box`.** Width includes padding. Every site of yours sets this on `*` first.
- **`display: flex` and `display: grid`.** Row and column layout. `samuel-learn` centers the page with `place-items: center`.
- **`position`, `z-index`, `inset`.** Fixed language switch, fixed marble background, skip link. The skip link in `takeod-site` is the accessibility version of a fixed control.
- **Media queries.** `@media (min-width: 768px)` and `@media (max-width: 767px)`. `gold-elite-landing` moves Call and Text into a bottom bar under 1024px.
- **`clamp()`.** Fluid type. The `samuel-learn` title uses `clamp(1.25rem, 2.4vw, 1.75rem)`.
- **`100vh` and `100svh`.** Viewport height. `svh` stays correct when a mobile browser shows or hides its address bar. Gold Elite uses `100svh`.
- **`env(safe-area-inset-*)`.** Keeps controls off the notch and the home indicator. Your language switch and Gold Elite's bottom bar both use it.
- **`prefers-reduced-motion`.** A media query you already honor in `samuel-learn`, `takeod-site`, `daykodee-home`, and `gold-elite-landing`. Motion, Lenis, and autoplay video turn off. Learn this before you learn a new animation library.
- **`:focus-visible`.** Keyboard focus ring. `takeod-site` draws a gold outline for keyboard focus.
- **`color-scheme`.** Tells the browser the page is light or dark so form controls and scrollbars match. `samuel-learn` sets `light`.
- **`object-fit: cover`.** Video and images fill a frame without stretching. Daykodee category cards use it.
- **`backdrop-filter`, `perspective`, `rotateX`, `translateZ`.** The frosted plates on `gold-elite-landing`. CSS can fake a little depth before you open a 3D canvas.
- **`@fontsource` packages.** Montserrat, Open Sans, Plus Jakarta Sans, Inter. Self-hosted fonts, no runtime call to a font CDN.
- **`cubic-bezier` and named GSAP eases** (`power2.out`, `back.out`). CSS eases the small transitions. GSAP eases the scroll stories. Pick one owner per animation.

### Languages you actually use

Cada lenguaje que sí aparece en tu trabajo, en una frase.

- **HTML.** The document the browser parses. Your Vite apps keep a small `index.html` and let React fill `#root`. `org-dashboard` and `mge-triage-hub` are HTML pages with a script.
- **CSS.** The style language above.
- **JavaScript.** The language of `samuel-learn`, `takeod-site`, `daykodee-home`, `org-dashboard`, and `mge-triage-hub`. Browsers and Node both run it.
- **JSX.** JavaScript with UI syntax, in `.jsx` files.
- **TypeScript.** JavaScript plus declared types, in `.ts` and `.tsx`. `gold-elite-landing` builds with `tsc -b` before Vite. Types catch a wrong prop before the page loads.
- **TSX.** JSX written in a TypeScript file. Gold Elite components such as `Hero.tsx` are TSX.
- **JSON.** Data as text: `content.json`, `org.json`, `products.json`, `package.json`, i18n files. If the shape is wrong, the page or the sanitizer should fail on purpose.
- **Python.** The language of `division-one-bots` (`shared/heartbeat.py`, `shared/running.py`) and of `sam-erp` (FastAPI). The future MGE scraper is specified as Python 3.11 with Playwright.
- **SQL and SQLite.** The database language, and the file database `sam-erp` uses. One file, no separate server. You write tables, queries, and transactions.
- **YAML.** The config language of GitHub workflows and of approval files such as `tax-expert.yaml` and `bookkeeper-expert.yaml`.
- **Markdown.** Tickets (`.ed/inbox/TASK-008.md`), `AGENTS.md`, `README.md`, and this note.
- **Shell.** `scripts/encode-media.sh` and the command steps inside GitHub Actions.
- **PowerShell.** `mge-triage-hub/scripts/windows` registers a Windows task so Chrome is open for the scrape.
- **GLSL.** The shader language of WebGL. Your repos ship materials and glTF. The 3D section treats GLSL as the layer under Three.js.

### Schemas and software architecture

Las formas de los datos y las palabras de arquitectura que ya usas.

- **Schema.** A written shape for data. `org.json` has a schema even without a formal file: `divisions`, `nodes`, `edges`, `steps`. The MGE encryption envelope is a schema: version, algorithm, salt, iv, ciphertext. A ticket that names columns in a CSV is a schema too.
- **JSON Schema.** A standard vocabulary for those shapes. Worth learning so a ticket, a heartbeat event, and a Supabase row can be checked the same way.
- **Whitelist.** `sanitize.js` allows a fixed set of fields and step names. Unknown keys are dropped. That is safer than trying to recognize every bad string.
- **Adapter.** Two implementations behind one function. Local JSON and Supabase in `samuel-learn`. Demo catalog and Wix in `takeod-site`.
- **SPA.** Single-page app. One HTML file, routing in the browser. Your Vite sites are SPAs. `org-dashboard` is a single page without a framework.
- **Client and server.** The browser is the client. FastAPI is the server on `sam-erp`. `takeod-site` has no server of yours: Wix is the backend, and an empty client id means demo mode.
- **REST.** Resources and HTTP verbs. The GitHub Contents API that the MGE extension calls is a REST API. FastAPI routes will be too.
- **OIDC and OAuth.** Sign-in standards. `sam-erp` uses Google OIDC. `takeod-site` uses Wix `OAuthStrategy` and stores visitor tokens in `localStorage` under `wixSession`. The TakeOD README keeps that value to the public client id and leaves API keys out of the repo.
- **Monolith and rebuild.** The running ERP is server-rendered (FastAPI + Jinja + SQLite). `frontend/` is the React app growing beside it. Ship a slice, keep the old page until the new one matches.
- **Template.** Jinja fills HTML on the server. JSX fills it in the browser. Same job, different place.
- **Environment and secrets.** `VITE_` values ship to the browser. GitHub Actions `secrets` stay on the runner. `mge-triage-hub` keeps the GitHub token in `chrome.storage.local` on that machine.
- **Workflow.** A GitHub Actions file: trigger (`push`, `schedule`, `workflow_dispatch`), permissions (`contents`, `pages`, `issues`), concurrency, jobs. Your Pages workflows upload `dist` and deploy. The MGE workflow commits an alert file and can email.
- **Publish boundary.** `division-one-bots` is private. `org-dashboard` is public-by-link. The private repo is where the rule is enforced (`shared/heartbeat.py`). The public page repeats it (`sanitize.js`). Two checks, because the relay can be posted to by anyone who has the link.
- **Extension vs headless.** Today's MGE collector is a Chrome extension inside a logged-in browser. The GCP note describes a future Python Playwright process on a VM. The VM path is a separate Python process. The extension stays inside a desktop Chrome profile.
- **Approval gate.** A bot can exist and still be forbidden to run on a schedule (`schedule approval: off`, `use approval: off`). The flag is part of the architecture.

### 3D web development

Desarrollo web en 3D: lo que ya hay en daykodee-home y takeod-site, y lo que sigue.

Your real 3D page is `daykodee-home/src/products.js`. It lazy-loads Three.js after first paint, loads three glTF models, projects `logo-decal.png` on the front, and draws them in one horizontal row. `takeod-site` is the React rebuild of that brand and already depends on `@splinetool/viewer`, with the scene URL left empty so the product image stays. Blender MCP is the planned way for an agent to help author those models.

- **Scene.** The world Three.js draws. `products.js` builds a `Scene` per product row and adds lights and a group of models.
- **Mesh.** A drawable object: geometry plus a material. The logo decal is `new THREE.Mesh(geometry, material)`. The product bodies are meshes inside the loaded glTF (`isMesh`).
- **Geometry.** The shape: positions of vertices. `DecalGeometry` projects a patch onto a mesh. If that patch is empty, the code falls back to `PlaneGeometry`.
- **Material.** How the surface responds to light. The decal uses `MeshBasicMaterial`, which ignores lights and stays a flat logo. The product comment says the cap and handle are one baked material authored in the model.
- **Texture.** An image on a material. `TextureLoader` loads `logo-decal.png`. `colorSpace` is sRGB so the colors match the PNG. `anisotropy` (capped at 4) keeps the logo sharper at an angle. Phones skip the texture entirely.
- **Lighting.** An `AmbientLight` plus two `DirectionalLight`s, a key and a warmer fill. They shade materials that respond to light. The unlit decal keeps the logo's own color.
- **Camera.** A `PerspectiveCamera` with a 26 degree field of view. `frameCamera` moves it back until the row fits the canvas, then updates the projection matrix. `lookAt` aims it at the row.
- **WebGL.** The browser API that talks to the GPU. `WebGLRenderer` creates it. You ask for `alpha: true` so the cream page shows through. `powerPreference` is `low-power` on phones and `high-performance` otherwise. `webglcontextlost` and a 4 second timer fall back to the static `products-row.webp`. `readPixels` checks that a real frame was drawn before the canvas is shown.
- **Three.js.** The library (`three` in `daykodee-home`) that wraps WebGL. You use `GLTFLoader`, `MeshoptDecoder`, `DecalGeometry`, `Raycaster`, `Box3`, `Clock`, and `Group`. One renderer draws the row and pauses, via `IntersectionObserver` and `setAnimationLoop`, while the row is off screen.
- **React Three Fiber.** A way to write Three.js as React components. `daykodee-home` calls Three.js from plain JavaScript. `takeod-site` is React and keeps the product picture until a scene URL is set. Learn R3F when the product row moves into the React site, so the canvas follows the same component rules as the cart.
- **GSAP with 3D.** GSAP runs the page: hero crossfades, `ScrollTrigger` pins, `SplitText` letter reveals, button shine. The 3D row has its own loop (`Clock`, sines for a slow turn and bob). Keep those loops apart. Leave mesh `rotation` to the Three clock.
- **Lenis with 3D.** Lenis smooths scroll and is driven by `gsap.ticker` with `lagSmoothing(0)`, in both `daykodee-home` and `takeod-site`, and in `samuel-learn`. The Three loop should pause off screen so a long smoothed scroll does not keep the GPU hot. `prefers-reduced-motion` skips Lenis and holds the models in a front view.
- **GLSL shaders.** Small programs the GPU runs. A vertex shader moves points. A fragment shader colors pixels. Uniforms are the knobs (time, color, resolution). `MeshBasicMaterial` covers the decal. Learn a shader when you want an effect the baked glTF does not carry (a rim light, a dissolve). Three.js exposes that as `ShaderMaterial`.
- **glTF and GLB.** The format you actually ship. `bottle.glb`, `cap.glb`, `backpack.glb`. GLB is glTF packed into one binary file. `MeshoptDecoder` unpacks meshopt compression. The loader is dynamic-imported after first paint.
- **OBJ.** An older text format for meshes. Recognize it when Blender offers a text export. Ship glTF to the web.
- **Decal, raycast, bounds.** The logo is placed by casting a ray at the front of the mesh, reading the face normal, and building a decal a hair off the surface. `polygonOffset` keeps it from flickering against the body (z-fighting). `Box3` measures the model so the row spacing and the camera fit the real size.
- **Spline.** A 3D editor with a web viewer. `takeod-site` depends on `@splinetool/viewer` and reads `SPLINE_SCENE_URL`. Empty means "keep the picture." A `data-spline-url` on a `.spline-slot` can override that one slot.
- **Blender and Blender MCP.** The likely place those glTF files are authored (the code comment calls them Rodin product models, then you load them as glTF). Blender MCP is the planned agent connector. Until it is connected, an agent edits placement numbers in `PLACEMENTS` and leaves the binary `.glb` alone.
- **Mobile and iPad performance.** `isMobile` is true when the width is under 768px or the pointer is coarse. An iPad matches the coarse pointer even in landscape, so it takes the cheap path: pixel ratio capped at 1 (desktop caps at 1.5), antialiasing off, decals skipped, `powerPreference: "low-power"`. The static WebP stays up if WebGL fails. Reduced motion disables pointer tilt. That is the performance budget to keep when the scene moves into React.

### Agents

Orquestación, prompts, datos y seguridad de los agentes que ya usas.

- **Orchestration.** Who runs, in what order, and who may hand off. Your floor plan is the map: edges such as "refund request", "draft 1040", "bookkeeping complete", "daily report". ED triggers routines. Approval flags stop a planned bot from running itself. A coding lane is orchestration too: the workflow or the cloud agent, then a pull request, then you.
- **Prompt engineering.** Writing the ticket so the model can succeed. `TASK-008` already does this well: allowed files, the function name, the new columns, the filename rule, and "do not merge." A vague prompt spends the run guessing. Put the rule in `AGENTS.md` when every task needs it, and in the ticket when only this task needs it.
- **Function calling.** The model returns a structured tool call instead of pretending it did the work. Claude tool use, Cursor tools, and MCP `tools/call` are the same loop. The host executes. The model continues from the result.
- **RAG.** Retrieval-augmented generation: search your own documents, then answer from those passages. This is how a Professor or Tax I/C bot should use a W-2 or a statute. The answer stays tied to a source you can open. The doc parser and client doc intake on the org chart are the start of that pipeline.
- **Embeddings.** A list of numbers that stands for a piece of text, so "similar" can be measured. Use them when keyword search misses the passage. A known ticket id or file path is a direct lookup.
- **Vector database.** A store indexed by those numbers. Supabase can hold one, which is a reason to finish the real adapter in `samuel-learn` only when a study page needs search. Until then the stub and `content.json` are the right size.
- **APIs.** A contract another program can call. FastAPI routes, the GitHub Contents API, Wix Headless, Firebase Realtime Database, ntfy, and the Anthropic Messages API are all APIs you already touch. Learn authentication, pagination, and what a 401 means (the MGE options page already explains a bad GitHub token).
- **Web and browser automation.** Playwright drives a browser from code. You use it for screenshots in `samuel-learn` and `takeod-site`. The MGE GCP note specifies it as the future scraper. The thing that runs today is a Chrome extension, which is automation inside a real profile. Prefer an official API (the note points at NetSuite token-based auth, SuiteTalk, SuiteQL, or a RESTlet) when the site offers one.
- **File and code operations.** The agent reads and edits a named allow-list, then commits on a branch. Ponytail is the rule for how big that edit may be. The MGE CLI (`cli/mge-hub`) is a file-free way to ask the hub a question without opening the dashboard. Heartbeat code is the allow-list for what a bot may publish.
- **Evaluation and testing.** `samuel-learn` uses `node --test` plus `i18n:check`. `org-dashboard` unit-tests the sanitizer. `mge-triage-hub` has an offline harness under `tests/`. `gold-elite-landing` runs oxlint. An agent change is done when those commands pass. For the bots, a useful eval is a fake event that must be dropped, and a real step name that must be kept.
- **Agent security and permissions.** GitHub Actions permissions are explicit (`contents: read`, `pages: write`, `id-token: write`, `issues: write`). Approval flags gate bot schedules. The public dashboard re-sanitizes every event. Secrets stay in the runner, in `chrome.storage.local`, or in an env file with a tight mode, never in a commit. MCP makes this sharper: a connected Finance server is a permission, so connect it only on the agent that should have it. agent-trace.dev is how you check, after the fact, what the agent actually called.

### Tax, bookkeeping, and ERP

Impuestos, contabilidad y el sistema ERP, con las palabras de tus bots.

- **Tax prep.** The Production division's job, together with website building. Sales does lead intake and client profiles. QC checks complaints and refunds.
- **Form 1040.** The US individual return. The org chart edge "draft 1040" runs from the refund workflow to Tax Expert, then "compute return" goes to Tax Engine. Tax Expert is a library with use-approval on. Tax I/C is the teammate you talk to. Tax Engine is the calculator. Keep those three roles straight.
- **W-2.** A wage statement. The doc parser is described as the shared reader for statements, stubs, and W-2s. The edge "parse w-2" runs from the refund workflow to that parser. The parser is marked frozen on the board, so treat it as shared code you change carefully.
- **Refund workflow.** An on-demand path, approval on, triggered by Sales or QC.
- **ITIN and SSN.** Taxpayer identifiers. The public sanitizer treats SSN-shaped text as forbidden payload. They belong in the private store, never in a heartbeat, a ticket title, or a learning note.
- **Bookkeeping.** Recording income and expenses so a later tax return has numbers it can trust. Bookkeeper Expert is a Production library. Its use-approval is off. The edge "bookkeeping complete" points at Tax Expert, which is the handoff from books to the return.
- **P&L.** Profit and loss. The P&L builder is a shared library, fed by the doc parser ("build p&l"). Treasury's purpose is income, expenses, and budget, and it is read-only.
- **Doc parser and intake.** Intake accepts documents. The parser classifies them. Automatic intake is off (`automatic-run approval: off`), so manual runs only. That is a permission choice.
- **ERP.** Enterprise resource planning: one system for the operational records of the business. **`sam-erp`** is yours: FastAPI, Jinja, SQLite, Google sign-in, on a DigitalOcean droplet behind Tailscale, with a React rebuild in `frontend/`. Tailscale Serve exposes it to your tailnet. Tailscale Funnel can expose a chosen port more widely. OIDC is the sign-in. SQLite is the right database while one server owns the file.
- **Odoo.** The QC notes name Odoo tickets, and the allowed steps include "odoo read" and "odoo write". It sits beside the bots as a system of record.
- **NetSuite.** The ledger the MGE hub reads. The public hub stores encrypted extracts. A coding agent on `mge-triage-hub` fixes the scraper and the dashboard. A new export waits until you ask for one.
- **Claims Hunter.** Your teammate for chasing claims. Pair that bot with Finance (Plaid) and with Treasury's read-only summaries. Keep it on those tools.
- **Professor.** Your teammate for learning. This document is the sort of artifact Professor should be able to walk, one section at a time.

When you pick the next study block, use the repo you will touch that day. MCP first if the task needs a live tool. React and CSS if the task is `samuel-learn`, `takeod-site`, or `sam-erp/frontend`. The 3D section if the task is `daykodee-home` or the Spline slot. Tax and bookkeeping words if the task is a Division 4 bot. The privacy rule is the same in every block.
