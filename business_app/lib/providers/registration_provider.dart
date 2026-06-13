import 'package:flutter_riverpod/flutter_riverpod.dart';

class RegistrationState {
  final String businessId;
  final String businessName;
  final String branchName;
  final String branchSlug;

  const RegistrationState({
    this.businessId = '',
    this.businessName = '',
    this.branchName = '',
    this.branchSlug = '',
  });

  RegistrationState copyWith({
    String? businessId,
    String? businessName,
    String? branchName,
    String? branchSlug,
  }) {
    return RegistrationState(
      businessId: businessId ?? this.businessId,
      businessName: businessName ?? this.businessName,
      branchName: branchName ?? this.branchName,
      branchSlug: branchSlug ?? this.branchSlug,
    );
  }
}

class RegistrationNotifier extends Notifier<RegistrationState> {
  @override
  RegistrationState build() => const RegistrationState();

  void setBusiness({required String id, required String name}) {
    state = state.copyWith(businessId: id, businessName: name);
  }

  void setBusinessName(String name) {
    state = state.copyWith(businessName: name);
  }

  void setBranch({required String name, required String slug}) {
    state = state.copyWith(branchName: name, branchSlug: slug);
  }
}

final registrationProvider =
    NotifierProvider<RegistrationNotifier, RegistrationState>(
  RegistrationNotifier.new,
);
