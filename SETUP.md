# NoQueue Development Setup

## Quick Start (Cloud-First)

### 1. Clone & Install

```bash
git clone <repo>
cd NoQueue
npm install -ws  # Install all workspaces
```

### 2. Set Up MongoDB Atlas (Free)

1. Go to [mongodb.com/cloud](https://mongodb.com/cloud)
2. Sign up (free account)
3. Create a cluster (M0 free tier, choose your region)
4. Click "Connect" → "Drivers" → Node.js
5. Copy the connection string
6. Replace `<password>` with your password
7. Add `/noqueue` before the query parameters

Example: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/noqueue?retryWrites=true&w=majority`

### 3. Set Up Redis (Upstash Free)

1. Go to [upstash.com](https://upstash.com)
2. Sign up (free account)
3. Create a Redis database (free tier)
4. Go to "Console" → Click your database
5. Copy the "Redis CLI" command → extract the Redis URL

Example: `redis://default:token@us1-happy-xxxxx.upstash.io:12345`

### 4. Set Up Firebase (Free)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Go to Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file locally

Extract these from the JSON:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (copy the entire key including `BEGIN PRIVATE KEY` and `END PRIVATE KEY`, replace newlines with `\n`)

### 5. Configure Environment

```bash
cd api
cp .env.example .env
```

Edit `.env` with your values from steps 2-4:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/noqueue?retryWrites=true&w=majority
REDIS_URL=redis://default:token@us1-happy-xxxxx.upstash.io:12345
JWT_SECRET=your_secret_here
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
PORT=3000
NODE_ENV=development
```

### 6. Start Development Server

```bash
npm run dev
```

API runs on `http://localhost:3000`
Swagger docs: `http://localhost:3000/api/docs`

## Architecture

- **Backend**: NestJS + MongoDB + Redis
- **Customer App**: Flutter (Android + iOS)
- **Admin App**: Flutter Web + Native
- **Real-time**: REST polling + FCM push notifications

## What's Implemented

| Component | Status | Notes |
|-----------|--------|-------|
| Auth (OTP + Password) | ✅ Complete | Firebase + email/password |
| Business & Branch | ✅ Complete | Full CRUD, owner tracking |
| Queue Management | ✅ Complete | Create, open, pause, close |
| Tokens | ✅ Complete | Join, call, skip, complete |
| Notifications | ✅ Complete | FCM logging, audit trail |
| BullMQ Jobs | ⏳ Next | Retry system for notifications |
| Flutter Apps | ⏳ Next | UI skeleton ready, API integration pending |
| WhatsApp Bot | ⏳ Week 4+ | Conversational flows |
| Analytics | ⏳ Week 5+ | Daily/hourly reports |

## Useful Commands

```bash
# Backend development
npm run dev              # Start with hot reload
npm run build           # Compile TypeScript
npm run start:prod      # Run compiled build

# Database
# MongoDB Atlas: https://cloud.mongodb.com/v2/...
# Upstash Redis: https://console.upstash.com/...

# Swagger API Docs
open http://localhost:3000/api/docs
```

## Troubleshooting

### "Cannot connect to MongoDB"
- Check `MONGODB_URI` in `.env`
- Verify IP is whitelisted in MongoDB Atlas (Network Access → Add Current IP)
- Test connection: `mongosh "your-connection-string"`

### "Failed to initialize Firebase"
- Ensure `FIREBASE_PRIVATE_KEY` has literal `\n` for newlines, not actual line breaks
- Check project ID matches your Firebase project
- Verify service account has necessary permissions

### "Duplicate schema index" warnings
- Harmless — happening in user schema during development
- Won't affect functionality

## Next Steps

1. Implement BullMQ notification job processor
2. Build customer Flutter app (QR scan, token tracking)
3. Build admin Flutter app (receptionist dashboard)
4. Integrate WhatsApp Cloud API
5. Deploy to production (Railway/Render)

For details, see [PLAN.md](./PLAN.md)
