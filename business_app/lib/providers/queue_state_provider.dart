import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/token.dart';
import '../models/service.dart';

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

  int get emergencyCount =>
      waiting.where((t) => t.isEmergency).length;

  int get normalCount =>
      waiting.where((t) => !t.isEmergency).length;
}

class QueueStateNotifier extends Notifier<QueueState> {
  @override
  QueueState build() => const QueueState();

  Future<void> loadQueue(String queueId) async {
    state = state.copyWith(isLoading: true, error: null);
    await Future.delayed(const Duration(milliseconds: 700));

    // Mock — swap with: GET /api/v1/token/queue/:queueId?status=WAITING,CALLED
    final mockQueue = QueueSnapshot(
      id: queueId,
      name: 'OPD Queue',
      prefix: 'A',
      waitingCount: 14,
      averageServiceTime: 8,
      allowEmergencyTokens: true,
      services: [
        ServiceModel(
          id: 'svc_001',
          businessId: 'biz_mock',
          name: 'General Consultation',
          code: 'GEN',
          category: ServiceCategory.consultation,
          charge: const ServiceCharge(amount: 30000),
          estimatedDuration: 15,
        ),
        ServiceModel(
          id: 'svc_002',
          businessId: 'biz_mock',
          name: 'Follow-up',
          code: 'FUP',
          category: ServiceCategory.consultation,
          charge: const ServiceCharge(amount: 15000),
          estimatedDuration: 10,
        ),
        ServiceModel(
          id: 'svc_003',
          businessId: 'biz_mock',
          name: 'Blood Test',
          code: 'BT',
          category: ServiceCategory.diagnostics,
          charge: const ServiceCharge(amount: 50000),
          estimatedDuration: 20,
        ),
      ],
    );

    state = state.copyWith(
      isLoading: false,
      queue: mockQueue,
      serving: _mockServing(),
      waiting: _mockWaiting(),
    );
  }

  Future<void> callNext() async {
    final nextToken = state.waiting.isNotEmpty ? state.waiting.first : null;
    if (nextToken == null) return;

    state = state.copyWith(isLoading: true);
    await Future.delayed(const Duration(milliseconds: 400));

    // Mock — swap with: PATCH /api/v1/token/:id/complete (current) then front-end re-fetches
    final updatedWaiting = state.waiting.skip(1).toList();
    final calledToken = nextToken.copyWith(status: TokenStatus.called);

    state = state.copyWith(
      isLoading: false,
      serving: calledToken,
      waiting: _reposition(updatedWaiting),
    );
  }

  Future<void> skipCurrent() async {
    final current = state.serving;
    if (current == null) return;

    state = state.copyWith(isLoading: true);
    await Future.delayed(const Duration(milliseconds: 300));

    // Mock — swap with: PATCH /api/v1/queue/:id/skip
    state = state.copyWith(
      isLoading: false,
      clearServing: true,
      waiting: _reposition(state.waiting),
    );
  }

  Future<void> recallCurrent() async {
    final current = state.serving;
    if (current == null) return;

    state = state.copyWith(isLoading: true);
    await Future.delayed(const Duration(milliseconds: 300));

    // Recall just re-emits the called event — no state change needed
    state = state.copyWith(isLoading: false);
  }

  Future<void> addWalkIn({
    required String name,
    String? phone,
    String? serviceId,
    String? serviceName,
  }) async {
    state = state.copyWith(isLoading: true);
    await Future.delayed(const Duration(milliseconds: 500));

    // Mock — swap with: POST /api/v1/token/join
    final existing = state.waiting;
    final tokenNum = 103 + existing.length;
    final newToken = TokenModel(
      id: 'tok_${DateTime.now().millisecondsSinceEpoch}',
      queueId: state.queue?.id ?? '',
      displayToken: '${state.queue?.prefix ?? "A"}-$tokenNum',
      customerName: name,
      customerPhone: phone,
      status: TokenStatus.waiting,
      priority: TokenPriority.normal,
      position: existing.length + 1,
      estimatedWaitMinutes: (existing.length + 1) * (state.queue?.averageServiceTime ?? 8),
      service: serviceId != null
          ? TokenServiceSnapshot(
              serviceId: serviceId,
              name: serviceName,
              code: null,
              estimatedDuration: null,
            )
          : null,
      joinedAt: DateTime.now(),
    );

    state = state.copyWith(
      isLoading: false,
      waiting: [...existing, newToken],
    );
  }

  Future<void> addEmergencyToken({
    required String name,
    String? phone,
    String? serviceId,
    String? serviceName,
    required String reason,
  }) async {
    state = state.copyWith(isLoading: true);
    await Future.delayed(const Duration(milliseconds: 500));

    // Mock — swap with: POST /api/v1/token/emergency
    final existing = state.waiting;
    final emergencyCount =
        existing.where((t) => t.isEmergency).length + 1;
    final displayToken = 'E-${emergencyCount.toString().padLeft(3, '0')}';

    final newToken = TokenModel(
      id: 'tok_emg_${DateTime.now().millisecondsSinceEpoch}',
      queueId: state.queue?.id ?? '',
      displayToken: displayToken,
      customerName: name,
      customerPhone: phone,
      status: TokenStatus.waiting,
      priority: TokenPriority.emergency,
      priorityReason: reason,
      position: 1,
      estimatedWaitMinutes: state.queue?.averageServiceTime ?? 8,
      service: serviceId != null
          ? TokenServiceSnapshot(
              serviceId: serviceId,
              name: serviceName,
              code: null,
              estimatedDuration: null,
            )
          : null,
      joinedAt: DateTime.now(),
    );

    // Emergency token goes to front; recalculate positions
    final withNew = [newToken, ...existing];
    state = state.copyWith(
      isLoading: false,
      waiting: _reposition(withNew),
    );
  }

  List<TokenModel> _reposition(List<TokenModel> tokens) {
    final sorted = [...tokens]..sort((a, b) {
        if (a.priority != b.priority) {
          return a.isEmergency ? -1 : 1;
        }
        return a.joinedAt.compareTo(b.joinedAt);
      });

    final avgTime = state.queue?.averageServiceTime ?? 8;
    return sorted.asMap().entries.map((e) {
      return e.value.copyWith(
        position: e.key + 1,
        estimatedWaitMinutes: (e.key + 1) * avgTime,
      );
    }).toList();
  }

  TokenModel _mockServing() {
    return TokenModel(
      id: 'tok_current',
      queueId: 'q_001',
      displayToken: 'A-102',
      customerName: 'Priya Sharma',
      customerPhone: '+919876543210',
      status: TokenStatus.called,
      priority: TokenPriority.normal,
      position: 0,
      estimatedWaitMinutes: 0,
      service: const TokenServiceSnapshot(
        serviceId: 'svc_001',
        name: 'General Consultation',
        code: 'GEN',
        estimatedDuration: 15,
      ),
      joinedAt: DateTime.now().subtract(const Duration(minutes: 12)),
    );
  }

  List<TokenModel> _mockWaiting() {
    final now = DateTime.now();
    return [
      TokenModel(
        id: 'tok_003',
        queueId: 'q_001',
        displayToken: 'A-103',
        customerName: 'Anita Singh',
        status: TokenStatus.waiting,
        priority: TokenPriority.normal,
        position: 1,
        estimatedWaitMinutes: 8,
        service: const TokenServiceSnapshot(name: 'General Consultation', code: 'GEN'),
        joinedAt: now.subtract(const Duration(minutes: 30)),
      ),
      TokenModel(
        id: 'tok_004',
        queueId: 'q_001',
        displayToken: 'A-104',
        customerName: 'Rahul Mehta',
        status: TokenStatus.waiting,
        priority: TokenPriority.normal,
        position: 2,
        estimatedWaitMinutes: 16,
        service: const TokenServiceSnapshot(name: 'Follow-up', code: 'FUP'),
        joinedAt: now.subtract(const Duration(minutes: 25)),
      ),
      TokenModel(
        id: 'tok_005',
        queueId: 'q_001',
        displayToken: 'A-105',
        customerName: 'Walk-in',
        status: TokenStatus.waiting,
        priority: TokenPriority.normal,
        position: 3,
        estimatedWaitMinutes: 24,
        joinedAt: now.subtract(const Duration(minutes: 20)),
      ),
      TokenModel(
        id: 'tok_006',
        queueId: 'q_001',
        displayToken: 'A-106',
        customerName: 'Kavya Reddy',
        status: TokenStatus.waiting,
        priority: TokenPriority.normal,
        position: 4,
        estimatedWaitMinutes: 32,
        service: const TokenServiceSnapshot(name: 'Blood Test', code: 'BT'),
        joinedAt: now.subtract(const Duration(minutes: 15)),
      ),
    ];
  }
}

final queueStateProvider =
    NotifierProvider<QueueStateNotifier, QueueState>(QueueStateNotifier.new);
