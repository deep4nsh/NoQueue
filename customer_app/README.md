# NoQueue Customer App

Flutter mobile application for customers to join queues, track position, and receive notifications.

## Project Structure

```
lib/
├── main.dart              # App entry point with Riverpod & GoRouter
├── models/
│   └── models.dart        # All data models (User, Queue, Token, Notification, etc.)
├── screens/
│   ├── splash_screen.dart
│   ├── login_screen.dart
│   ├── home_screen.dart
│   ├── qr_scan_screen.dart
│   └── join_queue_screen.dart
├── providers/
│   ├── auth_provider.dart
│   ├── queue_provider.dart
│   ├── token_provider.dart
│   └── notification_provider.dart
├── config/
│   └── router.dart        # GoRouter configuration
├── services/              # API clients, FCM (to be added)
├── widgets/               # Reusable UI components (to be added)
└── utils/                 # Helpers, validators, constants (to be added)
```

## Features Implemented

### Phase 1 (Current)

- [x] **Splash Screen** — Auto-login check, branding
- [x] **Auth Flow** — Phone OTP login (mocked)
- [x] **Home Screen** — Tabbed navigation (Home, History, Notifications, Profile)
- [x] **Queue Join Flow**
  - [x] QR scan (simulated)
  - [x] Queue preview
  - [x] Join with customer details
- [x] **Token Tracking** — Live position, wait time, progress bar
- [x] **Notifications** — List and mark as read
- [x] **Profile** — User info, logout
- [x] **State Management** — Riverpod providers with mock data

### Phase 2 (Next)

- [ ] Real API integration (replace mock calls)
- [ ] Polling for real-time token/queue updates
- [ ] Firebase Cloud Messaging (FCM) push notifications
- [ ] Mobile Scanner (QR scanning with camera)
- [ ] Secure token storage
- [ ] Offline mode detection

## Getting Started

### Prerequisites

- Flutter 3.10+
- Dart 3.0+
- iOS 12.0+ / Android API 21+

### Installation

```bash
cd customer_app
flutter pub get
```

### Run

```bash
# Development (hot reload enabled)
flutter run

# Release build
flutter build apk --release     # Android
flutter build ios --release     # iOS
```

## Mock Data Flow

All API calls are mocked with `await Future.delayed()` to simulate network latency. Replace these in:
- `lib/providers/auth_provider.dart` → login/logout
- `lib/providers/queue_provider.dart` → queue fetch
- `lib/providers/token_provider.dart` → join/cancel token
- `lib/providers/notification_provider.dart` → fetch notifications

## API Contracts (to be implemented)

See `/Users/deepansh/NoQueue/PLAN.md` for full API specifications.

### Key Endpoints

```
POST   /api/v1/auth/send-otp
POST   /api/v1/auth/verify-otp
GET    /api/v1/queue/:id/live
POST   /api/v1/token/join
GET    /api/v1/token/:id
PATCH  /api/v1/token/:id/cancel
GET    /api/v1/notification
```

## State Management (Riverpod)

- **Auth**: `currentUserProvider`, `isAuthenticatedProvider`
- **Queue**: `queueProvider`, `selectedQueueIdProvider`
- **Token**: `currentTokenProvider`, `tokenHistoryProvider`
- **Notifications**: `notificationsProvider`, `unreadCountProvider`

All providers are mutable via `StateNotifier` — easy to swap with real API calls.

## Navigation (GoRouter)

Routes are centralized in `lib/config/router.dart`:
- `/splash` → Splash
- `/login` → Login
- `/home` → Home (main)
- `/scan-qr` → QR scanner
- `/join-queue` → Join flow
- `/queue-list` → Queue browser (placeholder)
- `/track-token` → Token tracker (placeholder)

## Styling

- **Theme**: Material 3 with blue accent color
- **Responsive**: Works on phones (320dp) to tablets (800dp+)

## Next Steps

1. **Set up backend API** (NestJS + MongoDB)
2. **Create API client service** (`lib/services/api_client.dart`)
3. **Replace mock calls** with real HTTP calls
4. **Configure Firebase** for push notifications
5. **Test on device** (Android + iOS)
6. **Pilot with first clinic/salon**

## Dependencies

See `pubspec.yaml` for the full list. Key packages:
- `flutter_riverpod` — State management
- `go_router` — Navigation
- `dio` — HTTP client (to be used)
- `firebase_messaging` — Push notifications (to be used)
- `mobile_scanner` — QR code scanning (to be used)
