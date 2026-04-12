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

## UI components (`/components/ui/`)

**Always prefer reusable primitives** over one-off markup for interactive and visual building blocks.

- **Location:** shared, design-system-style components live under **`components/ui/`** (e.g. `button.tsx`, `input.tsx`, `label.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`, `tabs.tsx`, `badge.tsx`, `card.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `table.tsx`, `form` helpers).
- **Customization:** each primitive should expose **clear props** (`variant`, `size`, `tone`, `className`, etc.), use **typed variants** (e.g. `class-variance-authority` + `tailwind-merge` via a small `cn()` helper), and support **composition** (`asChild` where appropriate) so screens stay thin.
- **Forms:** use **`react-hook-form`** and **colocated hooks** under **`hooks/forms/`** (e.g. `useLoginForm`, `useSignupForm`, `useDirectoryUserCreateForm`) so pages stay thin — **do not** scatter `useState` per field on route components. Prefer **`useMutation`** from TanStack Query inside those hooks for submit side-effects, cache invalidation, and loading state. Compose fields from **`components/ui/`** primitives when they exist; wire labels with `htmlFor` / `id`; surface validation and errors with `role="alert"` / `aria-invalid` / `aria-describedby`. Shared field styling helpers may live in **`lib/forms/`** until migrated to ui inputs.
- **Do not** duplicate raw `<button className="...">` / `<input className="...">` patterns across feature folders when a ui primitive exists or should exist — **extend the ui layer** instead.

Feature-specific wrappers (e.g. `components/admin/...`) may compose **`components/ui/*`** but should not redefine base styles for the same control.

A starter **`Button`** with typed **`variant`** / **`size`** props lives in **`components/ui/button.tsx`** (re-exported from **`components/ui/index.ts`**); grow this folder with inputs, tabs, badges, and other primitives as the product expands.

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
| **Admin** | `(admin)/admin/` | `/admin`, `/admin/directory`, `/admin/directory/[role]` |
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

---

## Naming and branding

Use **“elev8temedia”** and **“Internal Agency OS”** (or **“Agency OS”** in UI where space is tight). Tone: professional, calm, operations-focused — not flashy marketing-site energy inside the app chrome.
