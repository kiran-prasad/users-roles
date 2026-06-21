# Users & Roles — WorkOS Frontend Take-Home

A two-tab admin UI for managing users and roles, built against the provided Express API.

[![CI](https://github.com/kiran-prasad/users-roles/actions/workflows/ci.yml/badge.svg)](https://github.com/kiran-prasad/users-roles/actions/workflows/ci.yml)

> Hero screenshot — capture `http://localhost:5173` once both servers are running and add it at `client/public/hero.png`, then reference it here.

## Live demo

- **Web app**: <https://users-roles.vercel.app>
- **API**: <https://users-roles-api.onrender.com> &nbsp;_(first request after idle may take ~30s to wake the free Render tier)_

## How to run

```bash
# Terminal 1 — API
cd server
npm install
npm run api        # serves on http://localhost:3002

# Terminal 2 — Client
cd client
npm install
npm run dev        # serves on http://localhost:5173
```

If your port 3002 is taken, run the API on another port and point the client at it:

```bash
SERVER_PORT=3010 npm run api
# then in client/
echo 'VITE_API_URL=http://localhost:3010' > .env.local
npm run dev
```

To exercise loading / error / race paths:

```bash
SERVER_SPEED=slow  npm run api    # 500–2000ms latency, 5% errors
SERVER_SPEED=fast  npm run api    # 500–1000ms latency (default)
SERVER_SPEED=instant npm run api  # no latency
```

## Deployment

The repo is set up to deploy as **Vercel (client) + Render (API)** — both on free tiers, both auto-deploy on push to GitHub.

**Server → Render.** A `render.yaml` blueprint at the repo root provisions the API as a Web Service. Import the repo at [render.com/blueprints](https://dashboard.render.com/blueprints), and Render reads the blueprint automatically. The start command bridges Render's injected `$PORT` to the server's `SERVER_PORT` env var so `server/src/api.ts` doesn't need to change (the brief forbids it).

**Client → Vercel.** Import the repo at [vercel.com/new](https://vercel.com/new). Set the **Root Directory** to `client/`. Vercel auto-detects Vite. Add an environment variable `VITE_API_URL=https://<your-render-service>.onrender.com` and trigger a redeploy. SPA routing is handled by `client/vercel.json`.

A `routeTree.gen.ts` regen step is included in `npm run build`, so a clean Vercel build works without committing the generated file.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Build | **Vite 5 + React 19 + TS strict** | Fastest dev loop; SPA fits the assignment scope |
| Compiler | **React 19 Compiler** (`babel-plugin-react-compiler`) | Auto-memoization without `useMemo`/`useCallback` noise |
| UI | **Radix Themes** (`accentColor="iris"`) | WorkOS endorses Radix; iris-9 (`#5B5BD6`) is within ~5% of the design's `#6565EC` |
| Data | **TanStack Query v5** | Caching, retry, abort-signal plumbing, optimistic delete with rollback |
| Routing | **TanStack Router v1** | Typed `validateSearch` (Zod) gives `useSearch()` real types and type-checked `navigate()` calls |
| Search debounce | `use-debounce` | 250 ms |
| Schema | **Zod** | Runtime + compile-time validation of URL search params |
| Tests | **Vitest + RTL + MSW** | Integration-flavored; handlers mirror the real API |
| Lint/format | ESLint flat config (`@tanstack/eslint-plugin-query`) + Prettier | Catches stale query keys at lint time |
| CI | GitHub Actions | `typecheck`, `lint`, `test`, `build` on every push/PR |

## Features

| Capability | Status |
|---|---|
| Users / Roles tabs (URL-driven) | ✓ |
| Users table (avatar, name, role, joined date) | ✓ |
| Debounced search filter (URL-persisted) | ✓ |
| Add user with form dialog (`POST /users`) | ✓ |
| Delete user with confirmation dialog (optimistic + rollback) | ✓ |
| Edit user (first / last / role) | ✓ |
| Roles table (name, description, default badge) | ✓ |
| Add role with form dialog (`POST /roles`) | ✓ |
| Edit role — name, description, default flag (`PATCH /roles/:id`) | ✓ |
| Delete role with confirmation + user reassignment (`DELETE /roles/:id`) | ✓ |
| Inline 400 collision handling on role name | ✓ |
| Pagination (Previous / Next, URL-persisted) | ✓ |
| Loading skeletons, empty states, error retry | ✓ |
| Background refetch progress bar | ✓ |
| Dark mode toggle (respects `prefers-color-scheme`) | ✓ |
| Keyboard shortcuts (`/`, `Esc`, `g u`, `g r`) | ✓ |
| Focus restoration after optimistic delete | ✓ |
| `aria-live` mutation toasts | ✓ |

## Keyboard shortcuts

| Key | Action |
|---|---|
| `/` | Focus the search input |
| `Esc` | Clear the search input (when focused) |
| `g` `u` | Jump to Users tab |
| `g` `r` | Jump to Roles tab |

## Design fidelity decisions

- **Font**: Figma uses **Untitled Sans** (Klim Type, paid). The client substitutes **Hanken Grotesk** (Google Fonts) — closest free analogue with similar x-height and humanist character. Loaded with `font-display: optional` so first paint doesn't reflow.
- **Accent**: Figma's `#6565EC` is approximated by Radix Themes' built-in `iris-9` (`#5B5BD6`, within ~5%). Picking the built-in scale means hover (`iris-10`) and the full dark-mode swap work automatically; generating a bespoke 1–12 scale for marginal fidelity gain wasn't a good trade against the 8-hour budget.
- **Add user button**: in the Figma. `POST /users` accepts `{ first, last, roleId }`, so it's wired through end-to-end — the button opens a dialog that defaults the role to whichever role has `isDefault: true`. (An earlier iteration omitted the button under a "no dead UI" rule; the dialog turns it into a real feature instead.)
- **Edit user**: not in the assignment task list, but `PATCH /users/:id` accepts the same payload so a full inline edit dialog is included — a low-cost upgrade from the "••• menu only deletes" baseline. Add and Edit share a `UserForm` sub-component.
- **Animations**: the Figma ships three static frames with no easing/duration tokens or prototype transitions. All motion (row enter/exit on delete, dialog enter/exit, search-clear slide, background-refetch progress bar, button-press scale) is conservative and gated by `prefers-reduced-motion: reduce`.

## API quirks I noted

- **Per-field search.** `GET /users?search=` matches `first` OR `last` (and `/roles?search=` matches `name` OR `description`) via `.includes()` against each field separately. That means typing **"Mark Tipton"** in the search box returns zero results. Rather than client-side tokenize + parallel-fetch + dedupe (which breaks the server's `next`/`prev`/`pages` math), the placeholder copy is tightened to **"Search by first or last name…"** so the UX honestly reflects the contract. Documented here so a reviewer doesn't read it as a bug.
- **5% random `500`s + configurable latency.** Absorbed by `retry: 2` with capped exponential backoff for queries (queries with `AbortSignal` plumbed end-to-end so stale requests cancel cleanly), and surfaced to the user via a retry toast for mutations.
- **Optimistic delete pins the exact query key.** The mutation snapshots `['users', { page, search }]` in `onMutate` context and restores from that key in `onError` — restoring "whichever key is active at settle time" would corrupt the cache if the user types or paginates while the request is in flight.

## What I'd do next

- **License Untitled Sans** so the typography is pixel-faithful to the design.
- **Avatar upload on Add user.** Today the form captures first / last / role only — newly created users get whatever random `pravatar` URL `POST /users` assigns on the server side. A real implementation would add an avatar field (file upload or URL) with a backend endpoint that handles storage, plus inline cropping + the existing initials fallback for the empty state.
- **Server-side sort** + clickable column headers.
- **Virtualized table** for 1k+ rows (TanStack Table + react-virtual).
- **Playwright E2E** covering the search → edit → delete flow against the real server.
- **Mobile responsive** card layout under 640 px.
- **Storybook** documenting the design system primitives (Avatar, Pagination, SearchInput, DataTable).
- **Live region** announcements with more nuance (e.g. announce skeleton replacement after first fetch).

---

## Original brief (from WorkOS)

In this exercise, you'll implement the UI for a simple two-tab layout that lists users and roles. You will also add limited functionality to update users and roles.

### Tasks

1. Set up the "Users" and "Roles" tab structure
2. Add the users table
3. Add support for filtering the users table via the "Search" input field
4. Add support for deleting a user via the "more" icon button dropdown menu
5. Add support for viewing all roles in the "Roles" tab
6. Add support for renaming a role in the "Roles" tab
7. [Bonus] Add pagination to the user table

### Evaluation criteria

- User Experience (UX)
- Component Composition
- State Management & Caching
- Error & Loading States
- CSS Animations
- Code Quality
- Accessibility

The backend API is intentionally unstable (5% server errors, configurable latency) to simulate real-world conditions. The client must handle delays and errors gracefully. **Do not alter the backend API.**

### Notes from the brief

- The Figma "Roles" tab is intentionally undesigned; this submission infers the same row / table card / pagination pattern as the Users tab.
- Loading states, error states, and hover states are explicitly left to the candidate to design.
