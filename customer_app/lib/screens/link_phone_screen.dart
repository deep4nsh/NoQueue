import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

class LinkPhoneScreen extends ConsumerStatefulWidget {
  const LinkPhoneScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<LinkPhoneScreen> createState() => _LinkPhoneScreenState();
}

class _LinkPhoneScreenState extends ConsumerState<LinkPhoneScreen> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  bool _otpSent = false;
  bool _isLoading = false;
  String? _verificationId;

  Future<void> _sendOtp() async {
    if (_phoneController.text.isEmpty || _phoneController.text.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid 10-digit phone number')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final phoneNumber = _phoneController.text.trim();
      final fullPhoneNumber = phoneNumber.startsWith('+91') ? phoneNumber : '+91$phoneNumber';

      await ref.read(authServiceProvider).verifyPhoneNumber(
        phoneNumber: fullPhoneNumber,
        verificationCompleted: (firebase_auth.PhoneAuthCredential credential) async {
          // Auto-verify if possible
          try {
            final user = await ref.read(authServiceProvider).linkOrMergePhoneCredential(credential);
            if (user != null) {
              await ref.read(currentUserProvider.notifier).saveProfile(user, phone: fullPhoneNumber);
              if (mounted) {
                final currentUser = ref.read(currentUserProvider);
                if (currentUser != null && (currentUser.name == 'Unknown' || currentUser.name.trim().isEmpty)) {
                  context.go('/edit-profile', extra: {'isSetup': true});
                } else {
                  context.go('/home');
                }
              }
            }
          } catch (e) {
             if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Auto-verification failed: $e')));
          }
        },
        verificationFailed: (firebase_auth.FirebaseAuthException e) {
          if (mounted) {
            setState(() => _isLoading = false);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Failed: ${e.message}')),
            );
          }
        },
        codeSent: (String verificationId) {
          if (mounted) {
            setState(() {
              _verificationId = verificationId;
              _otpSent = true;
              _isLoading = false;
            });
          }
        },
      );
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _verifyOtp() async {
    if (_otpController.text.isEmpty || _otpController.text.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid 6-digit OTP')),
      );
      return;
    }

    if (_verificationId == null) return;

    setState(() => _isLoading = true);

    try {
      final user = await ref.read(authServiceProvider).linkPhoneToUser(
        _verificationId!,
        _otpController.text.trim(),
      );

      if (user != null && mounted) {
        final phoneNumber = _phoneController.text.trim();
        final fullPhoneNumber = phoneNumber.startsWith('+91') ? phoneNumber : '+91$phoneNumber';
        await ref.read(currentUserProvider.notifier).saveProfile(user, phone: fullPhoneNumber);
        if (mounted) {
          final currentUser = ref.read(currentUserProvider);
          if (currentUser != null && (currentUser.name == 'Unknown' || currentUser.name.trim().isEmpty)) {
            context.go('/edit-profile', extra: {'isSetup': true});
          } else {
            context.go('/home');
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error verifying OTP: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _cancelAndLogout() async {
    await ref.read(currentUserProvider.notifier).logout();
    if (mounted) {
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Link Phone Number'),
          elevation: 0,
          automaticallyImplyLeading: false,
          actions: [
            TextButton(
              onPressed: _cancelAndLogout,
              child: const Text('Cancel', style: TextStyle(color: AppTheme.errorColor)),
            ),
          ],
        ),
        body: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Icon(
                    Icons.phone_android,
                    size: 80,
                    color: AppTheme.primaryColor,
                  ),
                ),
                const SizedBox(height: 28),
                const Text(
                  'We need your phone number',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'To secure your account and manage your queues, please verify your phone number.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: AppTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 40),
                const Text(
                  'Phone Number',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  enabled: !_otpSent,
                  maxLength: 10,
                  decoration: InputDecoration(
                    prefixIcon: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 12.0, vertical: 15.0),
                      child: Text(
                        '+91',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    hintText: '9876543210',
                    counterText: '',
                  ),
                ),
                const SizedBox(height: 20),
                if (_otpSent) ...[
                  const Text(
                    'OTP',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _otpController,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 8,
                    ),
                    decoration: InputDecoration(
                      hintText: '000000',
                      counterText: '',
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : (_otpSent ? _verifyOtp : _sendOtp),
                    child: _isLoading
                        ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                        : Text(
                          _otpSent ? 'Verify & Continue' : 'Send OTP',
                        ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }
}
