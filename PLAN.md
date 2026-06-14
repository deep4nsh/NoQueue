# NoQueue — Full Product Plan

> Virtual Token & Queue Management Platform
> Version: 1.0 | Status: Pre-development | Target Launch: MVP in 6 weeks

---

## Vision

NoQueue eliminates physical waiting by giving every customer a virtual place in line — reachable by phone, trackable in real time, and notified proactively via WhatsApp, SMS, or push. For businesses, it replaces chaos at the front desk with a calm, data-driven flow.

---

## Architecture Philosophy

**Build as a modular monolith first.** Every module is decoupled internally (its own service, repository, and event contracts) so it can be extracted into a microservice later without rewriting. This avoids premature complexity while ensuring the seams are in the right places from day one.

```
noqueue/
├── apps/
│   ├── api/              # NestJS backend (monolith, extractable)
│   ├── customer-app/     # Flutter (Android + iOS)
│   └── admin-app/        # Flutter or Next.js web (Receptionist + Owner)
├── packages/
│   ├── shared-types/     # DTOs, enums, event contracts (shared across apps)
│   └── ui-kit/           # Shared Flutter widgets / web components
├── infra/                # Docker, Terraform, CI/CD configs
└── docs/                 # API docs, ADRs, onboarding
```

---

## User Roles (RBAC — designed to extend)

| Role              | Scope         | Key Actions                                               |
| ----------------- | ------------- | --------------------------------------------------------- |
| `SUPER_ADMIN`     | Platform      | Manage all businesses, billing, feature flags             |
| `BUSINESS_OWNER`  | Business      | Manage branches, staff, reports, subscription             |
| `BRANCH_MANAGER`  | Branch        | Configure queues, view branch analytics                   |
| `RECEPTIONIST`    | Queue         | Add tokens, call next, skip, recall, mark complete        |
| `CUSTOMER`        | Own token     | Join queue, track position, cancel, view history          |

Roles are stored as an array on the user — a person can be both `RECEPTIONIST` at one branch and `CUSTOMER` at another.

---

## Database Design (MongoDB)

Schema is designed so that no field needs to be renamed or restructured through all phases. Optional future fields are noted.

### Business

```ts
{
  _id: ObjectId,
  name: string,
  slug: string,           // URL-safe unique identifier, e.g. "city-clinic"
  type: BusinessType,     // enum: CLINIC | LAB | SALON | DENTAL | PHYSIO | VET | SPA | AUTO | REPAIR | OPTICAL | OTHER
  phone: string,
  email: string,
  logoUrl: string,
  address: string,
  country: string,        // ISO 3166-1 alpha-2, default "IN"
  timezone: string,       // IANA, default "Asia/Kolkata"
  subscription: {
    plan: PlanType,       // STARTER | PROFESSIONAL | ENTERPRISE
    status: SubStatus,    // ACTIVE | TRIAL | EXPIRED | SUSPENDED
    trialEndsAt: Date,
    renewsAt: Date,
    tokensUsedThisMonth: number,
    tokenLimit: number
  },
  settings: {
    defaultLanguage: string,    // "en" | "hi" | ...
    whatsappEnabled: boolean,
    smsEnabled: boolean,
    fcmEnabled: boolean,
    brandColor: string,         // hex, for white-label
    customDomain: string        // enterprise: queue.clinic.com
  },
  branches: ObjectId[],
  createdAt: Date,
  updatedAt: Date
}
```

### Branch

```ts
{
  _id: ObjectId,
  businessId: ObjectId,
  name: string,
  address: string,
  location: {
    type: "Point",
    coordinates: [number, number]   // GeoJSON — for future "nearest branch" feature
  },
  phone: string,
  openingHours: {
    [day: string]: { open: string, close: string, closed: boolean }
    // day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"
  },
  holidays: Date[],
  qrCode: string,         // pre-generated, stable URL
  staff: ObjectId[],      // User refs
  isActive: boolean,
  createdAt: Date
}
```

### Queue

```ts
{
  _id: ObjectId,
  branchId: ObjectId,
  businessId: ObjectId,   // denormalized for fast queries
  name: string,           // "General OPD" | "Radiology" | etc.
  prefix: string,         // token prefix: "A", "B", "OPD"
  currentToken: number,
  lastTokenIssued: number,
  averageServiceTime: number,   // in minutes, auto-calculated rolling average
  status: QueueStatus,   // OPEN | PAUSED | CLOSED
  settings: {
    maxTokens: number,          // cap per day
    alertAheadCount: number,    // notify customer when X people ahead (default: 3)
    autoCloseAt: string,        // "18:00" — auto-close queue at time
    allowRemoteJoin: boolean,   // can customers join without scanning QR?
    requirePhone: boolean
  },
  date: string,           // "YYYY-MM-DD" — one queue doc per day per queue config
  openedAt: Date,
  closedAt: Date,
  createdAt: Date
}
```

### Token

```ts
{
  _id: ObjectId,
  queueId: ObjectId,
  branchId: ObjectId,
  businessId: ObjectId,   // denormalized
  tokenNumber: number,
  displayToken: string,   // e.g. "A-102" (prefix + number)
  customer: {
    name: string,
    phone: string,        // E.164 format, e.g. +919876543210
    email: string,        // optional
    userId: ObjectId      // null for anonymous walk-ins
  },
  status: TokenStatus,    // WAITING | CALLED | IN_PROGRESS | COMPLETED | SKIPPED | CANCELLED | NO_SHOW
  source: TokenSource,    // QR_SCAN | RECEPTIONIST | WHATSAPP_BOT | WEB | API
  position: number,       // live position in queue (recalculated on each state change)
  estimatedWaitMinutes: number,
  notifications: {
    joinedSent: boolean,
    approachingSent: boolean,
    calledSent: boolean,
    missedSent: boolean
  },
  notes: string,          // receptionist internal notes
  serviceData: {          // extendable per business type
    roomNumber: string,
    doctorName: string,
    serviceType: string
  },
  joinedAt: Date,
  calledAt: Date,
  completedAt: Date,
  skippedAt: Date,
  recalledCount: number,  // how many times receptionist recalled this token
  createdAt: Date
}
```

### User

```ts
{
  _id: ObjectId,
  name: string,
  phone: string,          // E.164, unique
  email: string,
  passwordHash: string,
  roles: {
    role: UserRole,
    businessId: ObjectId,
    branchId: ObjectId    // null for BUSINESS_OWNER and above
  }[],
  fcmTokens: string[],    // multiple devices
  preferences: {
    language: string,
    notifications: {
      whatsapp: boolean,
      push: boolean,
      sms: boolean
    }
  },
  tokenHistory: ObjectId[],   // last 20 token refs, capped array
  isVerified: boolean,
  lastLoginAt: Date,
  createdAt: Date
}
```

### NotificationLog (audit trail)

```ts
{
  _id: ObjectId,
  tokenId: ObjectId,
  channel: "WHATSAPP" | "SMS" | "FCM" | "EMAIL",
  event: NotificationEvent, // TOKEN_JOINED | APPROACHING | CALLED | MISSED | CANCELLED
  recipient: string,
  templateId: string,
  payload: object,
  status: "SENT" | "FAILED" | "QUEUED",
  providerResponse: object,
  sentAt: Date,
  createdAt: Date
}
```

### AuditLog

```ts
{
  _id: ObjectId,
  actorId: ObjectId,
  actorRole: UserRole,
  action: string,         // "TOKEN_CALLED" | "QUEUE_PAUSED" | "TOKEN_SKIPPED" etc.
  resourceType: string,
  resourceId: ObjectId,
  metadata: object,
  ip: string,
  createdAt: Date
}
```

---

## Backend — NestJS API

### Stack

| Layer          | Choice                | Reason                                      |
| -------------- | --------------------- | ------------------------------------------- |
| Framework      | NestJS                | Modular, decorator-based, scales well       |
| Database       | MongoDB + Mongoose    | Flexible schema, easy horizontal sharding   |
| Cache / Pub-Sub| Redis                 | Queue state cache                           |
| Real-time      | REST Polling + Webhooks | Token status updates, event notifications   |
| Auth           | JWT + Refresh Tokens  | Stateless, mobile-friendly                  |
| Validation     | class-validator       | DTO-level validation                        |
| Queue (jobs)   | BullMQ (Redis)        | Notification retries, scheduled tasks       |
| File storage   | Cloudinary / S3       | QR codes, logos                             |
| Docs           | Swagger / OpenAPI     | Auto-generated, versioned                   |

### API Versioning

All routes are prefixed `/api/v1/`. Future breaking changes go to `/api/v2/` — old versions stay alive for a deprecation window. This is configured in `main.ts` once and never needs to change.

### Module Structure

```
src/
├── common/
│   ├── decorators/       # @CurrentUser, @Roles, @Public
│   ├── guards/           # JwtAuthGuard, RolesGuard, SubscriptionGuard
│   ├── interceptors/     # LoggingInterceptor, TransformInterceptor
│   ├── filters/          # GlobalExceptionFilter
│   ├── pipes/            # ValidationPipe
│   └── utils/            # token math, time helpers, E.164 validator
│
├── modules/
│   ├── auth/
│   ├── user/
│   ├── business/
│   ├── branch/
│   ├── queue/
│   ├── token/
│   ├── notification/
│   ├── analytics/
│   ├── subscription/
│   └── whatsapp-bot/
│
├── jobs/                  # BullMQ processors
│   ├── notification.job.ts
│   └── analytics.job.ts
│
└── events/               # Internal event bus (NestJS EventEmitter)
    └── token.events.ts
```

### Core Endpoints

#### Auth — `/api/v1/auth`

```http
POST   /auth/register             # business/staff registration
POST   /auth/login                # phone+password or phone OTP
POST   /auth/refresh              # refresh JWT
POST   /auth/logout
POST   /auth/send-otp             # for customers (passwordless)
POST   /auth/verify-otp
```

#### Business — `/api/v1/business`

```http
POST   /business                  # create business
GET    /business/:id
PATCH  /business/:id
GET    /business/:id/branches
GET    /business/:id/analytics    # aggregate across branches
```

#### Branch — `/api/v1/branch`

```http
POST   /branch
GET    /branch/:id
PATCH  /branch/:id
GET    /branch/:id/queues
GET    /branch/:id/qr             # returns QR image URL
```

#### Queue — `/api/v1/queue`

```http
POST   /queue                     # create queue config for a branch
GET    /queue/:id                 # full queue state
GET    /queue/:id/live            # lightweight: currentToken, waiting count, EWT
PATCH  /queue/:id/open
PATCH  /queue/:id/pause
PATCH  /queue/:id/close
PATCH  /queue/:id/next            # call next token
PATCH  /queue/:id/skip            # skip current token
PATCH  /queue/:id/recall          # recall current token
```

#### Token — `/api/v1/token`

```http
POST   /token/join                # customer joins queue
GET    /token/:id                 # token status + position
GET    /token/by-display/:displayToken   # lookup by "A-102"
PATCH  /token/:id/cancel          # customer cancels
PATCH  /token/:id/complete        # receptionist marks done
```

#### Notification — `/api/v1/notification` (internal use + webhook)

```http
POST   /notification/webhook/whatsapp    # Meta webhook receiver
GET    /notification/log/:tokenId        # delivery audit trail
```

#### Analytics — `/api/v1/analytics`

```http
GET    /analytics/branch/:id/daily       # daily report
GET    /analytics/branch/:id/hourly      # peak hours breakdown
GET    /analytics/branch/:id/range       # ?from=&to= date range
GET    /analytics/branch/:id/summary     # today's snapshot
```

#### Subscription — `/api/v1/subscription`

```http
GET    /subscription/plans
POST   /subscription/upgrade
POST   /subscription/webhook/razorpay    # payment webhook
```

---

## Real-Time Updates

Token and queue status updates are delivered via:

### REST Polling (Client-initiated)

Clients poll endpoints at regular intervals (5-10 second intervals for customers, faster for staff):

```ts
GET /api/v1/tokens/{tokenId}/status    // Customer checks their token position
GET /api/v1/queues/{queueId}/status    // Staff checks queue state
```

### Push Notifications (Server-initiated)

For critical events (token called, queue ready), notifications are sent via:
- **FCM** (Firebase Cloud Messaging) for app users
- **WhatsApp** for all users
- **SMS** as fallback

### Event Log

State changes are logged and can be queried:
```ts
GET /api/v1/tokens/{tokenId}/events    // History of all changes
```

---

## Notification System

Notifications are sent via BullMQ jobs — never inline in request handlers. This ensures:
- Failed sends are retried with exponential backoff
- API response time is unaffected by third-party latency
- Every attempt is logged to `NotificationLog`

### Channels

| Channel   | Provider                        | When to use                       |
| --------- | ------------------------------- | ---------------------------------- |
| WhatsApp  | Meta Cloud API (official)       | Primary — highest open rate        |
| Push (FCM)| Firebase Cloud Messaging        | App users with background alerts   |
| SMS       | Twilio / AWS SNS / MSG91        | Fallback when no WhatsApp          |

### Notification Events & Templates

| Event              | Trigger                              | Message                                         |
| ------------------ | ------------------------------------ | ----------------------------------------------- |
| `TOKEN_JOINED`     | Token created                        | "Your token is A-102. Est. wait: 25 mins."      |
| `APPROACHING`      | N tokens ahead (configurable, def 3) | "Only 3 people ahead. Please be ready."         |
| `TOKEN_CALLED`     | Receptionist calls token             | "Your turn! Please proceed. [Room info]"         |
| `TOKEN_MISSED`     | Skipped, customer didn't come        | "You missed your turn. Reply REJOIN to continue."|
| `TOKEN_CANCELLED`  | Customer or staff cancels            | "Your token A-102 has been cancelled."           |
| `QUEUE_DELAYED`    | Queue paused / avg wait spikes       | "Queue is running ~15 mins late. Updated ETA."  |

Templates are stored in the database per business — Enterprise plan businesses can customize copy and language.

---

## WhatsApp Bot

Customers can interact with NoQueue entirely through WhatsApp — no app install needed.

### Conversation Flows

#### Join Queue

```
Customer: Hi
Bot: Welcome to [Business Name]!
     What would you like to do?
     1️⃣ Join Queue
     2️⃣ Check My Status
     3️⃣ Cancel My Token

Customer: 1
Bot: Please share your name.

Customer: Deepansh
Bot: Got it, Deepansh! Joining the queue at [Branch Name]...
     ✅ Your token is A-102
     📍 8 people ahead
     ⏱ Est. wait: 24 minutes
     Track live: noqueue.app/t/A102
```

#### Check Status

```
Customer: 2
Bot: Your current token: A-102
     Position: 5th in queue
     Est. wait: 15 minutes
```

#### Missed Token — Rejoin

```
Customer: REJOIN
Bot: Rejoining you at the back of the queue...
     ✅ New token: A-118 | Position: 12
```

### Implementation

- Webhook at `POST /api/v1/notification/webhook/whatsapp` receives messages
- `WhatsappBotService` parses message and routes to `BotFlowEngine`
- Flow state (which step user is on) stored in Redis with TTL (10 min timeout)
- Sends reply via Meta Cloud API

---

## Customer Mobile App — Flutter

### Single codebase targeting Android + iOS.

### Screen Flow

```
Splash (auto-login check)
  ↓
Onboarding (first launch only: name, phone, OTP verify)
  ↓
Home
  ├── Scan QR → Queue Preview → Confirm Join → Token Screen
  ├── My Tokens (active + history)
  ├── Notifications
  └── Profile
```

### Key Screens

#### Token Screen (core experience)

```
┌──────────────────────────────┐
│  City Clinic — OPD Queue     │
│                              │
│         A - 1 0 2            │
│         Your Token           │
│                              │
│   Now Serving:    A-094      │
│   People Ahead:     8        │
│   Est. Wait:    24 mins      │
│                              │
│  ████████░░░░░░░░  ~35%      │
│  Progress bar                │
│                              │
│       [ Cancel Token ]       │
└──────────────────────────────┘
```

Live-updated via polling. Background FCM notification when app is closed.

#### QR Scan

Uses `mobile_scanner` package. On successful scan:
1. Parse URL: `noqueue.app/join/{branchSlug}`
2. `GET /queue/:id/live` — fetch queue preview (wait time, token count)
3. Show confirmation bottom sheet
4. `POST /token/join` on confirm

### State Management

**Riverpod** — supports both sync and async state cleanly, works well with periodic polling and async state updates.

### Packages

| Purpose          | Package                   |
| ---------------- | ------------------------- |
| HTTP             | `dio`                     |
| State            | `flutter_riverpod`        |
| QR Scan          | `mobile_scanner`          |
| QR Generate      | `qr_flutter`              |
| Push notif       | `firebase_messaging`      |
| Local notif      | `flutter_local_notifications` |
| Secure storage   | `flutter_secure_storage`  |
| Navigation       | `go_router`               |
| Animations       | `lottie`                  |

---

## Admin App — Flutter (Web + Tablet + Mobile)

Flutter Web covers receptionist on desktop/tablet. Same codebase also runs as a native Android/iOS app for mobile receptionists.

### Receptionist View

```
┌──────────────────────────────────────────┐
│  OPD Queue  •  Open  •  Today            │
├──────────────┬───────────────────────────┤
│              │  Queue: 14 waiting         │
│   NOW        │  Avg wait: 8 mins          │
│  SERVING     ├───────────────────────────┤
│              │  A-103  Priya Sharma       │
│  A - 1 0 2   │  A-104  Rahul Mehta        │
│              │  A-105  [Walk-in]           │
│  Deepansh    │  A-106  Anjali Singh        │
│              │  ...                        │
├──────────────┴───────────────────────────┤
│  [ NEXT ]   [ SKIP ]   [ RECALL ]        │
│  [ + ADD WALK-IN ]   [ PAUSE QUEUE ]     │
└──────────────────────────────────────────┘
```

### Owner Dashboard

```
Today at City Clinic — Main Branch

  Visitors: 142     Completed: 128
  No-Shows: 9       Cancelled: 5

  Avg Wait: 11 min  Peak Hour: 10–11 AM

  [View Full Report]  [Export CSV]
```

---

## QR Code System

Each branch has a stable, permanent QR code:

```
noqueue.app/join/{branchSlug}
```

- Generated once on branch creation, stored as a URL (rendered client-side with `qr_flutter` / `qrcode` npm)
- Printed materials use this URL — it never changes even if branch details change
- Short URL is also shown for manual entry: `noqueue.app/j/xyz`

Placement: reception desk, waiting room, front door, parking area, business card.

---

## Infrastructure

### Environments

| Environment | Purpose                          | Database |
| ----------- | -------------------------------- | -------- |
| `local`     | Developer machine                | MongoDB Atlas free tier + Upstash free Redis |
| `staging`   | Pre-production, mirrors prod     | MongoDB Atlas shared tier + Upstash Pro |
| `production`| Live system                      | MongoDB Atlas (M10+) + Upstash Standard |

### Local Development Setup

```bash
# 1. Create MongoDB Atlas free cluster (M0)
# - Sign up at mongodb.com/cloud
# - Create cluster in your region
# - Copy connection string: mongodb+srv://user:pass@cluster.mongodb.net/noqueue

# 2. Create Upstash Redis free instance
# - Sign up at upstash.com
# - Copy Redis URL: redis://default:token@host:port

# 3. Set environment variables
cp api/.env.example api/.env
# Edit api/.env with your connection strings

# 4. Start dev server
npm run dev
```

### Cloud-First Architecture

All services use cloud providers — no local Docker required:

| Service      | Provider                 | Free Tier? |
| ------------ | ------------------------ | --------- |
| API          | Railway / Render / Fly.io | Yes (limited) |
| MongoDB      | MongoDB Atlas (M0)       | Yes (512MB) |
| Redis        | Upstash (free)           | Yes (10,000 cmds/day) |
| Files        | Cloudinary               | Yes (25GB/month) |
| FCM          | Firebase (free)          | Yes (unlimited) |
| WhatsApp     | Meta Cloud API           | No (pay-per-message) |
| Payments     | Razorpay                 | No (1.99% + fees) |
| Monitoring   | Sentry + UptimeRobot     | Yes (limited) |

All environment variables managed via `.env` files — never hardcoded. See `.env.example` for required variables.

---

## Feature Flags

Implemented from day one using a simple `FeatureFlag` collection in MongoDB. Staff/business can be enrolled in early-access features without a deploy.

```ts
{
  flag: "WHATSAPP_BOT",
  enabled: boolean,
  enabledFor: ObjectId[]   // businessIds or "ALL"
}
```

This allows:
- Rolling out WhatsApp bot to select clinics first
- A/B testing notification copy
- Disabling features per plan without code changes

---

## Monetization

### Plans

| Feature                  | Starter ₹499/mo | Professional ₹1499/mo | Enterprise ₹4999+/mo |
| ------------------------ | :-------------: | :-------------------: | :-------------------: |
| Branches                 | 1               | 3                     | Unlimited             |
| Tokens / month           | 500             | 3,000                 | Unlimited             |
| WhatsApp notifications   | ✗               | ✓                     | ✓                     |
| Analytics                | Basic           | Full                  | Full + Export         |
| WhatsApp Bot             | ✗               | ✗                     | ✓                     |
| Custom branding          | ✗               | ✗                     | ✓                     |
| Custom domain            | ✗               | ✗                     | ✓                     |
| Priority support         | ✗               | Email                 | Dedicated             |

- 14-day free trial, no card required
- Per-token overage: ₹0.50/token above plan limit
- Annual billing: 2 months free

### Payment Flow

- Razorpay for Indian market (UPI, cards, netbanking)
- `subscription` field on `Business` document is the source of truth
- `SubscriptionGuard` on protected routes checks plan limits before allowing action

---

## MVP Scope (Build First — Weeks 1–6)

### Week 1–2: Foundation ✅ COMPLETE

- [x] NestJS project setup, MongoDB, Redis configuration
- [x] Auth module: phone OTP login (Firebase) for customers, email+password for staff
- [x] RBAC guards (@Roles decorator) with 4 roles (CUSTOMER, RECEPTIONIST, OWNER, ADMIN)
- [x] Business CRUD (create, read, update, delete with owner tracking)
- [x] Branch CRUD (complete module with staff management, QR codes, opening hours)
- [x] Queue create / open / pause / close with status validation
- [x] Token join / call / skip / complete / emergency with position calculation
- [x] Service CRUD with pricing and categorization

### Week 3: Real-time + Notifications ✅ COMPLETE

- [x] REST API endpoints for token/queue status (GET /token/:id, GET /queue/:id/live)
- [x] FCM push notifications integrated into token state changes
- [x] Notification module with multi-channel support (FCM, WhatsApp, SMS, Email)
- [x] Notification audit logging (delivery status, retry tracking, provider responses)
- [x] WhatsApp Cloud API structure (ready for implementation, webhook receiver)
- [ ] BullMQ notification job processor (queued for Week 4)

### Week 4: Customer Flutter App + Job Queue

- [ ] BullMQ notification retry system with exponential backoff
- [ ] QR scan + join flow (UI skeleton exists)
- [ ] Token status screen with polling (REST endpoints ready)
- [ ] Push notification handling
- [ ] Profile + token history

### Week 5: Admin Flutter App

- [ ] Receptionist dashboard
- [ ] Call next / skip / recall / add walk-in
- [ ] Basic analytics screen

### Week 6: Polish + Pilot

- [ ] WhatsApp Bot conversational flows
- [ ] QR generation + print PDF export
- [ ] Error handling, loading states, offline detection
- [ ] Onboard 1 pilot business (clinic or salon)
- [ ] Monitoring: Sentry, UptimeRobot

---

## Post-MVP Roadmap

| Phase | Feature                                |
| ----- | -------------------------------------- |
| 7     | WhatsApp Bot (conversational join)     |
| 8     | Appointment booking (time-slot mode)   |
| 9     | Multi-language support (Hindi, Tamil)  |
| 10    | Business Owner mobile app              |
| 11    | Razorpay subscription billing          |
| 12    | Custom branding + white-label          |
| 13    | API access for enterprise integrations |
| 14    | Kiosk mode (tablet at front desk)      |
| 15    | AI-based EWT prediction (ML model)     |

---

## Key Decisions Log

| Decision                         | Choice                  | Reason                                                  |
| -------------------------------- | ----------------------- | ------------------------------------------------------- |
| Monolith vs microservices        | Modular monolith        | Speed to MVP; seams are correct so extraction is easy   |
| SQL vs NoSQL                     | MongoDB                 | Flexible schema suits multi-vertical queue configs      |
| Mobile framework                 | Flutter                 | Single codebase, Android + iOS + Web (admin)            |
| Real-time transport              | REST Polling + FCM/WhatsApp | Polling for status checks; push for critical events    |
| Notification queue               | BullMQ                  | Retry, delay, priority; no dropped notifications        |
| WhatsApp provider                | Meta Cloud API official | No middleman, reliable, required for production scale   |
| Payments                         | Razorpay                | Best UPI + Indian market support                        |
| API versioning                   | URL prefix `/api/v1/`   | Stable client contracts; v2 in parallel when needed     |
| Feature flags                    | DB-driven               | Enable/disable per business without deploys             |
