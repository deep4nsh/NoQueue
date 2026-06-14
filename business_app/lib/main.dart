import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'config/router.dart';
import 'firebase_options.dart';
import 'services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    if (Firebase.apps.isEmpty) {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
    }
  } catch (e) {
    // Firebase already initialized, continue
  }
  await NotificationService.initialize(onTap: _handleNotificationTap);
  runApp(const ProviderScope(child: BusinessApp()));
}

void _handleNotificationTap(RemoteMessage message) {
  final type = message.data['type'] as String? ?? '';
  switch (type) {
    case 'TOKEN_JOINED':
    case 'EMERGENCY_TOKEN':
    case 'QUEUE_UPDATE':
      appRouter.go('/receptionist');
    default:
      appRouter.go('/branch-dashboard');
  }
}

class BusinessApp extends StatelessWidget {
  const BusinessApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'NoQueue Business',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blueAccent),
        inputDecorationTheme: const InputDecorationTheme(
          border: OutlineInputBorder(),
        ),
      ),
      routerConfig: appRouter,
    );
  }
}
