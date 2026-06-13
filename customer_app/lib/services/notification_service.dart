import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

// Top-level function required by Firebase for background/terminated messages.
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('[FCM] Background message: ${message.notification?.title}');
}

class NotificationService {
  static const _channelId = 'noqueue_customer';
  static const _channelName = 'NoQueue Queue Alerts';

  static final _plugin = FlutterLocalNotificationsPlugin();

  static Future<void> initialize({
    required void Function(RemoteMessage message) onTap,
    void Function(RemoteMessage message)? onForeground,
  }) async {
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

    await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    await _plugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(
          const AndroidNotificationChannel(
            _channelId,
            _channelName,
            description: 'Your queue position and turn notifications',
            importance: Importance.high,
          ),
        );

    await FirebaseMessaging.instance.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );

    await _plugin.initialize(
      settings: const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
        iOS: DarwinInitializationSettings(),
      ),
    );

    FirebaseMessaging.onMessage.listen((message) {
      _showLocal(message);
      onForeground?.call(message);
    });
    FirebaseMessaging.onMessageOpenedApp.listen(onTap);

    final initial = await FirebaseMessaging.instance.getInitialMessage();
    if (initial != null) onTap(initial);
  }

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
