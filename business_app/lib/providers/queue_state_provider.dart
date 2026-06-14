import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/token.dart';
import '../models/service.dart';
import '../services/api_service.dart';

class QueueState {
  final QueueSnapshot? queue;
  final TokenModel? serving;
  final List<TokenModel> waiting;
  final bool isLoading;
  final String? error;

  const QueueState({
    this.queue,
    this.serving,
    this.waiting = const [],
    this.isLoading = false,
    this.error,
  });

  QueueState copyWith({
    QueueSnapshot? queue,
    TokenModel? serving,
    bool clearServing = false,
    List<TokenModel>? waiting,
    bool? isLoading,
    String? error,
  }) {
    return QueueState(
      queue: queue ?? this.queue,
      serving: clearServing ? null : (serving ?? this.serving),
      waiting: waiting ?? this.waiting,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  int get emergencyCount => waiting.where((t) => t.isEmergency).length;
  int get normalCount => waiting.where((t) => !t.isEmergency).length;
}

class QueueStateNotifier extends Notifier<QueueState> {
  final _api = ApiService();

  @override
  QueueState build() => const QueueState();

  // Called with branchId from registration provider
  Future<void> loadQueue(String branchId) async {
    if (branchId.isEmpty) return;
    state = state.copyWith(isLoading: true, error: null);
    try {
      final queueData = await _api.getQueueByBranchId(branchId);
      final queueId = queueData['_id'] as String;

      final tokensData = await _api.getQueueTokens(
        queueId,
        status: ['WAITING', 'CALLED'],
      );

      final services = _parseServices(queueData['services'] as List<dynamic>? ?? []);
      final snapshot = QueueSnapshot(
        id: queueId,
        name: queueData['name'] as String? ?? '',
        prefix: queueData['prefix'] as String? ?? 'A',
        waitingCount: queueData['waitingCount'] as int? ?? 0,
        averageServiceTime: queueData['averageServiceTime'] as int? ?? 10,
        allowEmergencyTokens: (queueData['settings'] as Map<String, dynamic>?)?['allowEmergencyTokens'] as bool? ?? true,
        services: services,
      );

      final allTokens = tokensData.map((t) => _tokenFromJson(t as Map<String, dynamic>)).toList();
      final serving = allTokens.where((t) => t.status == TokenStatus.called).firstOrNull;
      final waiting = allTokens.where((t) => t.status == TokenStatus.waiting).toList();

      state = state.copyWith(
        isLoading: false,
        queue: snapshot,
        serving: serving,
        waiting: waiting,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> refreshQueue() async {
    final queueId = state.queue?.id;
    if (queueId == null) return;
    try {
      final tokensData = await _api.getQueueTokens(
        queueId,
        status: ['WAITING', 'CALLED'],
      );
      final allTokens = tokensData.map((t) => _tokenFromJson(t as Map<String, dynamic>)).toList();
      final serving = allTokens.where((t) => t.status == TokenStatus.called).firstOrNull;
      final waiting = allTokens.where((t) => t.status == TokenStatus.waiting).toList();
      state = state.copyWith(serving: serving, waiting: waiting);
    } catch (e) {
      debugPrint('refreshQueue error: $e');
    }
  }

  Future<void> callNext() async {
    final nextToken = state.waiting.isNotEmpty ? state.waiting.first : null;
    if (nextToken == null) return;

    state = state.copyWith(isLoading: true);
    try {
      final data = await _api.callToken(nextToken.id);
      final calledToken = _tokenFromJson(data);
      final updatedWaiting = state.waiting.where((t) => t.id != nextToken.id).toList();
      state = state.copyWith(
        isLoading: false,
        serving: calledToken,
        waiting: updatedWaiting,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> completeToken({int? finalAmount, ChargeStatus? chargeStatus}) async {
    final current = state.serving;
    if (current == null) return;

    state = state.copyWith(isLoading: true);
    try {
      if (current.hasCharge && chargeStatus != null) {
        await _api.updateCharge(current.id, {
          'finalAmount': chargeStatus == ChargeStatus.waived ? null : finalAmount,
          'status': chargeStatus == ChargeStatus.waived ? 'WAIVED' : 'CONFIRMED',
        });
      }
      await _api.completeToken(current.id);
      state = state.copyWith(isLoading: false, clearServing: true);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> skipCurrent() async {
    final current = state.serving;
    if (current == null) return;

    state = state.copyWith(isLoading: true);
    try {
      await _api.skipToken(current.id);
      state = state.copyWith(isLoading: false, clearServing: true);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> recallCurrent() async {
    final current = state.serving;
    if (current == null) return;

    state = state.copyWith(isLoading: true);
    try {
      await _api.recallToken(current.id);
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> addWalkIn({
    required String name,
    String? phone,
    String? serviceId,
    String? serviceName,
  }) async {
    final queueId = state.queue?.id;
    if (queueId == null) return;

    state = state.copyWith(isLoading: true);
    try {
      await _api.joinQueue({
        'queueId': queueId,
        'customer': {'name': name, 'phone': phone},
        if (serviceId != null) 'serviceId': serviceId,
      });
      await refreshQueue();
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> addEmergencyToken({
    required String name,
    String? phone,
    String? serviceId,
    String? serviceName,
    required String reason,
  }) async {
    final queueId = state.queue?.id;
    if (queueId == null) return;

    state = state.copyWith(isLoading: true);
    try {
      await _api.createEmergencyToken({
        'queueId': queueId,
        'customer': {'name': name, 'phone': phone},
        if (serviceId != null) 'serviceId': serviceId,
        'reason': reason,
      });
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  // ─── Parsing helpers ─────────────────────────────────────────────────────────

  TokenModel _tokenFromJson(Map<String, dynamic> j) {
    final customer = j['customer'] as Map<String, dynamic>? ?? {};
    final serviceSnap = j['service'] as Map<String, dynamic>?;
    final chargeMap = j['charge'] as Map<String, dynamic>?;

    return TokenModel(
      id: (j['_id'] ?? j['id']) as String,
      queueId: j['queueId'] as String? ?? '',
      displayToken: j['displayToken'] as String? ?? '',
      customerName: customer['name'] as String? ?? '',
      customerPhone: customer['phone'] as String?,
      status: _parseStatus(j['status'] as String? ?? ''),
      priority: (j['priority'] as String?) == 'EMERGENCY'
          ? TokenPriority.emergency
          : TokenPriority.normal,
      priorityReason: j['priorityReason'] as String?,
      position: j['position'] as int? ?? 0,
      estimatedWaitMinutes: j['estimatedWaitMinutes'] as int? ?? 0,
      service: serviceSnap != null
          ? TokenServiceSnapshot(
              serviceId: serviceSnap['serviceId'] as String?,
              name: serviceSnap['name'] as String?,
              code: serviceSnap['code'] as String?,
              estimatedDuration: serviceSnap['estimatedDuration'] as int?,
            )
          : null,
      charge: chargeMap != null
          ? ChargeInfo(
              defaultAmount: chargeMap['defaultAmount'] as int? ?? 0,
              finalAmount: chargeMap['finalAmount'] as int?,
              isEditable: true,
              status: _parseChargeStatus(chargeMap['status'] as String? ?? ''),
            )
          : null,
      joinedAt: DateTime.tryParse(j['joinedAt'] as String? ?? '') ?? DateTime.now(),
    );
  }

  TokenStatus _parseStatus(String s) {
    switch (s) {
      case 'CALLED': return TokenStatus.called;
      case 'IN_PROGRESS': return TokenStatus.inProgress;
      case 'COMPLETED': return TokenStatus.completed;
      case 'SKIPPED': return TokenStatus.skipped;
      case 'CANCELLED': return TokenStatus.cancelled;
      case 'NO_SHOW': return TokenStatus.noShow;
      default: return TokenStatus.waiting;
    }
  }

  ChargeStatus _parseChargeStatus(String s) {
    switch (s) {
      case 'CONFIRMED': return ChargeStatus.confirmed;
      case 'WAIVED': return ChargeStatus.waived;
      default: return ChargeStatus.pending;
    }
  }

  List<ServiceModel> _parseServices(List<dynamic> list) {
    return list.map((s) {
      final m = s as Map<String, dynamic>;
      final charge = m['charge'] as Map<String, dynamic>? ?? {};
      return ServiceModel(
        id: (m['_id'] ?? m['id']) as String,
        businessId: m['businessId'] as String? ?? '',
        name: m['name'] as String? ?? '',
        code: m['code'] as String? ?? '',
        category: ServiceCategory.consultation,
        charge: ServiceCharge(
          amount: charge['amount'] as int? ?? 0,
          isEditable: charge['isEditable'] as bool? ?? true,
          minAmount: charge['minAmount'] as int?,
          maxAmount: charge['maxAmount'] as int?,
        ),
        estimatedDuration: m['estimatedDuration'] as int? ?? 0,
      );
    }).toList();
  }
}

final queueStateProvider =
    NotifierProvider<QueueStateNotifier, QueueState>(QueueStateNotifier.new);
