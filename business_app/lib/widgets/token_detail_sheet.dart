import 'package:flutter/material.dart';
import '../models/token.dart';

class TokenDetailSheet extends StatelessWidget {
  final TokenModel token;

  const TokenDetailSheet({super.key, required this.token});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row
          Row(
            children: [
              _TokenBadge(token: token, colorScheme: colorScheme),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      token.customerName,
                      style: const TextStyle(
                          fontWeight: FontWeight.w700, fontSize: 18),
                    ),
                    if (token.customerPhone != null)
                      Text(
                        token.customerPhone!,
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

          if (token.isEmergency) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: colorScheme.errorContainer.withAlpha(80),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: colorScheme.error.withAlpha(60)),
              ),
              child: Row(
                children: [
                  Icon(Icons.flash_on, size: 16, color: colorScheme.error),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Emergency — ${token.priorityReason ?? "No reason provided"}',
                      style: TextStyle(
                        color: colorScheme.onErrorContainer,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 20),
          const Divider(height: 1),
          const SizedBox(height: 16),

          // Details grid
          _DetailRow(
            icon: Icons.format_list_numbered,
            label: 'Position',
            value: token.status == TokenStatus.called || token.status == TokenStatus.inProgress
                ? 'Being served'
                : '#${token.position} in queue',
            colorScheme: colorScheme,
          ),
          const SizedBox(height: 10),
          _DetailRow(
            icon: Icons.timer_outlined,
            label: 'Est. Wait',
            value: token.estimatedWaitMinutes > 0
                ? '~${token.estimatedWaitMinutes} min'
                : 'Now',
            colorScheme: colorScheme,
          ),
          if (token.service?.name != null) ...[
            const SizedBox(height: 10),
            _DetailRow(
              icon: Icons.medical_services_outlined,
              label: 'Service',
              value: token.service!.name!,
              colorScheme: colorScheme,
            ),
          ],
          const SizedBox(height: 10),
          _DetailRow(
            icon: Icons.schedule,
            label: 'Joined',
            value: _formatTime(token.joinedAt),
            colorScheme: colorScheme,
          ),

          // Charge section
          if (token.hasCharge) ...[
            const SizedBox(height: 16),
            const Divider(height: 1),
            const SizedBox(height: 16),
            Text(
              'CHARGE',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: colorScheme.primary,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 10),
            _ChargeRow(charge: token.charge!, colorScheme: colorScheme),
          ],
        ],
      ),
    );
  }

  String _formatTime(DateTime dt) {
    final hour = dt.hour > 12 ? dt.hour - 12 : dt.hour;
    final ampm = dt.hour >= 12 ? 'PM' : 'AM';
    final min = dt.minute.toString().padLeft(2, '0');
    return '$hour:$min $ampm';
  }
}

class _TokenBadge extends StatelessWidget {
  final TokenModel token;
  final ColorScheme colorScheme;

  const _TokenBadge({required this.token, required this.colorScheme});

  @override
  Widget build(BuildContext context) {
    final bgColor = token.isEmergency
        ? colorScheme.error
        : colorScheme.primaryContainer;
    final fgColor = token.isEmergency
        ? colorScheme.onError
        : colorScheme.onPrimaryContainer;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        token.displayToken,
        style: TextStyle(
          fontWeight: FontWeight.w900,
          fontSize: 18,
          color: fgColor,
          letterSpacing: 1,
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final ColorScheme colorScheme;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.colorScheme,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: colorScheme.outline),
        const SizedBox(width: 10),
        SizedBox(
          width: 72,
          child: Text(
            label,
            style: TextStyle(fontSize: 13, color: colorScheme.outline),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
          ),
        ),
      ],
    );
  }
}

class _ChargeRow extends StatelessWidget {
  final ChargeInfo charge;
  final ColorScheme colorScheme;

  const _ChargeRow({required this.charge, required this.colorScheme});

  @override
  Widget build(BuildContext context) {
    final statusColor = switch (charge.status) {
      ChargeStatus.confirmed => Colors.green,
      ChargeStatus.waived => colorScheme.outline,
      ChargeStatus.pending => colorScheme.primary,
    };
    final statusLabel = switch (charge.status) {
      ChargeStatus.confirmed => 'Confirmed',
      ChargeStatus.waived => 'Waived',
      ChargeStatus.pending => 'Pending',
    };

    return Row(
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '₹${charge.effectiveAmountInRupees.toStringAsFixed(0)}',
              style: const TextStyle(
                  fontSize: 24, fontWeight: FontWeight.w700),
            ),
            if (charge.finalAmount != null &&
                charge.finalAmount != charge.defaultAmount)
              Text(
                'Default: ₹${charge.defaultAmountInRupees.toStringAsFixed(0)}',
                style: TextStyle(fontSize: 12, color: colorScheme.outline),
              ),
          ],
        ),
        const SizedBox(width: 16),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: statusColor.withAlpha(30),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: statusColor.withAlpha(80)),
          ),
          child: Text(
            statusLabel,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: statusColor,
            ),
          ),
        ),
        const Spacer(),
        if (charge.isEditable && charge.isPending)
          Icon(Icons.edit_outlined, size: 16, color: colorScheme.outline),
      ],
    );
  }
}
