import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/service.dart';
import '../providers/service_provider.dart';
import '../providers/registration_provider.dart';

class ServicesScreen extends ConsumerStatefulWidget {
  const ServicesScreen({super.key});

  @override
  ConsumerState<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends ConsumerState<ServicesScreen> {
  bool _showInactive = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final businessId = ref.read(registrationProvider).businessId;
      ref.read(serviceProvider.notifier).loadServices(
            businessId.isEmpty ? 'biz_mock' : businessId,
          );
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(serviceProvider);
    final colorScheme = Theme.of(context).colorScheme;

    final allServices = state.services;
    final visibleServices = _showInactive
        ? allServices
        : allServices.where((s) => s.isActive).toList();

    final grouped = <ServiceCategory, List<ServiceModel>>{};
    for (final cat in ServiceCategory.values) {
      final list = visibleServices.where((s) => s.category == cat).toList();
      if (list.isNotEmpty) grouped[cat] = list;
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Services'),
        actions: [
          IconButton(
            tooltip: _showInactive ? 'Hide inactive' : 'Show inactive',
            icon: Icon(_showInactive ? Icons.visibility_off : Icons.visibility),
            onPressed: () => setState(() => _showInactive = !_showInactive),
          ),
          IconButton(
            tooltip: 'Add service',
            icon: const Icon(Icons.add),
            onPressed: () => context.push('/services/add'),
          ),
        ],
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.services.isEmpty
              ? _buildEmptyState(context)
              : grouped.isEmpty
                  ? _buildEmptyState(context)
                  : ListView.builder(
                      padding: const EdgeInsets.only(bottom: 80),
                      itemCount: grouped.length,
                      itemBuilder: (context, index) {
                        final category = grouped.keys.elementAt(index);
                        final services = grouped[category]!;
                        return _CategorySection(
                          category: category,
                          services: services,
                          colorScheme: colorScheme,
                        );
                      },
                    ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/services/add'),
        icon: const Icon(Icons.add),
        label: const Text('Add Service'),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.medical_services_outlined,
              size: 64, color: Theme.of(context).colorScheme.outline),
          const SizedBox(height: 16),
          const Text('No services yet',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Text(
            'Add services customers can select\nwhen joining the queue',
            textAlign: TextAlign.center,
            style: TextStyle(color: Theme.of(context).colorScheme.outline),
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: () => context.push('/services/add'),
            icon: const Icon(Icons.add),
            label: const Text('Add First Service'),
          ),
        ],
      ),
    );
  }
}

class _CategorySection extends ConsumerWidget {
  final ServiceCategory category;
  final List<ServiceModel> services;
  final ColorScheme colorScheme;

  const _CategorySection({
    required this.category,
    required this.services,
    required this.colorScheme,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
          child: Text(
            category.label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: colorScheme.primary,
              letterSpacing: 0.5,
            ),
          ),
        ),
        ...services.map((service) => _ServiceTile(service: service)),
      ],
    );
  }
}

class _ServiceTile extends ConsumerWidget {
  final ServiceModel service;

  const _ServiceTile({required this.service});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colorScheme = Theme.of(context).colorScheme;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: service.isActive
              ? colorScheme.outlineVariant
              : colorScheme.outlineVariant.withAlpha(80),
        ),
      ),
      color: service.isActive ? null : colorScheme.surfaceContainerHighest.withAlpha(80),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            _CodeBadge(code: service.code, isActive: service.isActive),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          service.name,
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 15,
                            color: service.isActive ? null : colorScheme.outline,
                          ),
                        ),
                      ),
                      if (!service.isActive)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: colorScheme.errorContainer,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'Inactive',
                            style: TextStyle(
                              fontSize: 11,
                              color: colorScheme.onErrorContainer,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.currency_rupee,
                          size: 13, color: colorScheme.secondary),
                      Text(
                        service.charge.amountInRupees
                            .toStringAsFixed(0),
                        style: TextStyle(
                          fontSize: 13,
                          color: colorScheme.secondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      if (service.charge.isEditable) ...[
                        const SizedBox(width: 4),
                        Icon(Icons.edit, size: 11, color: colorScheme.outline),
                      ],
                      const SizedBox(width: 12),
                      Icon(Icons.timer_outlined, size: 13, color: colorScheme.outline),
                      const SizedBox(width: 2),
                      Text(
                        '${service.estimatedDuration} min',
                        style: TextStyle(fontSize: 13, color: colorScheme.outline),
                      ),
                    ],
                  ),
                  if (service.description.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      service.description,
                      style: TextStyle(fontSize: 12, color: colorScheme.outline),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
            Column(
              children: [
                Switch(
                  value: service.isActive,
                  onChanged: (_) => ref
                      .read(serviceProvider.notifier)
                      .toggleActive(service.id),
                ),
                IconButton(
                  tooltip: 'Edit',
                  icon: const Icon(Icons.edit_outlined, size: 18),
                  onPressed: () =>
                      context.push('/services/edit/${service.id}'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _CodeBadge extends StatelessWidget {
  final String code;
  final bool isActive;

  const _CodeBadge({required this.code, required this.isActive});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: isActive
            ? colorScheme.primaryContainer
            : colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Center(
        child: Text(
          code.length > 4 ? code.substring(0, 4) : code,
          style: TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: code.length > 3 ? 11 : 14,
            color: isActive
                ? colorScheme.onPrimaryContainer
                : colorScheme.outline,
          ),
        ),
      ),
    );
  }
}
