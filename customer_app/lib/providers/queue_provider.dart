import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/models.dart';
import '../services/api_service.dart';

final queueProvider = StateNotifierProvider<QueueNotifier, Queue?>((ref) {
  return QueueNotifier();
});

class QueueNotifier extends StateNotifier<Queue?> {
  QueueNotifier() : super(null);

  final _api = ApiService();

  Future<void> fetchQueueById(String queueId) async {
    final data = await _api.getQueueById(queueId);
    state = _fromJson(data);
  }

  void updateQueueState(Queue updatedQueue) {
    state = updatedQueue;
  }

  void reset() {
    state = null;
  }

  Queue _fromJson(Map<String, dynamic> j) {
    return Queue(
      id: (j['_id'] ?? j['id']) as String,
      branchId: j['branchId'] as String? ?? '',
      name: j['name'] as String? ?? '',
      prefix: j['prefix'] as String? ?? 'A',
      currentToken: j['currentToken'] as int? ?? 0,
      lastTokenIssued: j['lastTokenIssued'] as int? ?? 0,
      averageServiceTime: j['averageServiceTime'] as int? ?? 10,
      status: j['status'] as String? ?? 'OPEN',
      waitingCount: j['waitingCount'] as int? ?? 0,
    );
  }
}

// Queue preview shown before joining (populated from QR scan → fetch)
final queuePreviewProvider = StateProvider<Queue?>((ref) => null);

// The queueId the customer is currently in
final selectedQueueIdProvider = StateProvider<String?>((ref) => null);
