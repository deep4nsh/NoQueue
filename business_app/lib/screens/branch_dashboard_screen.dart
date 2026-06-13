import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import '../providers/registration_provider.dart';

const _qrBaseUrl = 'noqueue.app/join';

class BranchDashboardScreen extends ConsumerWidget {
  const BranchDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(registrationProvider);

    if (state.branchSlug.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Branch Dashboard')),
        body: const Center(child: Text('No branch configured.')),
      );
    }

    final qrData = '$_qrBaseUrl/${state.branchSlug}';

    return Scaffold(
      appBar: AppBar(title: Text(state.branchName)),
      body: Center(
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'Print this QR code for your customers',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 32),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(26),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: QrImageView(
                  data: qrData,
                  version: QrVersions.auto,
                  size: 250.0,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                qrData,
                style: const TextStyle(
                  fontSize: 16,
                  color: Colors.blueAccent,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: 250,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: () => SharePlus.instance.share(
                    ShareParams(
                      text: 'Scan this QR to join our queue: https://$qrData',
                    ),
                  ),
                  icon: const Icon(Icons.share),
                  label: const Text('Share QR'),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: 250,
                height: 50,
                child: FilledButton.icon(
                  onPressed: () => context.push('/receptionist'),
                  icon: const Icon(Icons.queue_play_next),
                  label: const Text('Open Queue'),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: 250,
                height: 50,
                child: OutlinedButton.icon(
                  onPressed: () => context.push('/services'),
                  icon: const Icon(Icons.medical_services_outlined),
                  label: const Text('Manage Services'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
