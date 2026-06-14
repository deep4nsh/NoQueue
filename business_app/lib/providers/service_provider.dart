import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/service.dart';
import '../services/api_service.dart';

class ServiceState {
  final List<ServiceModel> services;
  final bool isLoading;
  final String? error;

  const ServiceState({
    this.services = const [],
    this.isLoading = false,
    this.error,
  });

  ServiceState copyWith({
    List<ServiceModel>? services,
    bool? isLoading,
    String? error,
  }) {
    return ServiceState(
      services: services ?? this.services,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  Map<ServiceCategory, List<ServiceModel>> get groupedByCategory {
    final grouped = <ServiceCategory, List<ServiceModel>>{};
    for (final cat in ServiceCategory.values) {
      grouped[cat] = [];
    }
    for (final s in services) {
      grouped[s.category]!.add(s);
    }
    grouped.removeWhere((_, list) => list.isEmpty);
    return grouped;
  }
}

class ServiceNotifier extends Notifier<ServiceState> {
  final _api = ApiService();

  @override
  ServiceState build() => const ServiceState();

  Future<void> loadServices(String businessId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final data = await _api.getServices(businessId);
      state = state.copyWith(
        isLoading: false,
        services: data.map((s) => _fromJson(s as Map<String, dynamic>)).toList(),
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> addService(ServiceModel service) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final data = await _api.createService(_toJson(service));
      final created = _fromJson(data);
      state = state.copyWith(
        isLoading: false,
        services: [...state.services, created],
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> updateService(ServiceModel updated) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final data = await _api.updateService(updated.id, _toJson(updated));
      final serverUpdated = _fromJson(data);
      final updatedList = state.services
          .map((s) => s.id == updated.id ? serverUpdated : s)
          .toList();
      state = state.copyWith(isLoading: false, services: updatedList);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> toggleActive(String serviceId) async {
    final service = state.services.firstWhere((s) => s.id == serviceId);
    await updateService(service.copyWith(isActive: !service.isActive));
  }

  Future<void> removeService(String serviceId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _api.deleteService(serviceId);
      final updated = state.services.where((s) => s.id != serviceId).toList();
      state = state.copyWith(isLoading: false, services: updated);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  ServiceModel _fromJson(Map<String, dynamic> j) {
    final charge = j['charge'] as Map<String, dynamic>? ?? {};
    return ServiceModel(
      id: (j['_id'] ?? j['id']) as String,
      businessId: j['businessId'] as String? ?? '',
      branchId: j['branchId'] as String?,
      name: j['name'] as String? ?? '',
      code: j['code'] as String? ?? '',
      description: j['description'] as String? ?? '',
      category: _parseCategory(j['category'] as String? ?? ''),
      charge: ServiceCharge(
        amount: charge['amount'] as int? ?? 0,
        isEditable: charge['isEditable'] as bool? ?? true,
        minAmount: charge['minAmount'] as int?,
        maxAmount: charge['maxAmount'] as int?,
      ),
      estimatedDuration: j['estimatedDuration'] as int? ?? 0,
      isActive: j['isActive'] as bool? ?? true,
      sortOrder: j['sortOrder'] as int? ?? 0,
    );
  }

  Map<String, dynamic> _toJson(ServiceModel s) => {
        'businessId': s.businessId,
        if (s.branchId != null) 'branchId': s.branchId,
        'name': s.name,
        'code': s.code,
        'description': s.description,
        'category': s.category.name.toUpperCase(),
        'charge': {
          'amount': s.charge.amount,
          'isEditable': s.charge.isEditable,
          if (s.charge.minAmount != null) 'minAmount': s.charge.minAmount,
          if (s.charge.maxAmount != null) 'maxAmount': s.charge.maxAmount,
        },
        'estimatedDuration': s.estimatedDuration,
        'isActive': s.isActive,
        'sortOrder': s.sortOrder,
      };

  ServiceCategory _parseCategory(String s) {
    switch (s.toUpperCase()) {
      case 'DIAGNOSTICS': return ServiceCategory.diagnostics;
      case 'PROCEDURE': return ServiceCategory.procedure;
      case 'THERAPY': return ServiceCategory.therapy;
      case 'GROOMING': return ServiceCategory.grooming;
      default: return ServiceCategory.consultation;
    }
  }
}

final serviceProvider = NotifierProvider<ServiceNotifier, ServiceState>(
  ServiceNotifier.new,
);
