import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/models.dart';

// Mock queue data
final queueProvider = StateNotifierProvider<QueueNotifier, Queue?>((ref) {
  return QueueNotifier();
});

class QueueNotifier extends StateNotifier<Queue?> {
  QueueNotifier() : super(null);

  Future<void> fetchQueueByBranch(String branchSlug) async {
    // Mock API call — replace with actual API
    await Future.delayed(const Duration(seconds: 1));
    state = Queue(
      id: '1',
      branchId: 'branch_123',
      name: 'General OPD',
      prefix: 'A',
      currentToken: 94,
      lastTokenIssued: 102,
      averageServiceTime: 8,
      status: 'OPEN',
      waitingCount: 8,
    );
  }

  Future<void> joinQueue(String queueId, String customerName, String customerPhone) async {
    // Mock API call
    await Future.delayed(const Duration(seconds: 1));
    // State remains the same for now
  }

  void updateQueueState(Queue updatedQueue) {
    state = updatedQueue;
  }

  void reset() {
    state = null;
  }
}

// Queue preview data (before joining)
final queuePreviewProvider = StateProvider<Queue?>((ref) => null);

// Selected queue ID (after joining)
final selectedQueueIdProvider = StateProvider<String?>((ref) => null);
