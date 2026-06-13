import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'config/router.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'theme/app_theme.dart';
import 'services/notification_service.dart';
import 'providers/notification_provider.dart';
import 'models/models.dart';

// Single container shared between notification handlers (outside widget tree) and the app.
final _container = ProviderContainer();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  await NotificationService.initialize(
    onTap: _handleNotificationTap,
    onForeground: _addToAlerts,
  );
  runApp(UncontrolledProviderScope(container: _container, child: const MyApp()));
}

void _handleNotificationTap(RemoteMessage message) {
  appRouter.go('/home');
}

void _addToAlerts(RemoteMessage message) {
  final n = message.notification;
  if (n == null) return;
  _container.read(notificationsProvider.notifier).addNotification(
    QueueNotification(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      tokenId: message.data['tokenId'] as String? ?? '',
      channel: 'FCM',
      event: message.data['type'] as String? ?? 'UPDATE',
      message: n.body ?? n.title ?? '',
      sentAt: DateTime.now(),
      read: false,
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'NoQueue',
      theme: AppTheme.lightTheme,
      routerConfig: appRouter,
    );
  }
}
