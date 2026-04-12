# AGENTS.md — elev8temedia Internal Agency OS

Context for AI coding agents working on this **Next.js** web app. The immediate goal is a **client-facing UI demo** (dummy data is fine). The product is an internal operating system for **elev8temedia**, a social media marketing agency (Meta Ads, SMS, site optimization for e‑commerce brands).

---

## Product intent (Version 1)

Single web app: **manual entry only**, no live integrations in v1. Everything must feel **editable and persistent** in the real build; for the **demo**, static or local mock data is acceptable as long as layout and flows read as a real product.

**Modules (navigation and IA should reflect these):**

| Module        | Purpose |
|---------------|---------|
| **Dashboard** | First screen after login: revenue overview, client health, alerts, daily sales activity. |
| **Client Hub** | Per-client home: revenue, payments, performance, weekly updates, communication history. |
| **Sales Pipeline** | Leads, daily outreach log, follow-ups, sales performance over time. |
| **Finance** | Per-client payments, expenses, contractor pay, monthly revenue projections. |
| **Operations** | Daily standup log, task board by client, weekly reports. |

**Non-demo v1 requirements (architecture should not block these):**

- **Auth** with **role-based access** (different users see different modules or data slices).
- **Real database** for durable CRUD (demo may stub or use local mock data until wired).
- **In-app notifications** for overdue payments, missed standups, outreach targets (demo: sample alerts + empty states).
- **Export** to CSV and PDF (demo: buttons that show intent or generate minimal sample files is acceptable if full export is out of scope).
- **Client delivery**: full code + DB ownership — avoid SaaS-only backends that cannot be transferred; prefer self-hostable or standard OSS data stores when implementing persistence.

**Future (do not build in demo unless asked; keep seams clean):**

Integrations (Shopify, Meta Ads, Postscript, WhatsApp), staff/client/contractor portals, native mobile + push, automated weekly reports, forecasting, invoicing, threaded comments on tasks/clients.

---

## Progressive Web App (PWA)

The app **must support installation as a PWA** (manifest, service worker via **`@ducanh2912/next-pwa`**, offline-friendly defaults where reasonable). This plugin is actively maintained for Next.js App Router and uses **Workbox** under the hood.

- Keep **`app/manifest.ts`** accurate: `name`, `short_name`, `start_url`, `display`, `theme_color`, `background_color`, and **icons** under `public/icons/` (include a **maskable** 512×512 asset for home-screen masks).
- Prefer **`standalone`** or **`minimal-ui`** display for an app-like shell.
- When adding routes or auth flows, ensure **middleware does not intercept** the service worker, workbox bundles, or **`/manifest.webmanifest`** (see `middleware.ts` matcher).
- **`next.config.ts`** sets **`turbopack: {}`** so Next.js 16 does not error when a merged **webpack** config exists (from this plugin) and something runs **`next dev`** / **`next build`** without a bundler flag.
- For **this repo’s scripts**, use **`next dev --webpack`** and **`next build --webpack`**: that matches the PWA plugin and ensures **`npm run build`** emits the service worker. A plain **`next build`** (Turbopack) may compile without the earlier guard error but **skips** the PWA webpack step — use **`npm run build`** for real releases. Prefer migrating to [Serwist](https://serwist.pages.dev) if you want Turbopack-first workflows later.
- Generated **`public/sw.js`** and **`public/workbox-*.js`** are gitignored; they are recreated on each production build.
- Test **Lighthouse PWA** and **installability** on Chrome/Android and Safari/iOS where possible.

---

## UI — shadcn/ui (`/components/ui/`)

The app uses **[shadcn/ui](https://ui.shadcn.com)** on **Tailwind CSS v4** (see **`components.json`**: style **base-nova**, `cssVariables`, **lucide** icons). Primitives are **copied into the repo** under **`components/ui/`** (not a black-box npm UI kit), backed by **Base UI** primitives where the registry supplies them (e.g. **`Button`**, **`Input`**).

- **Registry CLI:** add or refresh components with **`npx shadcn@latest add <name> -y`** (e.g. `button`, `input`, `card`, `dialog`). This updates **`components/ui/*`** and may add peer deps; commit the generated files.
- **Imports:** use **`@/components/ui`** (see **`components/ui/index.ts`**) or import a specific file from **`@/components/ui/...`**. Use **`cn()`** from **`lib/utils.ts`** (`clsx` + `tailwind-merge`) when merging classes.
- **Theming:** design tokens live in **`app/globals.css`** (`@import "shadcn/tailwind.css"` plus **`@theme inline`** CSS variables such as `--primary`, `--background`, `--radius`, …). The **`shadcn`** npm package is required for that stylesheet import — **do not remove** it unless you replace the import with an equivalent theme bundle.
- **Light and dark mode — verification (required before merging UI work):** Theme switching uses **`next-themes`** with **`attribute="class"`** and light/dark only (see **`components/providers.tsx`**). **Always manually toggle** light and dark in the browser on every surface you touch (marketing, auth, dashboard, admin, role placeholders) and fix contrast or invisible text. Prefer **semantic tokens** (`bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`) over raw **`bg-white` / `text-zinc-900`** without a matching **`dark:`** pair — hardcoded neutrals are a common source of “broken” dark mode. Ensure **`ThemeToggle`** is reachable wherever the chrome implies account or settings access (e.g. admin sidebar footer).
- **Forms:** use **`react-hook-form`** and hooks under **`hooks/forms/`**; compose fields from **`Input`**, **`Label`**, **`Button`**, and **`Alert`** (and other shadcn components as you add them). Use **`aria-invalid`** on inputs when validation fails; pair **`Label`** `htmlFor` with control **`id`**. Prefer **`Alert`** / **`AlertTitle`** / **`AlertDescription`** for blocking errors; use neutral **`role="status"`** blocks for success copy so it is not announced as an error.
- **Links styled as buttons:** Base UI **`Button`** supports a **`render`** prop (e.g. **`render={<Link href="…" />}`** with **`nativeButton={false}`**) so Next.js **`Link`** keeps client navigation and button styling.
- **Do not** hand-roll raw `<button>` / `<input>` patterns in feature folders when a **`components/ui`** primitive exists — **extend shadcn** or add a missing primitive via the CLI, then compose.

Feature folders (**`components/admin/…`**, **`components/auth/…`**, marketing, dashboard) should compose **`components/ui/*`** for controls, cards, tables, and alerts.

---

## Accessibility (a11y) — required

Follow **WCAG-oriented** practices and **ARIA** where it improves semantics beyond native HTML.

- Use **semantic HTML first** (`button`, `a`, `nav`, `main`, `header`, `label`, headings in order). Add **ARIA** only when native semantics are insufficient (`aria-label`, `aria-expanded`, `aria-controls`, `aria-live`, etc.).
- **Keyboard:** all interactive controls focusable and operable without a pointer; visible **focus rings** (do not remove focus styles without a better replacement).
- **Color:** do not rely on color alone for meaning; respect **contrast** for text and controls.
- **Motion:** honor **`prefers-reduced-motion`** for non-essential animation.
- **Client components** that implement widgets (tabs, menus, dialogs) must manage **roving tabindex** / **focus trap** / **Escape** per WAI-ARIA patterns when applicable.

---

## Demo acceptance criteria

Ship a demo that shows:

1. **Dashboard** — sample KPIs, 1–2 **alerts** (e.g. overdue payment, missed standup), snippet of “daily sales” or activity.
2. **Client Hub** — **list** of clients + **at least one profile** drill-down (tabs or sections for revenue, payments, performance, updates, comms).
3. **Global navigation** between modules (sidebar on desktop; **mobile-friendly** nav — drawer, bottom bar, or priority + “More” — pick one pattern and stay consistent).
4. **Mobile / narrow viewport** — readable typography, tap targets, tables that scroll or stack; no horizontal trap layouts on phone widths.
5. **Interactive bonus** — e.g. collapsible sections, filters on list, or simple modal; not required to persist.

**Design:** Clean, intentional, pleasant for daily use. **Dark or light** is fine; pick a coherent system (tokens or CSS variables), consistent spacing and type scale.

---

## Technical guidance (Next.js)

- Prefer **App Router** (`app/`), **React Server Components** where they simplify data reads; use **Client Components** for interactivity, charts that need DOM, and mobile nav state.
- **Styling:** Tailwind CSS is a reasonable default; keep responsive breakpoints explicit (`sm:`, `md:`, etc.). Avoid fixed desktop-only widths for primary layouts.
- **Data for demo:** colocate mock types and fixtures (e.g. `lib/demo-data.ts` or `data/*.ts`) so swapping in a database later is straightforward.
- **RBAC (when implemented):** centralize role checks (middleware + server helpers); never rely on hiding UI alone for security.
- **Performance:** lazy-load heavy client widgets; optimize images if using real assets.

### App Router route groups (`app/(groupName)/…`)

Parentheses name a **route group**: they organize files and layouts **without** appearing in the URL.

| Group | Path under `app/` | Public URLs (examples) |
|--------|-------------------|---------------------------|
| **Marketing** | `(marketing)/` | `/` |
| **Auth** | `(auth)/` | `/login`, `/signup`, `/auth/callback`, `/auth/signout` |
| **Dashboard** | `(dashboard)/` | `/dashboard` |
| **Admin** | `(admin)/admin/` | `/admin` (redirect), `/admin/dashboard`, `/admin/directory`, `/admin/directory/[role]` |
| **Client** | `(client)/client/` | `/client` (placeholder hub; add nested routes as modules ship) |
| **Sales** | `(sales)/sales/` | `/sales` |
| **Finance** | `(finance)/finance/` | `/finance` |
| **Operations** | `(operations)/operations/` | `/operations` |

**Conventions:** keep **`app/api/`**, **`app/manifest.ts`**, and the root **`app/layout.tsx`** at `app/` (outside groups). Add role- or feature-specific pages **under the matching group** so layouts and ownership stay clear. New modules for a role should extend that group’s tree (e.g. `(sales)/sales/pipeline/page.tsx` → `/sales/pipeline`).

### Module exports (prefer named exports)

Use **named exports** for **components**, **hooks**, **lib** utilities, shared types, and fetchers — e.g. `export function SessionCard`, `export { useLoginForm }`, `export const queryKeys`. This keeps refactors and IDE imports predictable and avoids anonymous default components.

**Exception (Next.js contract):** files the App Router treats as route modules **must** default-export the page, layout, loading, error, not-found, template, or route handler entry — e.g. `export default function Page()` in `page.tsx`, `export default function Layout()`, `export async function GET` in `route.ts`. Thin route files may default-export while importing **named** building blocks from elsewhere.

**Do not** use default exports for new **`components/*`**, **`hooks/*`**, or **`lib/*`** modules unless migrating legacy code; prefer a single named export or a barrel **`index.ts`** with **`export { … }`**.

### Server data vs client cache (**TanStack Query**)

Use [**TanStack Query**](https://tanstack.com/query) (`@tanstack/react-query`) for **browser caching, deduping, background refresh, and mutation lifecycle** on the client.

- **`QueryClientProvider`** is wired in **`components/providers.tsx`** (default **`staleTime`** ~30s, **`gcTime`** ~5m, **`refetchOnWindowFocus`**: on).
- **Query keys** are centralized in **`lib/query/query-keys.ts`** — always use these factories (e.g. `queryKeys.me.sessionSummary()`, `queryKeys.admin.profiles(role)`) so invalidation stays consistent.
- **Reads:** use **`useQuery`** with a **`queryFn`** that calls **`fetch`** to same-origin **`/api/...`** routes that run **`createClient()`** from **`@/lib/supabase/server`** (cookies). Do not duplicate ad-hoc `fetch` URLs across components — prefer small fetchers in **`lib/query/`** (e.g. **`session-summary.ts`**, **`admin-profiles.ts`**).
- **Writes:** use **`useMutation`**; on success **`invalidateQueries`** for every affected key (e.g. after creating a directory user, invalidate `queryKeys.admin.profiles(role)`; after auth, invalidate `queryKeys.me.sessionSummary()`).
- **Route handlers** under **`app/api/**`** remain the source of truth for auth and RLS; keep them thin and typed responses JSON-only where possible.

---

## Agent workflow expectations

- **Read this file** when starting unfamiliar work on this repo.
- **Match existing patterns** in the codebase once files exist (naming, folder layout, component style).
- **Scope:** Demo-first unless the user asks for auth/DB/export; then implement incrementally with verification.
- **Do not** add large unrelated refactors or extra markdown docs unless requested.
- **Git:** do **not** create commits, amend history, or push unless the user explicitly asks. Leave changes in the working tree so the user reviews and commits with their own messages and timing.
- **Verification (every substantive change):** run **`npm run lint`** and **`npm run build`** before considering the task done or reporting success; fix any failures and re-run until both exit cleanly. Use the repo’s **`npm run build`** (includes **`--webpack`**) so the production build matches the PWA guidance above.

---

## Naming and branding

Use **“elev8temedia”** and **“Internal Agency OS”** (or **“Agency OS”** in UI where space is tight). Tone: professional, calm, operations-focused — not flashy marketing-site energy inside the app chrome.
