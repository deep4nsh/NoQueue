import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../screens/splash_screen.dart';
import '../screens/login_screen.dart';
import '../screens/home_screen.dart';
import '../screens/qr_scan_screen.dart';
import '../screens/join_queue_screen.dart';
import '../screens/otp_screen.dart';
import '../screens/link_phone_screen.dart';
import '../screens/edit_profile_screen.dart';
import '../models/models.dart';

final appRouter = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(
      path: '/splash',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/otp',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>?;
        final verificationId = extra?['verificationId'] as String? ?? '';
        final phoneNumber = extra?['phoneNumber'] as String? ?? '';
        return OtpScreen(verificationId: verificationId, phoneNumber: phoneNumber);
      },
    ),
    GoRoute(
      path: '/link-phone',
      builder: (context, state) => const LinkPhoneScreen(),
    ),
    GoRoute(
      path: '/home',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/scan-qr',
      builder: (context, state) => const QrScanScreen(),
    ),
    GoRoute(
      path: '/edit-profile',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>?;
        final isSetup = extra?['isSetup'] as bool? ?? false;
        return EditProfileScreen(isSetup: isSetup);
      },
    ),
    GoRoute(
      path: '/join-queue',
      builder: (context, state) {
        final queue = state.extra as Queue?;
        if (queue == null) {
          return const SizedBox.shrink();
        }
        return JoinQueueScreen(queue: queue);
      },
    ),
    // Placeholder routes (to be implemented)
    GoRoute(
      path: '/queue-list',
      builder: (context, state) => const Placeholder(),
    ),
    GoRoute(
      path: '/track-token',
      builder: (context, state) => const Placeholder(),
    ),
  ],
  errorBuilder: (context, state) => Scaffold(
    appBar: AppBar(title: const Text('Error')),
    body: Center(
      child: Text('Route not found: ${state.matchedLocation}'),
    ),
  ),
);
