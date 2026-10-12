# Relay — Customer support, minus the chaos

A complete, production-style **customer support & operations platform** frontend: shared inbox, ticket management, customer profiles, team directory, analytics with real CSV export, theming, and mock auth. Built as a portfolio project to demonstrate junior frontend engineer skills.

## Problem it solves

Small support teams drown in scattered channels, missed SLAs, and zero visibility into response performance. Relay puts every conversation, ticket, customer record, SLA deadline, and performance metric into one fast workspace.

## Features

- **Marketing landing page** — hero, product preview, features, workflow, testimonials, pricing
- **Auth (mock)** — sign in / sign up with validation (React Hook Form + Zod), password toggle, reset flow, one-click demo login, protected routes
- **Dashboard** — totals, open/awaiting/resolved, avg first response, CSAT, deltas, volume chart, status/priority breakdowns, recent conversations, agent leaderboard, SLA deadlines, 7/30/90-day filters
- **Inbox** — debounced search, status/priority/category/assignee filters, 5 sort orders, load-more, conversation view with timestamps, reply vs internal-note composer (simulated send), assign + status/priority updates, customer panel, keyboard nav (`/` focuses search, `j`/`k` move)
- **Tickets** — searchable/sortable table, bulk select + bulk resolve/close/reprioritize with confirm dialog, create/edit modal with validation, dedicated detail page
- **Customers** — searchable directory, profile with ticket history, editable notes, add/remove tags, status updates
- **Analytics** — volume, first-response, resolution-time, CSAT, category/priority breakdowns, agent comparison, date-range controls, **working CSV export** of the filtered dataset
- **Team** — directory with role/status/search filters, workload counts, agent detail, simulated admin controls (clearly labeled demo-only)
- **Settings** — profile, light/dark/system theme (persisted), notification prefs, workspace name, restore-demo-data
- **Design system** — buttons, badges, inputs, cards, tables, modals, toasts, skeletons, empty states; collapsible sidebar + mobile drawer; accessible labels, focus states, keyboard support

## Stack

React 18 (JS, no TS) · Vite 5 · Tailwind CSS 3 · React Router 6 · Zustand · Lucide icons · Recharts · Motion · React Hook Form + Zod · date-fns · Vitest + React Testing Library

## Demo account

- Email: `demo@relay.app`
- Password: `password123`

Or use **One-click demo login** on the sign-in page. You can also create an account — demo users are stored in `localStorage` only.

> **Portfolio note:** auth and the API are mocked (`src/services/api.js`, `localStorage`-persisted). No credentials leave the browser. See *Backend integration* below.

## Run locally

Requires Node 18+ (tested on Node 20).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the production build
npm test         # Vitest suite
```

## Architecture

```
src/
  App.jsx            # routes + auth guard
  main.jsx           # entry, theme init, initial data load
  data/seed.js       # deterministic demo dataset (agents, customers, tickets, messages)
  services/api.js    # mock async service layer + localStorage persistence + mock auth
  store/useStore.js  # Zustand: session, theme, toasts, tickets/messages/customers/agents, mutations
  lib/               # filters/sort/stats, csv export, formatting utils
  hooks/             # useDebouncedValue, useLocalStorage
  components/
    ui/              # Button, Badge, Card, Avatar, Modal, EmptyState, Skeleton…
    layout/          # AppShell, Sidebar, Topbar
    feedback/        # Toasts
  pages/             # Landing, Auth, Dashboard, Inbox, Tickets, Customers, Analytics, Team, Settings
  test/              # Vitest suites
```

State flow: pages read from Zustand; mutations (`updateTicket`, `sendReply`, `createTicket`, `bulkUpdate`, `updateCustomer`, `updateAgent`) update the store **and** persist to `localStorage` via the service layer, so reloads keep your changes. **Settings → Restore default demo data** clears storage and reseeds.

## Screenshots

Screenshots are not checked in. To add genuine ones:

1. `npm run dev`, log in with the demo account
2. Capture `Dashboard`, `Inbox`, `Analytics` (desktop 1440px + mobile 390px)
3. Save to `docs/screenshots/` and reference them here, e.g. `![Dashboard](docs/screenshots/dashboard.png)`

## Known limitations

- Mock backend: simulated latency, no real-time sync, no server-side auth/permissions
- No real email/push delivery (replies and invites are simulated with toasts)
- Charts use a mix of live ticket data and generated trend series for smooth demos
- Avatar images are initials-based (no uploads)

## Future backend integration plan

1. Replace `src/services/api.js` functions with `fetch()` calls (or a Supabase client) keeping identical signatures — UI code stays untouched
2. Move auth to Supabase Auth / real sessions; store only a session token, never passwords
3. Add server-side RBAC for roles/invites, audit log table, and real SLA worker/queue
4. Swap `localStorage` persistence for optimistic updates + server reconciliation
5. Add pagination at the API layer (cursor-based) for large ticket volumes
