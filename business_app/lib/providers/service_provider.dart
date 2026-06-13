import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/service.dart';

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
  @override
  ServiceState build() => const ServiceState();

  Future<void> loadServices(String businessId) async {
    state = state.copyWith(isLoading: true, error: null);
    await Future.delayed(const Duration(milliseconds: 800));

    // Mock data — swap with: GET /api/v1/service?businessId=...
    state = state.copyWith(
      isLoading: false,
      services: _mockServices(businessId),
    );
  }

  Future<void> addService(ServiceModel service) async {
    state = state.copyWith(isLoading: true, error: null);
    await Future.delayed(const Duration(milliseconds: 600));

    // Mock — swap with: POST /api/v1/service
    final newService = ServiceModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      businessId: service.businessId,
      branchId: service.branchId,
      name: service.name,
      code: service.code,
      description: service.description,
      category: service.category,
      charge: service.charge,
      estimatedDuration: service.estimatedDuration,
      isActive: service.isActive,
      sortOrder: state.services.length,
    );

    state = state.copyWith(
      isLoading: false,
      services: [...state.services, newService],
    );
  }

  Future<void> updateService(ServiceModel updated) async {
    state = state.copyWith(isLoading: true, error: null);
    await Future.delayed(const Duration(milliseconds: 600));

    // Mock — swap with: PATCH /api/v1/service/:id
    final updatedList = state.services.map((s) => s.id == updated.id ? updated : s).toList();
    state = state.copyWith(isLoading: false, services: updatedList);
  }

  Future<void> toggleActive(String serviceId) async {
    final service = state.services.firstWhere((s) => s.id == serviceId);
    await updateService(service.copyWith(isActive: !service.isActive));
  }

  Future<void> removeService(String serviceId) async {
    state = state.copyWith(isLoading: true, error: null);
    await Future.delayed(const Duration(milliseconds: 400));

    // Mock — swap with: DELETE /api/v1/service/:id
    final updated = state.services.where((s) => s.id != serviceId).toList();
    state = state.copyWith(isLoading: false, services: updated);
  }

  List<ServiceModel> _mockServices(String businessId) {
    return [
      ServiceModel(
        id: 'svc_001',
        businessId: businessId,
        name: 'General Consultation',
        code: 'GEN',
        description: 'Standard OPD consultation with doctor',
        category: ServiceCategory.consultation,
        charge: const ServiceCharge(
          amount: 30000,
          isEditable: true,
          minAmount: 15000,
          maxAmount: 60000,
        ),
        estimatedDuration: 15,
        isActive: true,
        sortOrder: 0,
      ),
      ServiceModel(
        id: 'svc_002',
        businessId: businessId,
        name: 'Follow-up',
        code: 'FUP',
        description: 'Follow-up visit for existing patients',
        category: ServiceCategory.consultation,
        charge: const ServiceCharge(amount: 15000, isEditable: false),
        estimatedDuration: 10,
        isActive: true,
        sortOrder: 1,
      ),
      ServiceModel(
        id: 'svc_003',
        businessId: businessId,
        name: 'Blood Test',
        code: 'BT',
        description: 'Complete blood count and routine blood work',
        category: ServiceCategory.diagnostics,
        charge: const ServiceCharge(
          amount: 50000,
          isEditable: true,
          minAmount: 20000,
        ),
        estimatedDuration: 20,
        isActive: true,
        sortOrder: 2,
      ),
      ServiceModel(
        id: 'svc_004',
        businessId: businessId,
        name: 'ECG',
        code: 'ECG',
        description: 'Electrocardiogram',
        category: ServiceCategory.diagnostics,
        charge: const ServiceCharge(amount: 50000, isEditable: false),
        estimatedDuration: 20,
        isActive: false,
        sortOrder: 3,
      ),
    ];
  }
}

final serviceProvider = NotifierProvider<ServiceNotifier, ServiceState>(
  ServiceNotifier.new,
);
