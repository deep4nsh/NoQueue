import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/token.dart';
import '../providers/queue_state_provider.dart';

class ChargeEditSheet extends ConsumerStatefulWidget {
  final TokenModel token;

  const ChargeEditSheet({super.key, required this.token});

  @override
  ConsumerState<ChargeEditSheet> createState() => _ChargeEditSheetState();
}

class _ChargeEditSheetState extends ConsumerState<ChargeEditSheet> {
  late TextEditingController _amountCtrl;
  ChargeStatus _status = ChargeStatus.confirmed;
  bool _isSaving = false;

  ChargeInfo? get _charge => widget.token.charge;

  @override
  void initState() {
    super.initState();
    final defaultRupees = _charge != null
        ? (_charge!.defaultAmount / 100).toStringAsFixed(0)
        : '0';
    _amountCtrl = TextEditingController(text: defaultRupees);
    if (_charge != null && !_charge!.isPending) {
      _status = _charge!.status;
    }
  }

  @override
  void dispose() {
    _amountCtrl.dispose();
    super.dispose();
  }

  String? _validateAmount(String? v) {
    if (_status == ChargeStatus.waived) return null;
    if (v == null || v.isEmpty) return 'Enter an amount';
    final amount = double.tryParse(v);
    if (amount == null) return 'Invalid amount';
    final paise = (amount * 100).toInt();
    if (_charge?.minAmount != null && paise < _charge!.minAmount!) {
      return 'Min: ₹${(_charge!.minAmount! / 100).toStringAsFixed(0)}';
    }
    if (_charge?.maxAmount != null && paise > _charge!.maxAmount!) {
      return 'Max: ₹${(_charge!.maxAmount! / 100).toStringAsFixed(0)}';
    }
    return null;
  }

  Future<void> _confirm() async {
    final error = _validateAmount(_amountCtrl.text);
    if (error != null) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(error)));
      return;
    }

    setState(() => _isSaving = true);
    final finalPaise = _status == ChargeStatus.waived
        ? 0
        : ((double.tryParse(_amountCtrl.text) ?? 0) * 100).toInt();

    // Mock — swap with:
    //   PATCH /api/v1/token/:id/charge  { finalAmount, status }
    //   PATCH /api/v1/token/:id/complete
    await ref.read(queueStateProvider.notifier).completeToken(
          finalAmount: _status == ChargeStatus.waived ? null : finalPaise,
          chargeStatus: _status,
        );

    if (mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final charge = _charge;
    final canEdit = charge?.isEditable ?? false;

    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Complete Visit',
                        style: Theme.of(context)
                            .textTheme
                            .titleLarge
                            ?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      Text(
                        '${widget.token.displayToken} · ${widget.token.customerName}',
                        style: TextStyle(
                            color: colorScheme.outline, fontSize: 13),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),

            if (charge != null) ...[
              const SizedBox(height: 20),
              Text(
                'CHARGE',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: colorScheme.primary,
                  letterSpacing: 1,
                ),
              ),
              const SizedBox(height: 12),

              // Status toggle
              Row(
                children: [
                  Expanded(
                    child: _StatusButton(
                      label: 'Confirmed',
                      icon: Icons.check_circle_outline,
                      selected: _status == ChargeStatus.confirmed,
                      color: Colors.green,
                      onTap: () => setState(() => _status = ChargeStatus.confirmed),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _StatusButton(
                      label: 'Waived',
                      icon: Icons.money_off,
                      selected: _status == ChargeStatus.waived,
                      color: colorScheme.outline,
                      onTap: () => setState(() => _status = ChargeStatus.waived),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              if (_status == ChargeStatus.confirmed) ...[
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _amountCtrl,
                        enabled: canEdit,
                        decoration: InputDecoration(
                          labelText: 'Amount (₹)',
                          prefixText: '₹ ',
                          helperText: canEdit
                              ? _buildBoundsHint(charge)
                              : 'Fixed — not editable',
                        ),
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        inputFormatters: [
                          FilteringTextInputFormatter.allow(RegExp(r'[\d.]')),
                        ],
                        autovalidateMode: AutovalidateMode.onUserInteraction,
                        validator: _validateAmount,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Padding(
                      padding: const EdgeInsets.only(top: 12),
                      child: Column(
                        children: [
                          Text(
                            'Default',
                            style: TextStyle(
                                fontSize: 11, color: colorScheme.outline),
                          ),
                          Text(
                            '₹${charge.defaultAmountInRupees.toStringAsFixed(0)}',
                            style: const TextStyle(
                                fontWeight: FontWeight.w600, fontSize: 15),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ] else ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.info_outline,
                          size: 16, color: colorScheme.outline),
                      const SizedBox(width: 8),
                      Text(
                        'Charge will be waived — ₹0',
                        style: TextStyle(
                            color: colorScheme.outline, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ],
            ] else ...[
              const SizedBox(height: 12),
              Text(
                'No charge configured for this visit.',
                style: TextStyle(color: colorScheme.outline),
              ),
            ],

            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: FilledButton.icon(
                onPressed: _isSaving ? null : _confirm,
                icon: _isSaving
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.check),
                label: const Text('Confirm & Complete'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String? _buildBoundsHint(ChargeInfo charge) {
    if (charge.minAmount != null && charge.maxAmount != null) {
      return '₹${(charge.minAmount! / 100).toStringAsFixed(0)} – ₹${(charge.maxAmount! / 100).toStringAsFixed(0)}';
    } else if (charge.minAmount != null) {
      return 'Min ₹${(charge.minAmount! / 100).toStringAsFixed(0)}';
    } else if (charge.maxAmount != null) {
      return 'Max ₹${(charge.maxAmount! / 100).toStringAsFixed(0)}';
    }
    return null;
  }
}

class _StatusButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final Color color;
  final VoidCallback onTap;

  const _StatusButton({
    required this.label,
    required this.icon,
    required this.selected,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: selected ? color.withAlpha(30) : colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: selected ? color : colorScheme.outlineVariant,
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 16, color: selected ? color : colorScheme.outline),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                color: selected ? color : colorScheme.outline,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
