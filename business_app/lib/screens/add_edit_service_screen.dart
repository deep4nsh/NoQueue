import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/service.dart';
import '../providers/service_provider.dart';
import '../providers/registration_provider.dart';

class AddEditServiceScreen extends ConsumerStatefulWidget {
  final String? serviceId;

  const AddEditServiceScreen({super.key, this.serviceId});

  @override
  ConsumerState<AddEditServiceScreen> createState() =>
      _AddEditServiceScreenState();
}

class _AddEditServiceScreenState extends ConsumerState<AddEditServiceScreen> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameCtrl;
  late TextEditingController _codeCtrl;
  late TextEditingController _descCtrl;
  late TextEditingController _chargeCtrl;
  late TextEditingController _minChargeCtrl;
  late TextEditingController _maxChargeCtrl;

  ServiceCategory _category = ServiceCategory.consultation;
  bool _isEditable = true;
  bool _showChargeBounds = false;
  double _duration = 15;
  bool _isActive = true;
  bool _isSaving = false;

  ServiceModel? _existingService;

  bool get isEditMode => widget.serviceId != null;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController();
    _codeCtrl = TextEditingController();
    _descCtrl = TextEditingController();
    _chargeCtrl = TextEditingController();
    _minChargeCtrl = TextEditingController();
    _maxChargeCtrl = TextEditingController();

    if (isEditMode) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _loadExisting());
    }
  }

  void _loadExisting() {
    final services = ref.read(serviceProvider).services;
    final service = services.where((s) => s.id == widget.serviceId).firstOrNull;
    if (service == null) return;

    _existingService = service;
    _nameCtrl.text = service.name;
    _codeCtrl.text = service.code;
    _descCtrl.text = service.description;
    _chargeCtrl.text = service.charge.amountInRupees.toStringAsFixed(0);
    _category = service.category;
    _isEditable = service.charge.isEditable;
    _duration = service.estimatedDuration.toDouble();
    _isActive = service.isActive;

    if (service.charge.minAmount != null || service.charge.maxAmount != null) {
      _showChargeBounds = true;
      if (service.charge.minAmount != null) {
        _minChargeCtrl.text =
            (service.charge.minAmount! / 100).toStringAsFixed(0);
      }
      if (service.charge.maxAmount != null) {
        _maxChargeCtrl.text =
            (service.charge.maxAmount! / 100).toStringAsFixed(0);
      }
    }
    setState(() {});
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _codeCtrl.dispose();
    _descCtrl.dispose();
    _chargeCtrl.dispose();
    _minChargeCtrl.dispose();
    _maxChargeCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    final chargeAmount =
        ((double.tryParse(_chargeCtrl.text) ?? 0) * 100).toInt();
    final minAmount = _showChargeBounds && _minChargeCtrl.text.isNotEmpty
        ? ((double.tryParse(_minChargeCtrl.text) ?? 0) * 100).toInt()
        : null;
    final maxAmount = _showChargeBounds && _maxChargeCtrl.text.isNotEmpty
        ? ((double.tryParse(_maxChargeCtrl.text) ?? 0) * 100).toInt()
        : null;

    final charge = ServiceCharge(
      amount: chargeAmount,
      isEditable: _isEditable,
      minAmount: minAmount,
      maxAmount: maxAmount,
    );

    final businessId = ref.read(registrationProvider).businessId;

    if (isEditMode && _existingService != null) {
      final updated = _existingService!.copyWith(
        name: _nameCtrl.text.trim(),
        code: _codeCtrl.text.trim().toUpperCase(),
        description: _descCtrl.text.trim(),
        category: _category,
        charge: charge,
        estimatedDuration: _duration.toInt(),
        isActive: _isActive,
      );
      await ref.read(serviceProvider.notifier).updateService(updated);
    } else {
      final newService = ServiceModel(
        id: '',
        businessId: businessId,
        name: _nameCtrl.text.trim(),
        code: _codeCtrl.text.trim().toUpperCase(),
        description: _descCtrl.text.trim(),
        category: _category,
        charge: charge,
        estimatedDuration: _duration.toInt(),
        isActive: _isActive,
      );
      await ref.read(serviceProvider.notifier).addService(newService);
    }

    if (mounted) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditMode ? 'Edit Service' : 'Add Service'),
        actions: [
          TextButton(
            onPressed: _isSaving ? null : _save,
            child: _isSaving
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Save'),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _SectionHeader(label: 'Basic Info'),
            const SizedBox(height: 12),
            TextFormField(
              controller: _nameCtrl,
              decoration: const InputDecoration(
                labelText: 'Service Name *',
                hintText: 'e.g. General Consultation',
              ),
              textCapitalization: TextCapitalization.words,
              validator: (v) =>
                  v == null || v.trim().isEmpty ? 'Name is required' : null,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: TextFormField(
                    controller: _codeCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Code *',
                      hintText: 'e.g. GEN',
                      helperText: 'Max 8 chars, shown on token',
                    ),
                    textCapitalization: TextCapitalization.characters,
                    inputFormatters: [
                      FilteringTextInputFormatter.allow(RegExp(r'[A-Za-z0-9]')),
                      LengthLimitingTextInputFormatter(8),
                    ],
                    validator: (v) =>
                        v == null || v.trim().isEmpty ? 'Required' : null,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 3,
                  child: DropdownButtonFormField<ServiceCategory>(
                    initialValue: _category,
                    decoration: const InputDecoration(labelText: 'Category'),
                    items: ServiceCategory.values
                        .map((cat) => DropdownMenuItem(
                              value: cat,
                              child: Text(cat.label),
                            ))
                        .toList(),
                    onChanged: (v) => setState(() => _category = v!),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _descCtrl,
              decoration: const InputDecoration(
                labelText: 'Description',
                hintText: 'Optional — visible to customer',
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 24),
            _SectionHeader(label: 'Duration'),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: Slider(
                    value: _duration,
                    min: 5,
                    max: 120,
                    divisions: 23,
                    label: '${_duration.toInt()} min',
                    onChanged: (v) => setState(() => _duration = v),
                  ),
                ),
                SizedBox(
                  width: 72,
                  child: Text(
                    '${_duration.toInt()} min',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: colorScheme.primary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            _SectionHeader(label: 'Charge'),
            const SizedBox(height: 12),
            TextFormField(
              controller: _chargeCtrl,
              decoration: const InputDecoration(
                labelText: 'Default Charge (₹) *',
                prefixText: '₹ ',
              ),
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[\d.]'))],
              validator: (v) {
                if (v == null || v.isEmpty) return 'Charge is required';
                if (double.tryParse(v) == null) return 'Enter a valid amount';
                return null;
              },
            ),
            const SizedBox(height: 12),
            SwitchListTile(
              title: const Text('Allow receptionist to override charge'),
              subtitle: const Text('Receptionist can edit the charge per visit'),
              value: _isEditable,
              contentPadding: EdgeInsets.zero,
              onChanged: (v) => setState(() {
                _isEditable = v;
                if (!v) _showChargeBounds = false;
              }),
            ),
            if (_isEditable) ...[
              SwitchListTile(
                title: const Text('Set charge bounds'),
                subtitle:
                    const Text('Limit how much receptionist can charge'),
                value: _showChargeBounds,
                contentPadding: EdgeInsets.zero,
                onChanged: (v) => setState(() => _showChargeBounds = v),
              ),
              if (_showChargeBounds) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _minChargeCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Min (₹)',
                          prefixText: '₹ ',
                        ),
                        keyboardType: TextInputType.number,
                        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: _maxChargeCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Max (₹)',
                          prefixText: '₹ ',
                        ),
                        keyboardType: TextInputType.number,
                        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      ),
                    ),
                  ],
                ),
              ],
            ],
            if (isEditMode) ...[
              const SizedBox(height: 24),
              _SectionHeader(label: 'Status'),
              SwitchListTile(
                title: const Text('Active'),
                subtitle: const Text(
                    'Inactive services are hidden from the join flow'),
                value: _isActive,
                contentPadding: EdgeInsets.zero,
                onChanged: (v) => setState(() => _isActive = v),
              ),
            ],
            const SizedBox(height: 32),
            FilledButton(
              onPressed: _isSaving ? null : _save,
              child: _isSaving
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : Text(isEditMode ? 'Save Changes' : 'Add Service'),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String label;
  const _SectionHeader({required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: Theme.of(context).colorScheme.primary,
        letterSpacing: 0.5,
      ),
    );
  }
}
