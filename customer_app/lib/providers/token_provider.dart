import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';

final currentTokenProvider =
    StateNotifierProvider<CurrentTokenNotifier, Token?>((ref) {
  return CurrentTokenNotifier();
});

class CurrentTokenNotifier extends StateNotifier<Token?> {
  CurrentTokenNotifier() : super(null);

  final _api = ApiService();
  final _socket = SocketService();

  Future<void> joinQueue(String queueId, String name, String phone) async {
    final data = await _api.joinQueue({
      'queueId': queueId,
      'customer': {'name': name, 'phone': phone},
    });
    state = _fromJson(data);

    // Subscribe to socket room so we get called/queue:refresh events
    _subscribeSocket(queueId, state!.id);
  }

  Future<void> fetchToken(String tokenId) async {
    final data = await _api.getToken(tokenId);
    state = _fromJson(data);
    // Leave queue room if token reached a terminal state
    if (state != null &&
        ['COMPLETED', 'SKIPPED', 'CANCELLED', 'NO_SHOW'].contains(state!.status)) {
      _socket.leaveQueue();
    }
  }

  Future<void> cancelToken() async {
    if (state == null) return;
    final data = await _api.cancelToken(state!.id);
    state = _fromJson(data);
    _socket.leaveQueue();
  }

  void updateTokenStatus(String newStatus) {
    if (state == null) return;
    state = Token(
      id: state!.id,
      queueId: state!.queueId,
      tokenNumber: state!.tokenNumber,
      displayToken: state!.displayToken,
      customerName: state!.customerName,
      customerPhone: state!.customerPhone,
      status: newStatus,
      position: state!.position,
      estimatedWaitMinutes: state!.estimatedWaitMinutes,
      joinedAt: state!.joinedAt,
      calledAt: newStatus == 'CALLED' ? DateTime.now() : state!.calledAt,
      completedAt: state!.completedAt,
    );
  }

  void reset() {
    _socket.leaveQueue();
    state = null;
  }

  void _subscribeSocket(String queueId, String myTokenId) {
    _socket.off('token:called');
    _socket.off('queue:refresh');
    _socket.joinQueue(queueId);

    // When our specific token is called, update status
    _socket.on('token:called', (data) {
      if (data is Map && data['tokenId'] == myTokenId) {
        updateTokenStatus('CALLED');
      }
    });

    // On any queue change, refresh our token position
    _socket.on('queue:refresh', (_) {
      if (state != null) fetchToken(state!.id);
    });
  }

  Token _fromJson(Map<String, dynamic> j) {
    final customer = j['customer'] as Map<String, dynamic>? ?? {};
    return Token(
      id: (j['_id'] ?? j['id']) as String,
      queueId: j['queueId'] as String? ?? '',
      tokenNumber: j['tokenNumber']?.toString() ?? '',
      displayToken: j['displayToken'] as String? ?? '',
      customerName: customer['name'] as String? ?? '',
      customerPhone: customer['phone'] as String? ?? '',
      status: j['status'] as String? ?? 'WAITING',
      position: j['position'] as int? ?? 0,
      estimatedWaitMinutes: j['estimatedWaitMinutes'] as int? ?? 0,
      joinedAt: DateTime.tryParse(j['joinedAt'] as String? ?? '') ?? DateTime.now(),
      calledAt: j['calledAt'] != null
          ? DateTime.tryParse(j['calledAt'] as String)
          : null,
      completedAt: j['completedAt'] != null
          ? DateTime.tryParse(j['completedAt'] as String)
          : null,
    );
  }
}

final tokenHistoryProvider = StateProvider<List<Token>>((ref) => []);
final tokenLoadingProvider = StateProvider<bool>((ref) => false);
final tokenErrorProvider = StateProvider<String?>((ref) => null);
