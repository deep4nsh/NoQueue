import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

// Must be a top-level function — Firebase runs this in an isolate when the app is terminated.
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // No UI access here. In production: write to local DB / shared prefs.
  debugPrint('[FCM] Background message: ${message.notification?.title}');
}

class NotificationService {
  static const _channelId = 'noqueue_business';
  static const _channelName = 'NoQueue Business Alerts';

  static final _plugin = FlutterLocalNotificationsPlugin();

  static Future<void> initialize({
    required void Function(RemoteMessage message) onTap,
  }) async {
    // Register background/terminated handler before anything else.
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

    // Request permission (iOS prompts; Android 13+ prompts via POST_NOTIFICATIONS).
    await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // Create high-importance Android channel so heads-up notifications appear.
    await _plugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(
          const AndroidNotificationChannel(
            _channelId,
            _channelName,
            description: 'Token and queue activity alerts for business staff',
            importance: Importance.high,
          ),
        );

    // iOS: show FCM notification banners even when the app is open.
    await FirebaseMessaging.instance.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );

    // Initialise flutter_local_notifications (used for foreground FCM messages).
    await _plugin.initialize(
      settings: const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
        iOS: DarwinInitializationSettings(),
      ),
    );

    // Foreground FCM message → show a local notification manually.
    FirebaseMessaging.onMessage.listen(_showLocal);

    // User tapped a notification while the app was in the background.
    FirebaseMessaging.onMessageOpenedApp.listen(onTap);

    // User tapped a notification that launched the app from terminated state.
    final initial = await FirebaseMessaging.instance.getInitialMessage();
    if (initial != null) onTap(initial);
  }

  /// Returns the device FCM token. Send this to your backend to target this device.
  static Future<String?> getToken() => FirebaseMessaging.instance.getToken();

  static void _showLocal(RemoteMessage message) {
    final n = message.notification;
    if (n == null) return;

    _plugin.show(
      id: n.hashCode,
      title: n.title,
      body: n.body,
      notificationDetails: const NotificationDetails(
        android: AndroidNotificationDetails(
          _channelId,
          _channelName,
          icon: '@mipmap/ic_launcher',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(),
      ),
    );
  }
}
