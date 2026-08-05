# VendorFlow AI — Backend

AI-powered vendor procurement & contract management platform. This is the **backend** service: a REST API built with Node.js, Express, TypeScript, and MongoDB, following **MVC + Repository Pattern + Service Layer** architecture, with background job processing (BullMQ), real-time notifications (Socket.io), and **Gemini AI** integration for document intelligence.

## Architecture

```
Request → Route → Middleware (auth/rbac/validate) → Controller → Service → Repository → Model (MongoDB)
                                                           ↓
                                              BullMQ Queue → Worker (async: AI extraction, email, notifications)
```

- **Controllers** — thin HTTP layer; parse request, call service, shape response. No business logic.
- **Services** — all business logic lives here (approval workflow rules, AI orchestration, PDF generation, etc).
- **Repositories** — data access only, extending a generic `BaseRepository<T>`. Services never touch Mongoose models directly.
- **Models** — Mongoose schemas, one per domain entity.
- **Jobs** — BullMQ queues/workers for anything slow or non-critical-path (AI extraction, emails, notification fan-out) plus a node-cron job for daily contract-expiry scanning.

## Folder structure

```
src/
  config/        env, database, redis, cloudinary, gemini, logger
  constants/     roles, enums
  models/        Mongoose schemas
  repositories/  data access layer (Repository Pattern)
  services/      business logic (Service Layer)
  controllers/   HTTP request handlers
  routes/        Express routers
  middlewares/   auth, rbac, validation, error handling, uploads, rate limiting
  validators/    Zod request schemas
  jobs/
    queues/      BullMQ queue definitions
    workers/     BullMQ job processors
    cron/        node-cron scheduled tasks
  sockets/       Socket.io connection + emit helpers
  utils/         ApiError, ApiResponse, JWT, PDF generator, pagination
  seed/          demo data seeder
```

## Roles (RBAC)

`admin`, `procurement_manager`, `finance`, `vendor`, `approver`, `director`

Approval chain: **Procurement Manager → Finance → Director** (sequential; a rejection at any stage terminates the workflow).

## AI features (Gemini)

All implemented in `src/services/ai.service.ts`, using `@google/generative-ai` with `responseMimeType: application/json` so responses are parsed directly, no regex scraping:

| Feature | How |
|---|---|
| Quotation PDF extraction | PDF sent inline (base64) to Gemini's native document understanding — extracts price, warranty, delivery, payment terms, penalty clause |
| Quote comparison & recommendation | Structured JSON prompt ranks quotations with pros/cons/savings vs. highest price |
| Contract summarization + risk detection | Contract PDF analyzed for plain-English summary, risk flags (auto-renewal, uncapped liability, etc), and key dates |
| Duplicate vendor detection | Semantic name/GST comparison against existing vendors (catches "Pvt Ltd" vs "Private Limited" style variants) — combined with an exact-match DB check |
| Purchase order summary | Short natural-language summary embedded in the generated PO PDF and vendor email |

AI extraction runs **asynchronously** via BullMQ (`ai-extraction-queue`) so uploads return immediately; the frontend can poll or listen on the `quotation:ai-extracted` / `contract:ai-summarized` socket events.

## Getting started

### 1. Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Redis (local or managed)
- A Gemini API key ([Google AI Studio](https://aistudio.google.com/apikey))
- A Cloudinary account (for document/PDF storage)
- SMTP credentials (for email — Gmail app password works for dev)

### 2. Install
```bash
cp .env.example .env   # fill in MONGO_URI, REDIS_HOST, GEMINI_API_KEY, CLOUDINARY_*, SMTP_*
npm install
```

### 3. Run in development
```bash
npm run dev                    # API server (nodemon + ts-node)

# In separate terminals — background workers must run for AI extraction,
# emails, and notifications to actually process:
npm run worker:email
npm run worker:ai
npm run worker:notification
```

### 4. Verify your Gemini key works (no DB/Redis needed)
```bash
npm run smoke:ai
```
Runs all 5 AI functions (quotation extraction, quote comparison, contract summary + risk detection, duplicate detection, PO summary) against generated sample PDFs and prints PASS/FAIL for each with the raw response. Do this before wiring up the full app — it isolates whether an issue is your API key/quota vs. something in the rest of the stack.

### 5. Seed demo data
```bash
npm run seed
```
Creates an organization with an Admin, Procurement Manager, Finance user, Director, and one verified Vendor. All demo accounts use password `Password@123`.

### 6. Run with Docker Compose (API + all workers + Mongo + Redis)
```bash
docker compose up --build
```

### 7. Build for production
```bash
npm run build
npm start
```

## API overview

Base path: `/api/v1` (configurable via `API_PREFIX`)

| Resource | Base route |
|---|---|
| Auth | `/auth` (register-organization, register-vendor, login, refresh, me) |
| Users | `/users` |
| Vendors | `/vendors` |
| RFQs | `/rfqs` |
| Quotations | `/quotations` (includes `/quotations/rfq/:rfqId/compare` — AI comparison) |
| Approvals | `/approvals` |
| Contracts | `/contracts` |
| Purchase Orders | `/purchase-orders` |
| Vendor Ratings | `/vendor-ratings` |
| Notifications | `/notifications` |
| Audit Logs | `/audit-logs` |
| Analytics | `/analytics` |

All authenticated routes require `Authorization: Bearer <accessToken>`.

## Real-time events (Socket.io)

Connect with `{ auth: { token: accessToken } }`. Clients auto-join `user:<userId>` and `org:<organizationId>` rooms.

- `notification:new` — any new in-app notification
- `quotation:ai-extracted` — AI finished parsing a quotation PDF
- `contract:ai-summarized` — AI finished summarizing a contract version

## Audit logging

Any mutating action on Vendors, RFQs, PurchaseRequests, and approval decisions is recorded via `recordAudit()` (see `src/middlewares/audit.middleware.ts`), capturing actor, action, old/new value, IP, and timestamp — queryable via `GET /audit-logs` (Admin only).

## Notes / next steps for production hardening

- Add integration tests (Jest is configured; `src/**/*.test.ts` convention)
- Add request-level idempotency keys for PO generation
- Move PDF/document storage fully to signed URLs with expiry
- Add per-organization Gemini rate limiting / cost tracking
- Add OpenAPI/Swagger spec generation from Zod schemas
