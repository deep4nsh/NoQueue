import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/service.dart';
import '../providers/queue_state_provider.dart';

class WalkInSheet extends ConsumerStatefulWidget {
  const WalkInSheet({super.key});

  @override
  ConsumerState<WalkInSheet> createState() => _WalkInSheetState();
}

class _WalkInSheetState extends ConsumerState<WalkInSheet> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();

  ServiceModel? _selectedService;
  bool _isSaving = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    await ref.read(queueStateProvider.notifier).addWalkIn(
          name: _nameCtrl.text.trim(),
          phone: _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
          serviceId: _selectedService?.id,
          serviceName: _selectedService?.name,
        );

    if (mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final services = ref.watch(queueStateProvider).queue?.services ?? [];

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
                  const Icon(Icons.person_add_alt_1_outlined),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Add Walk-in',
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
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: FilledButton.icon(
                  onPressed: _isSaving ? null : _submit,
                  icon: _isSaving
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child:
                              CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.add),
                  label: const Text('Add to Queue'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
