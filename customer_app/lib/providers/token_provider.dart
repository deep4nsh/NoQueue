import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/models.dart';

// Current token being tracked
final currentTokenProvider = StateNotifierProvider<CurrentTokenNotifier, Token?>((ref) {
  return CurrentTokenNotifier();
});

class CurrentTokenNotifier extends StateNotifier<Token?> {
  CurrentTokenNotifier() : super(null);

  Future<void> joinQueue(String queueId, String name, String phone) async {
    // Mock API call — replace with actual API
    await Future.delayed(const Duration(seconds: 2));

    state = Token(
      id: 'token_789',
      queueId: queueId,
      tokenNumber: '102',
      displayToken: 'A-102',
      customerName: name,
      customerPhone: phone,
      status: 'WAITING',
      position: 9,
      estimatedWaitMinutes: 24,
      joinedAt: DateTime.now(),
    );
  }

  Future<void> fetchToken(String tokenId) async {
    // Mock API call
    await Future.delayed(const Duration(seconds: 1));

    if (state != null) {
      // Update with latest position
      state = Token(
        id: state!.id,
        queueId: state!.queueId,
        tokenNumber: state!.tokenNumber,
        displayToken: state!.displayToken,
        customerName: state!.customerName,
        customerPhone: state!.customerPhone,
        status: state!.status,
        position: (state!.position - 1).clamp(0, double.infinity).toInt(),
        estimatedWaitMinutes: (state!.estimatedWaitMinutes - 3).clamp(0, 999),
        joinedAt: state!.joinedAt,
        calledAt: state!.calledAt,
        completedAt: state!.completedAt,
      );
    }
  }

  Future<void> cancelToken() async {
    // Mock API call
    await Future.delayed(const Duration(seconds: 1));

    if (state != null) {
      state = Token(
        id: state!.id,
        queueId: state!.queueId,
        tokenNumber: state!.tokenNumber,
        displayToken: state!.displayToken,
        customerName: state!.customerName,
        customerPhone: state!.customerPhone,
        status: 'CANCELLED',
        position: state!.position,
        estimatedWaitMinutes: state!.estimatedWaitMinutes,
        joinedAt: state!.joinedAt,
        calledAt: state!.calledAt,
        completedAt: state!.completedAt,
      );
    }
  }

  void updateTokenStatus(String newStatus) {
    if (state != null) {
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
  }

  void reset() {
    state = null;
  }
}

// Token history
final tokenHistoryProvider = StateProvider<List<Token>>((ref) => []);

// Loading states
final tokenLoadingProvider = StateProvider<bool>((ref) => false);
final tokenErrorProvider = StateProvider<String?>((ref) => null);
