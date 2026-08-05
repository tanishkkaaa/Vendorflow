# VendorFlow AI

AI-powered vendor procurement & contract management platform for SMBs — replaces the Excel + Gmail + WhatsApp procurement workflow with a single system: vendor onboarding, RFQs, AI-assisted quote comparison, sequential purchase approvals, contract tracking with AI risk detection, PDF purchase order generation, vendor ratings, real-time notifications, and full audit logging.

This repo is a monorepo with two independently runnable projects:

```
vendorflow-ai/
  backend/    Node.js + Express + TypeScript + MongoDB API (see backend/README.md)
  frontend/   React + Vite + TypeScript SPA (see frontend/README.md)
  docker-compose.yml   Runs the entire stack together
```

## Quick start (Docker — recommended)

```bash
cp backend/.env.example backend/.env
# fill in: MONGO_URI (or leave as-is for the bundled Mongo container),
# GEMINI_API_KEY, CLOUDINARY_*, SMTP_*

cp frontend/.env.example frontend/.env
# defaults already point at http://localhost:5000 — fine for local Docker use

docker compose up --build
```

This starts: frontend (nginx) on `:8080`, backend API on `:5000`, three background workers (email / AI extraction / notifications), MongoDB on `:27017`, Redis on `:6379`.

Open **http://localhost:8080**, register a new organization, and you're in as Admin.

## Quick start (manual / local dev)

Requires Node 20+, MongoDB, and Redis running locally, plus a Gemini API key.

```bash
# Terminal 1 — backend
cd backend
cp .env.example .env   # fill in GEMINI_API_KEY etc.
npm install
npm run smoke:ai       # optional: verify your Gemini key works before wiring up the app
npm run dev

# Terminal 2, 3, 4 — background workers (required for AI extraction, email, notifications)
cd backend
npm run worker:email
npm run worker:ai
npm run worker:notification

# Terminal 5 — frontend
cd frontend
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```

Optional: `cd backend && npm run seed` to create a demo organization with Admin, Procurement Manager, Finance, Director, and one verified Vendor account (all passwords: `Password@123`).

## How the pieces fit together

```
React SPA (frontend/)
   │  Axios (JWT + refresh) · Socket.io client
   ▼
Express API (backend/)
   │  Controller → Service → Repository → MongoDB
   │
   ├─ Gemini AI (quotation extraction, quote comparison, contract risk
   │  detection, duplicate-vendor detection, PO summaries)
   ├─ BullMQ + Redis (async: AI jobs, email, notification fan-out)
   ├─ node-cron (daily contract-expiry scan)
   ├─ Cloudinary (document/PDF storage)
   └─ Socket.io (real-time notification push)
```

Roles (shared between both apps): **Admin, Procurement Manager, Finance, Vendor, Approver, Director**. Approval chain is sequential: Manager → Finance → Director.

## Where the AI actually shows up in the UI
- **RFQ detail page** — "Run AI comparison" ranks all submitted quotations with pros/cons, savings vs. highest price, and a recommended pick
- **Vendor detail page** — "Run AI duplicate check" catches near-duplicate vendor registrations (name variants, GST matches)
- **Contract detail page** — AI-generated summary + a red risk-flags box (auto-renewal clauses, uncapped liability, missing SLAs, etc.)
- **Purchase order detail page** — AI-written natural-language summary embedded in both the PDF and the vendor email

Every AI-sourced value in the UI carries the amber "AI" badge (`frontend/src/components/ui/AIBadge.tsx`) so it's never confused with human-entered data.

## Verified state of this codebase
- Backend: `tsc --noEmit`, `eslint`, and `npm run build` all pass clean
- Frontend: `tsc -b`, `eslint`, and `npm run build` (Vite production build) all pass clean
- **Not yet verified**: a live run against real Gemini/MongoDB/Redis/Cloudinary credentials, since this was built in a sandbox without network access to those services. Run `backend/npm run smoke:ai` first once you add your `GEMINI_API_KEY` — see `backend/README.md`.
- No automated test suite yet (Jest is scaffolded on the backend)

## Next steps worth prioritizing
1. Run `npm run smoke:ai` in `backend/` with your real Gemini key
2. Run the full stack end-to-end once: register org → invite vendor → publish RFQ → submit quotation → AI compare → approve → generate PO
3. Route-based code-splitting on the frontend (flagged by the Vite build — single bundle is ~257KB gzipped)
4. Add integration tests before treating this as production-ready
