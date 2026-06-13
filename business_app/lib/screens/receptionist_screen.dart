import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/token.dart';
import '../providers/queue_state_provider.dart';
import '../providers/registration_provider.dart';
import '../widgets/emergency_token_sheet.dart';
import '../widgets/walk_in_sheet.dart';

class ReceptionistScreen extends ConsumerStatefulWidget {
  const ReceptionistScreen({super.key});

  @override
  ConsumerState<ReceptionistScreen> createState() => _ReceptionistScreenState();
}

class _ReceptionistScreenState extends ConsumerState<ReceptionistScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final branchSlug = ref.read(registrationProvider).branchSlug;
      ref.read(queueStateProvider.notifier).loadQueue(branchSlug);
    });
  }

  void _showEmergencySheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => const EmergencyTokenSheet(),
    );
  }

  void _showWalkInSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => const WalkInSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(queueStateProvider);
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Text(state.queue?.name ?? 'Queue'),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.green.withAlpha(30),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.green.withAlpha(80)),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.circle, size: 8, color: Colors.green),
                SizedBox(width: 6),
                Text('Open', style: TextStyle(color: Colors.green, fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
      body: state.isLoading && state.queue == null
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                _ServingCard(colorScheme: colorScheme),
                _ActionRow(colorScheme: colorScheme),
                _QueueCountBar(colorScheme: colorScheme),
                Expanded(child: _WaitingList(colorScheme: colorScheme)),
              ],
            ),
      bottomNavigationBar: _BottomActions(
        onWalkIn: _showWalkInSheet,
        onEmergency:
            (state.queue?.allowEmergencyTokens ?? false) ? _showEmergencySheet : null,
      ),
    );
  }
}

class _ServingCard extends ConsumerWidget {
  final ColorScheme colorScheme;
  const _ServingCard({required this.colorScheme});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final serving = ref.watch(queueStateProvider).serving;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [colorScheme.primary, colorScheme.primaryContainer],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: colorScheme.primary.withAlpha(60),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: serving == null
          ? Center(
              child: Column(
                children: [
                  Icon(Icons.hourglass_empty,
                      size: 36, color: colorScheme.onPrimary.withAlpha(180)),
                  const SizedBox(height: 8),
                  Text(
                    'No token being served',
                    style: TextStyle(
                        color: colorScheme.onPrimary.withAlpha(180),
                        fontSize: 15),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Press NEXT to call the first token',
                    style: TextStyle(
                        color: colorScheme.onPrimary.withAlpha(130),
                        fontSize: 12),
                  ),
                ],
              ),
            )
          : Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'NOW SERVING',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: colorScheme.onPrimary.withAlpha(180),
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        serving.displayToken,
                        style: TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.w900,
                          color: colorScheme.onPrimary,
                          letterSpacing: 2,
                        ),
                      ),
                      Text(
                        serving.customerName,
                        style: TextStyle(
                          fontSize: 15,
                          color: colorScheme.onPrimary.withAlpha(220),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      if (serving.service?.name != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          serving.service!.name!,
                          style: TextStyle(
                            fontSize: 12,
                            color: colorScheme.onPrimary.withAlpha(160),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: colorScheme.onPrimary.withAlpha(30),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '● CALLED',
                        style: TextStyle(
                          color: colorScheme.onPrimary,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
    );
  }
}

class _ActionRow extends ConsumerWidget {
  final ColorScheme colorScheme;
  const _ActionRow({required this.colorScheme});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(queueStateProvider);
    final notifier = ref.read(queueStateProvider.notifier);
    final hasWaiting = state.waiting.isNotEmpty;
    final hasServing = state.serving != null;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: FilledButton.icon(
              onPressed: hasWaiting && !state.isLoading
                  ? notifier.callNext
                  : null,
              icon: const Icon(Icons.skip_next),
              label: const Text('NEXT'),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: OutlinedButton.icon(
              onPressed: hasServing && !state.isLoading
                  ? notifier.skipCurrent
                  : null,
              icon: const Icon(Icons.skip_next, size: 16),
              label: const Text('SKIP'),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: OutlinedButton.icon(
              onPressed: hasServing && !state.isLoading
                  ? notifier.recallCurrent
                  : null,
              icon: const Icon(Icons.replay, size: 16),
              label: const Text('RECALL'),
            ),
          ),
        ],
      ),
    );
  }
}

class _QueueCountBar extends ConsumerWidget {
  final ColorScheme colorScheme;
  const _QueueCountBar({required this.colorScheme});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(queueStateProvider);

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
      child: Row(
        children: [
          Text(
            '${state.waiting.length} waiting',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 13,
              color: colorScheme.outline,
            ),
          ),
          if (state.emergencyCount > 0) ...[
            const SizedBox(width: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: colorScheme.errorContainer,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.flash_on,
                      size: 12, color: colorScheme.error),
                  const SizedBox(width: 4),
                  Text(
                    '${state.emergencyCount} emergency',
                    style: TextStyle(
                        fontSize: 11,
                        color: colorScheme.onErrorContainer,
                        fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          ],
          const Spacer(),
          if (state.queue != null)
            Text(
              'avg ${state.queue!.averageServiceTime} min/token',
              style: TextStyle(fontSize: 12, color: colorScheme.outline),
            ),
        ],
      ),
    );
  }
}

class _WaitingList extends ConsumerWidget {
  final ColorScheme colorScheme;
  const _WaitingList({required this.colorScheme});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tokens = ref.watch(queueStateProvider).waiting;

    if (tokens.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.people_outline,
                size: 48, color: colorScheme.outline.withAlpha(120)),
            const SizedBox(height: 12),
            Text(
              'Queue is empty',
              style: TextStyle(color: colorScheme.outline, fontSize: 16),
            ),
          ],
        ),
      );
    }

    bool shownDivider = false;

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      itemCount: tokens.length,
      itemBuilder: (context, index) {
        final token = tokens[index];
        final isFirstNormal = !shownDivider && !token.isEmergency;
        if (isFirstNormal) shownDivider = true;

        return Column(
          children: [
            if (isFirstNormal && index > 0)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    Expanded(
                        child: Divider(color: colorScheme.outlineVariant)),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: Text(
                        'Regular Queue',
                        style: TextStyle(
                            fontSize: 11, color: colorScheme.outline),
                      ),
                    ),
                    Expanded(
                        child: Divider(color: colorScheme.outlineVariant)),
                  ],
                ),
              ),
            _TokenRow(token: token, colorScheme: colorScheme),
          ],
        );
      },
    );
  }
}

class _TokenRow extends StatelessWidget {
  final TokenModel token;
  final ColorScheme colorScheme;

  const _TokenRow({required this.token, required this.colorScheme});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.symmetric(vertical: 3),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(
          color: token.isEmergency
              ? colorScheme.error.withAlpha(100)
              : colorScheme.outlineVariant.withAlpha(80),
          width: token.isEmergency ? 1.5 : 1,
        ),
      ),
      color: token.isEmergency
          ? colorScheme.errorContainer.withAlpha(40)
          : null,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Row(
          children: [
            SizedBox(
              width: 32,
              child: Text(
                '#${token.position}',
                style: TextStyle(
                  fontSize: 12,
                  color: colorScheme.outline,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: token.isEmergency
                    ? colorScheme.error
                    : colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                token.displayToken,
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 13,
                  color: token.isEmergency
                      ? colorScheme.onError
                      : colorScheme.onPrimaryContainer,
                ),
              ),
            ),
            if (token.isEmergency) ...[
              const SizedBox(width: 6),
              Icon(Icons.flash_on, size: 14, color: colorScheme.error),
            ],
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    token.customerName,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 14),
                  ),
                  if (token.service?.name != null)
                    Text(
                      token.service!.name!,
                      style: TextStyle(
                          fontSize: 12, color: colorScheme.outline),
                    ),
                  if (token.isEmergency && token.priorityReason != null)
                    Text(
                      token.priorityReason!,
                      style: TextStyle(
                          fontSize: 11,
                          color: colorScheme.error.withAlpha(200),
                          fontStyle: FontStyle.italic),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
            Text(
              '~${token.estimatedWaitMinutes}m',
              style: TextStyle(
                  fontSize: 12,
                  color: colorScheme.outline,
                  fontWeight: FontWeight.w500),
            ),
          ],
        ),
      ),
    );
  }
}

class _BottomActions extends StatelessWidget {
  final VoidCallback onWalkIn;
  final VoidCallback? onEmergency;

  const _BottomActions({required this.onWalkIn, this.onEmergency});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: onWalkIn,
                icon: const Icon(Icons.person_add_alt_1),
                label: const Text('Add Walk-in'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: FilledButton.icon(
                style: FilledButton.styleFrom(
                  backgroundColor:
                      onEmergency != null ? colorScheme.error : null,
                  foregroundColor:
                      onEmergency != null ? colorScheme.onError : null,
                ),
                onPressed: onEmergency,
                icon: const Icon(Icons.flash_on),
                label: const Text('Emergency'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
