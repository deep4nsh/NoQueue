import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/models.dart';
import '../providers/queue_provider.dart';
import '../theme/app_theme.dart';

class QrScanScreen extends ConsumerStatefulWidget {
  const QrScanScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<QrScanScreen> createState() => _QrScanScreenState();
}

class _QrScanScreenState extends ConsumerState<QrScanScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _scanController;
  late Animation<double> _scanAnimation;

  String? _scannedQr;
  bool _isLoadingQueue = false;
  Queue? _previewQueue;

  @override
  void initState() {
    super.initState();
    _scanController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
    _scanAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _scanController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _scanController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_scannedQr != null && _previewQueue != null) {
      return _buildQueuePreview(_previewQueue!);
    }
    return _buildScannerView();
  }

  Widget _buildScannerView() {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F0F1E),
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Scan Queue QR',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
        ),
      ),
      body: Stack(
        children: [
          // Background texture
          Container(
            color: const Color(0xFF0F0F1E),
          ),
          // Scanner box area — centered
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Instruction text above
                Text(
                  'Point camera at a QR code',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.7),
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 32),
                // Scan frame with corner brackets + scan line
                AnimatedBuilder(
                  animation: _scanAnimation,
                  builder: (context, child) => SizedBox(
                    width: 240,
                    height: 240,
                    child: CustomPaint(
                      painter: _ScannerOverlayPainter(
                        scanProgress: _scanAnimation.value,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                Text(
                  'Usually found at the reception desk',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.45),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          // Bottom CTA
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(24, 40, 24, 48),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    const Color(0xFF0F0F1E).withOpacity(0.9),
                    const Color(0xFF0F0F1E),
                  ],
                ),
              ),
              child: SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton.icon(
                  onPressed: _isLoadingQueue ? null : _mockScanQr,
                  icon: const Icon(Icons.qr_code_scanner_rounded),
                  label: const Text(
                    'Simulate Scan',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ),
          ),
          // Loading overlay
          if (_isLoadingQueue)
            Container(
              color: Colors.black54,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.15),
                        blurRadius: 24,
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Fetching queue info…',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Future<void> _mockScanQr() async {
    const qrData = 'noqueue.app/join/city-clinic';
    setState(() => _isLoadingQueue = true);
    try {
      final slug = qrData.split('/').last;
      await ref.read(queueProvider.notifier).fetchQueueByBranch(slug);
      setState(() {
        _scannedQr = qrData;
        _previewQueue = Queue(
          id: '1',
          branchId: 'branch_123',
          name: 'General OPD',
          prefix: 'A',
          currentToken: 94,
          lastTokenIssued: 102,
          averageServiceTime: 8,
          status: 'OPEN',
          waitingCount: 8,
        );
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: AppTheme.errorColor,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoadingQueue = false);
    }
  }

  Widget _buildQueuePreview(Queue queue) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Confirm & Join'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Gradient header
            Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
                ),
              ),
              padding: const EdgeInsets.fromLTRB(24, 28, 24, 36),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.local_hospital_rounded, color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'City Clinic — Main Branch',
                              style: TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              'General Outpatient Department',
                              style: TextStyle(fontSize: 13, color: Colors.white70),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
              child: Column(
                children: [
                  // Queue stats
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.06),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        _buildQueueStat(
                          Icons.play_circle_outline_rounded,
                          'Now Serving',
                          queue.currentDisplayToken,
                          AppTheme.primaryColor,
                          isFirst: true,
                        ),
                        Divider(height: 1, thickness: 1, color: AppTheme.borderColor.withOpacity(0.5)),
                        _buildQueueStat(
                          Icons.people_outline_rounded,
                          'People Waiting',
                          queue.waitingCount.toString(),
                          AppTheme.warningColor,
                        ),
                        Divider(height: 1, thickness: 1, color: AppTheme.borderColor.withOpacity(0.5)),
                        _buildQueueStat(
                          Icons.schedule_rounded,
                          'Avg Wait Time',
                          '${queue.averageServiceTime} mins',
                          AppTheme.successColor,
                        ),
                        Divider(height: 1, thickness: 1, color: AppTheme.borderColor.withOpacity(0.5)),
                        _buildQueueStat(
                          Icons.circle_outlined,
                          'Status',
                          queue.status,
                          queue.status == 'OPEN' ? AppTheme.successColor : AppTheme.errorColor,
                          isLast: true,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: ElevatedButton.icon(
                      onPressed: () => context.push('/join-queue', extra: queue),
                      icon: const Icon(Icons.arrow_forward_rounded),
                      label: const Text(
                        'Join This Queue',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.successColor,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        setState(() {
                          _scannedQr = null;
                          _previewQueue = null;
                        });
                      },
                      icon: const Icon(Icons.qr_code_scanner_rounded),
                      label: const Text('Scan Another', style: TextStyle(fontWeight: FontWeight.w600)),
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

  Widget _buildQueueStat(
    IconData icon,
    String label,
    String value,
    Color color, {
    bool isFirst = false,
    bool isLast = false,
  }) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
        20,
        isFirst ? 20 : 14,
        20,
        isLast ? 20 : 14,
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(7),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(9),
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                color: AppTheme.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppTheme.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}

class _ScannerOverlayPainter extends CustomPainter {
  final double scanProgress;

  const _ScannerOverlayPainter({required this.scanProgress});

  @override
  void paint(Canvas canvas, Size size) {
    const cornerLen = 30.0;
    const strokeW = 3.0;

    final paint = Paint()
      ..color = Colors.white
      ..strokeWidth = strokeW
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    // Top-left bracket
    canvas.drawLine(Offset(0, cornerLen), Offset(0, 0), paint);
    canvas.drawLine(Offset(0, 0), Offset(cornerLen, 0), paint);

    // Top-right bracket
    canvas.drawLine(Offset(size.width - cornerLen, 0), Offset(size.width, 0), paint);
    canvas.drawLine(Offset(size.width, 0), Offset(size.width, cornerLen), paint);

    // Bottom-left bracket
    canvas.drawLine(Offset(0, size.height - cornerLen), Offset(0, size.height), paint);
    canvas.drawLine(Offset(0, size.height), Offset(cornerLen, size.height), paint);

    // Bottom-right bracket
    canvas.drawLine(
        Offset(size.width - cornerLen, size.height), Offset(size.width, size.height), paint);
    canvas.drawLine(
        Offset(size.width, size.height), Offset(size.width, size.height - cornerLen), paint);

    // Scanning line with gradient
    final scanY = size.height * scanProgress;
    final scanPaint = Paint()
      ..shader = LinearGradient(
        colors: [
          Colors.transparent,
          AppTheme.primaryColor.withOpacity(0.9),
          Colors.transparent,
        ],
      ).createShader(Rect.fromLTWH(0, scanY - 1, size.width, 2))
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    canvas.drawLine(Offset(8, scanY), Offset(size.width - 8, scanY), scanPaint);

    // Glow dot at center of scan line
    final glowPaint = Paint()
      ..color = AppTheme.primaryColor.withOpacity(0.3)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4);
    canvas.drawCircle(Offset(size.width / 2, scanY), 3, glowPaint);

    final dotPaint = Paint()..color = AppTheme.primaryColor;
    canvas.drawCircle(Offset(size.width / 2, scanY), 2, dotPaint);
  }

  @override
  bool shouldRepaint(_ScannerOverlayPainter old) => old.scanProgress != scanProgress;
}
