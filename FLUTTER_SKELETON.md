# Flutter UI Skeleton — Complete

## Status: ✅ Ready to Run

All screens, navigation, and state management are set up. App is ready to test locally.

---

## What Was Built

### 1. **Core App Setup** (`lib/main.dart`)
- Riverpod `ProviderScope` wrapper
- GoRouter navigation configuration
- Material 3 theme with blue accent

### 2. **Data Models** (`lib/models/models.dart`)
- `User` — customer profile
- `Branch` — clinic/salon location
- `Queue` — queue state (current token, wait count, EWT)
- `Token` — individual customer token (position, status, timestamps)
- `QueueNotification` — notification with event type
- `ApiResponse<T>` — standardized API response

### 3. **State Management** (Riverpod Providers)

| Provider                | Type           | Purpose                           |
| ----------------------- | -------------- | --------------------------------- |
| `currentUserProvider`   | StateNotifier  | Logged-in user, login/logout      |
| `isAuthenticatedProvider` | Computed     | Boolean guard                     |
| `queueProvider`         | StateNotifier  | Current queue state               |
| `currentTokenProvider`  | StateNotifier  | Active token, join/cancel         |
| `tokenHistoryProvider`  | State          | Past tokens list                  |
| `notificationsProvider` | StateNotifier  | Notification list, mark as read   |
| `unreadCountProvider`   | Computed       | Unread notification count         |

All providers use **mock data** with simulated 1–2 second latency. Ready to swap in real API calls.

### 4. **Screens** (6 total)

| Screen                | File                    | Purpose                                      |
| --------------------- | ----------------------- | -------------------------------------------- |
| Splash                | `splash_screen.dart`    | Logo + loading, auto-nav based on auth state |
| Login                 | `login_screen.dart`     | Phone OTP flow (2-step: send OTP → verify)   |
| Home (Main)           | `home_screen.dart`      | 4-tab nav (Home, History, Notifications, Profile) |
| QR Scan               | `qr_scan_screen.dart`   | Scan QR → show queue preview → confirm      |
| Join Queue            | `join_queue_screen.dart`| Enter name/phone → post to queue             |
| (Placeholders)        | —                       | Queue list browser, token tracker (routes defined, screens TODO) |

### 5. **Navigation** (`lib/config/router.dart`)

```
/splash
  ↓
/login (if not authenticated)
  ↓
/home (main app)
  ├── /scan-qr → /join-queue
  ├── /queue-list (placeholder)
  └── /track-token (placeholder)
```

Error route defined for 404 handling.

### 6. **Styling**
- Material 3 with blue theme (`Colors.blue[600]`)
- Rounded corners on inputs/buttons (8dp)
- Gradient headers
- Badge notification indicators
- Progress bar for queue position
- Icons from Material Design

---

## How to Run

```bash
cd /Users/deepansh/NoQueue/customer_app

# Install dependencies (already done)
flutter pub get

# Run on connected device / emulator
flutter run

# Run on specific platform
flutter run -d <device-id>  # Android
flutter run -d <device-id>  # iOS simulator
```

## Test Flow

1. **Splash** (2s) → Auto-navigates to Login
2. **Login**
   - Enter phone: `9876543210`
   - Tap "Send OTP"
   - Enter OTP: any 4 digits
   - Tap "Login" → navigates to Home
3. **Home Tab**
   - Tap "Scan & Join Queue"
   - Tap "Simulate Scan" → shows queue preview (City Clinic OPD)
   - Tap "Join Queue"
   - Enter name & phone → creates token A-102
   - Returns to Home, token card shows position, wait time, progress
4. **History Tab**
   - Shows past tokens (empty on first run)
5. **Notifications Tab**
   - Mock notifications about token being called
6. **Profile Tab**
   - User info + logout button

---

## Code Quality

- **No compilation errors** — dependencies installed, all imports valid
- **Consistent naming** — PascalCase for classes, camelCase for variables
- **Proper state management** — StateNotifier pattern for mutability
- **Type safety** — No dynamic types, all models typed
- **Responsive layout** — Padding, ScrollView, flexible widgets
- **Error handling** — SnackBars for user feedback (mock errors)

---

## Next Steps (Roadmap)

### 1. **Backend API** (NestJS)
   - Set up MongoDB + Redis
   - Implement `/api/v1/auth`, `/api/v1/token`, `/api/v1/queue` endpoints
   - Deploy to Railway / Render / Fly.io

### 2. **API Integration** (Flutter)
   - Create `lib/services/api_client.dart` (Dio-based HTTP)
   - Replace mock calls in providers with real API
   - Handle network errors, timeouts, retries

### 3. **Real-time Updates** (Polling)
   - Add polling timer in token status provider
   - Fetch queue/token status every 5-10 seconds
   - Display position + wait time updates

### 4. **Push Notifications** (FCM)
   - Configure Firebase in Xcode + Android Studio
   - Create `lib/services/notification_service.dart`
   - Show alerts when token is called, etc.

### 5. **QR Scanning** (mobile_scanner)
   - Replace `_mockScanQr()` with real camera
   - Decode QR URL pattern

### 6. **Remaining Screens**
   - Queue list browser (`/queue-list`)
   - Token tracker (`/track-token`)
   - Onboarding (first-launch tutorial)

---

## Architecture Notes

**Modular structure** — each layer is independent:
- **Models** — no dependencies, pure data
- **Providers** — depend only on models, easy to test
- **Screens** — depend on providers, no direct API calls
- **Router** — orchestrates screens, decoupled from logic

**Ready to scale** — when separating into microservices, each provider can be swapped for a service layer without changing screens.

---

## Files Summary

```
customer_app/
├── lib/
│   ├── main.dart                  (53 lines)
│   ├── models/
│   │   └── models.dart            (230 lines)
│   ├── screens/
│   │   ├── splash_screen.dart     (66 lines)
│   │   ├── login_screen.dart      (138 lines)
│   │   ├── home_screen.dart       (305 lines)
│   │   ├── qr_scan_screen.dart    (178 lines)
│   │   └── join_queue_screen.dart (173 lines)
│   ├── providers/
│   │   ├── auth_provider.dart     (42 lines)
│   │   ├── queue_provider.dart    (52 lines)
│   │   ├── token_provider.dart    (108 lines)
│   │   └── notification_provider.dart (70 lines)
│   └── config/
│       └── router.dart             (45 lines)
├── pubspec.yaml                   (updated with all deps)
└── README.md                       (updated)

Total: ~1,450 lines of Flutter code
```

---

## Test with Device

```bash
# See available devices
flutter devices

# Run on specific device
flutter run -d <device-name>

# Hot reload during development
r  (in terminal while app is running)
```

App will launch to Splash screen, auto-navigate based on auth state.

✅ **Skeleton complete. Ready to add backend and real integrations.**
