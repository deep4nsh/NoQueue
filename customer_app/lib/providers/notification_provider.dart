import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/models.dart';

// Notifications list
final notificationsProvider = StateNotifierProvider<NotificationsNotifier, List<QueueNotification>>((ref) {
  return NotificationsNotifier();
});

class NotificationsNotifier extends StateNotifier<List<QueueNotification>> {
  NotificationsNotifier() : super([]);

  Future<void> fetchNotifications() async {
    // Mock API call
    await Future.delayed(const Duration(seconds: 1));

    state = [
      QueueNotification(
        id: '1',
        tokenId: 'token_789',
        channel: 'WHATSAPP',
        event: 'TOKEN_JOINED',
        message: 'Your token A-102 has been created. 8 people ahead.',
        sentAt: DateTime.now().subtract(const Duration(minutes: 5)),
        read: true,
      ),
      QueueNotification(
        id: '2',
        tokenId: 'token_789',
        channel: 'FCM',
        event: 'APPROACHING',
        message: 'Only 3 people ahead! Please be ready.',
        sentAt: DateTime.now().subtract(const Duration(minutes: 2)),
        read: false,
      ),
    ];
  }

  void markAsRead(String notificationId) {
    state = [
      for (final notif in state)
        if (notif.id == notificationId)
          QueueNotification(
            id: notif.id,
            tokenId: notif.tokenId,
            channel: notif.channel,
            event: notif.event,
            message: notif.message,
            sentAt: notif.sentAt,
            read: true,
          )
        else
          notif,
    ];
  }

  void addNotification(QueueNotification notification) {
    state = [notification, ...state];
  }

  void clearAll() {
    state = [];
  }

  int get unreadCount => state.where((n) => !n.read).length;
}

// Unread count provider
final unreadCountProvider = Provider<int>((ref) {
  return ref.watch(notificationsProvider).where((n) => !n.read).length;
});
