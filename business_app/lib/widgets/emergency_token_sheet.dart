import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/service.dart';
import '../providers/queue_state_provider.dart';

class EmergencyTokenSheet extends ConsumerStatefulWidget {
  const EmergencyTokenSheet({super.key});

  @override
  ConsumerState<EmergencyTokenSheet> createState() =>
      _EmergencyTokenSheetState();
}

class _EmergencyTokenSheetState extends ConsumerState<EmergencyTokenSheet> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _reasonCtrl = TextEditingController();

  ServiceModel? _selectedService;
  bool _isSaving = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _reasonCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    await ref.read(queueStateProvider.notifier).addEmergencyToken(
          name: _nameCtrl.text.trim(),
          phone: _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
          serviceId: _selectedService?.id,
          serviceName: _selectedService?.name,
          reason: _reasonCtrl.text.trim(),
        );

    if (mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final queueState = ref.watch(queueStateProvider);
    final services = queueState.queue?.services ?? [];
    final waitingNormal = queueState.normalCount;
    final colorScheme = Theme.of(context).colorScheme;

    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: colorScheme.errorContainer,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(Icons.flash_on,
                        color: colorScheme.error, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Emergency Token',
                      style: Theme.of(context)
                          .textTheme
                          .titleLarge
                          ?.copyWith(fontWeight: FontWeight.w700),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: colorScheme.errorContainer.withAlpha(100),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                      color: colorScheme.error.withAlpha(80)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.warning_amber_rounded,
                        color: colorScheme.error, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'This token will be placed ahead of $waitingNormal waiting patient${waitingNormal == 1 ? '' : 's'}.',
                        style: TextStyle(
                            fontSize: 13, color: colorScheme.onErrorContainer),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              TextFormField(
                controller: _nameCtrl,
                decoration: const InputDecoration(
                  labelText: 'Patient Name *',
                  prefixIcon: Icon(Icons.person_outline),
                ),
                textCapitalization: TextCapitalization.words,
                validator: (v) =>
                    (v == null || v.trim().isEmpty) ? 'Name is required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phoneCtrl,
                decoration: const InputDecoration(
                  labelText: 'Phone (optional)',
                  prefixIcon: Icon(Icons.phone_outlined),
                ),
                keyboardType: TextInputType.phone,
              ),
              if (services.isNotEmpty) ...[
                const SizedBox(height: 12),
                DropdownButtonFormField<ServiceModel>(
                  initialValue: _selectedService,
                  decoration: const InputDecoration(
                    labelText: 'Service',
                    prefixIcon: Icon(Icons.medical_services_outlined),
                  ),
                  hint: const Text('Select service (optional)'),
                  items: services
                      .map((s) => DropdownMenuItem(
                            value: s,
                            child: Text(s.name),
                          ))
                      .toList(),
                  onChanged: (v) => setState(() => _selectedService = v),
                ),
              ],
              const SizedBox(height: 12),
              TextFormField(
                controller: _reasonCtrl,
                decoration: const InputDecoration(
                  labelText: 'Reason *',
                  hintText: 'e.g. Chest pain, Post-surgery follow-up',
                  prefixIcon: Icon(Icons.priority_high),
                ),
                maxLines: 2,
                validator: (v) =>
                    (v == null || v.trim().isEmpty) ? 'Reason is required' : null,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: FilledButton.icon(
                  style: FilledButton.styleFrom(
                    backgroundColor: colorScheme.error,
                    foregroundColor: colorScheme.onError,
                  ),
                  onPressed: _isSaving ? null : _submit,
                  icon: _isSaving
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.flash_on),
                  label: const Text('Issue Emergency Token'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
