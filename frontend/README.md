# VendorFlow AI — Frontend

React + Vite + TypeScript SPA for the VendorFlow AI platform, matching the backend's roles and modules.

## Stack
React 18, Vite, TypeScript, Tailwind CSS, Redux Toolkit (auth/UI/notifications state), TanStack React Query (server state/caching), React Hook Form + Zod (forms/validation), Framer Motion (transitions), Chart.js via react-chartjs-2 (analytics), Socket.io client (real-time notifications), Axios (with automatic access-token refresh on 401).

## Design system
Custom Tailwind tokens in `tailwind.config.ts` — a muted teal-slate primary (`#2C5F6F`) with an amber accent (`#E8A33D`) reserved for AI-generated content and alerts, deep navy sidebar (`#0E1420`), Space Grotesk for headings, Inter for body text, IBM Plex Mono for codes/IDs (RFQ codes, PO numbers, GST numbers). The amber "AI" badge (`components/ui/AIBadge.tsx`) is used consistently everywhere the backend's Gemini output surfaces — quote comparison, contract risk flags, duplicate-vendor checks, PO summaries — so AI-assisted content is always visually distinguishable from human-entered data.

## Folder structure
```
src/
  api/            Axios call wrappers per backend resource
  app/            Redux store + typed hooks
  features/       Redux slices (auth, ui, notifications)
  hooks/          React Query hooks per module (useVendors, useRFQs, ...)
  components/
    layout/       AppLayout, Sidebar (role-filtered nav), Topbar, ProtectedRoute
    ui/           Card, Badge, DataTable, Modal, StatCard, AIBadge, etc.
  pages/          One folder per module (auth, dashboard, vendors, rfq, approvals, contracts, purchaseOrders, notifications, auditLogs)
  constants/      Role and status enums mirroring the backend
  types/          Shared TS interfaces mirroring backend models
  lib/socket.ts   Socket.io client connection management
  utils/format.ts Currency/date/status formatting helpers
```

## Role-based routing
`components/layout/ProtectedRoute.tsx` guards routes by role, matching the backend's RBAC:
- **Admin / Procurement Manager / Finance** — vendors, contracts
- **Procurement Manager / Finance / Director / Approver** — approvals queue
- **Vendor** — own profile (`/vendor-profile`), invited RFQs, quotation submission
- **Admin only** — audit logs

## What's wired end-to-end
- Auth: organization registration, vendor self-registration, login with JWT + refresh-token interceptor
- Vendor portal: profile edit, document upload, AI duplicate-check trigger, verify/reject (internal)
- RFQ: create with dynamic item rows, publish + invite verified vendors, vendor quotation submission, **AI quote comparison view** (ranked pros/cons/savings, recommended badge)
- Approvals: visual Manager → Finance → Director timeline, act (approve/reject) restricted to the current stage's role, PO generation form once approved
- Contracts: upload with version history, **AI summary + risk-flag display**, renewal via new version upload
- Purchase orders: line items, PDF download, vendor star-rating form (delivery/quality/support/cost)
- Dashboard: monthly spend line chart, vendor spend bar chart, top-rated vendors, KPI stat cards
- Real-time: Socket.io notification bell with toast on `notification:new`

## Getting started

```bash
cp .env.example .env   # point VITE_API_BASE_URL / VITE_SOCKET_URL at your backend
npm install
npm run dev             # http://localhost:5173
```

Requires the backend running (see `../vendorflow-backend/README.md`) — by default at `http://localhost:5000`.

### Build
```bash
npm run build
npm run preview
```

## Notes / next steps
- Bundle is currently a single ~257KB gzipped chunk; consider route-based `React.lazy()` code-splitting before production deploy (flagged by the Vite build warning)
- No test suite yet
- Vendor invite links (`/register-vendor?organizationId=...`) currently require the organizationId to be shared manually by the inviting company — a dedicated "invite vendor" flow with emailed links would be a natural next feature
