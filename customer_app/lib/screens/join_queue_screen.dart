import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/models.dart';
import '../providers/token_provider.dart';
import '../theme/app_theme.dart';

class JoinQueueScreen extends ConsumerStatefulWidget {
  final Queue queue;

  const JoinQueueScreen({
    Key? key,
    required this.queue,
  }) : super(key: key);

  @override
  ConsumerState<JoinQueueScreen> createState() => _JoinQueueScreenState();
}

class _JoinQueueScreenState extends ConsumerState<JoinQueueScreen> {
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _phoneController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _joinQueue() async {
    if (_nameController.text.isEmpty || _phoneController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please fill in all fields'),
          backgroundColor: AppTheme.errorColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      return;
    }
    setState(() => _isLoading = true);
    try {
      await ref.read(currentTokenProvider.notifier).joinQueue(
            widget.queue.id,
            _nameController.text,
            _phoneController.text,
          );
      if (mounted) context.go('/home');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final estWait = widget.queue.averageServiceTime * widget.queue.waitingCount;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Join Queue'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Queue info header
            Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
                ),
              ),
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 28),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'City Clinic — Main Branch',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.queue.name,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white.withOpacity(0.8),
                    ),
                  ),
                  const SizedBox(height: 20),
                  // Stats row
                  Row(
                    children: [
                      _buildInfoChip(Icons.people_outline_rounded, '${widget.queue.waitingCount} waiting'),
                      const SizedBox(width: 10),
                      _buildInfoChip(Icons.schedule_rounded, '~$estWait min wait'),
                      const SizedBox(width: 10),
                      _buildInfoChip(
                        Icons.circle,
                        widget.queue.status,
                        dotColor: AppTheme.successColor,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // Form
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 28, 24, 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'Your Details',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.textPrimary,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'We\'ll send queue updates via SMS & WhatsApp',
                    style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                  ),
                  const SizedBox(height: 28),
                  // Name field
                  const Text(
                    'Full Name',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _nameController,
                    textCapitalization: TextCapitalization.words,
                    decoration: const InputDecoration(
                      prefixIcon: Icon(Icons.person_outline_rounded, size: 20),
                      hintText: 'Enter your full name',
                    ),
                  ),
                  const SizedBox(height: 20),
                  // Phone field
                  const Text(
                    'Phone Number',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(
                      prefixIcon: Icon(Icons.phone_outlined, size: 20),
                      prefixText: '+91 ',
                      hintText: '9876543210',
                    ),
                  ),
                  const SizedBox(height: 36),
                  // Estimated token info
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.successColor.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: AppTheme.successColor.withOpacity(0.2),
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppTheme.successColor.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(
                            Icons.confirmation_number_outlined,
                            color: AppTheme.successColor,
                            size: 22,
                          ),
                        ),
                        const SizedBox(width: 14),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'You\'ll get token A-103',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Position 9 in queue',
                                style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),
                  SizedBox(
                    height: 54,
                    child: ElevatedButton.icon(
                      onPressed: _isLoading ? null : _joinQueue,
                      icon: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : const Icon(Icons.check_rounded),
                      label: Text(
                        _isLoading ? 'Joining…' : 'Confirm & Join Queue',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.successColor,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label, {Color? dotColor}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.18),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (dotColor != null)
            Container(
              width: 7,
              height: 7,
              margin: const EdgeInsets.only(right: 5),
              decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
            )
          else
            Icon(icon, color: Colors.white, size: 13),
          if (dotColor == null) const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
