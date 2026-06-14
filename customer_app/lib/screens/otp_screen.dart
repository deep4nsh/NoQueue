import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

class OtpScreen extends ConsumerStatefulWidget {
  final String verificationId;
  final String phoneNumber;

  const OtpScreen({
    Key? key,
    required this.verificationId,
    required this.phoneNumber,
  }) : super(key: key);

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final List<TextEditingController> _controllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // Backspace on empty field → move focus to previous box
    for (int i = 0; i < 6; i++) {
      _focusNodes[i].onKeyEvent = (node, event) {
        if (event is KeyDownEvent &&
            event.logicalKey == LogicalKeyboardKey.backspace &&
            _controllers[i].text.isEmpty &&
            i > 0) {
          _controllers[i - 1].clear();
          _focusNodes[i - 1].requestFocus();
          setState(() {});
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      };
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNodes[0].requestFocus();
    });
  }

  @override
  void dispose() {
    for (final c in _controllers) c.dispose();
    for (final f in _focusNodes) f.dispose();
    super.dispose();
  }

  String get _otp => _controllers.map((c) => c.text).join();

  Future<void> _verifyOtp() async {
    if (_otp.length < 6) {
      _showError('Please enter all 6 digits');
      return;
    }
    setState(() => _isLoading = true);
    try {
      final firebaseUser = await ref.read(authServiceProvider).verifyOTP(
        widget.verificationId,
        _otp,
      );
      if (firebaseUser != null && mounted) {
        // Exchange Firebase token for backend JWT and load user profile
        await ref.read(currentUserProvider.notifier).loginWithFirebaseUser(firebaseUser);

        final currentUser = ref.read(currentUserProvider);
        if (currentUser != null &&
            (currentUser.name == 'Unknown' || currentUser.name.trim().isEmpty)) {
          context.go('/edit-profile', extra: {'isSetup': true});
        } else {
          context.go('/home');
        }
      }
    } catch (e) {
      if (mounted) _showError('Invalid OTP. Please try again.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: AppTheme.errorColor,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  Widget _buildOtpBox(int index) {
    final filled = _controllers[index].text.isNotEmpty;
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        child: TextField(
          controller: _controllers[index],
          focusNode: _focusNodes[index],
          keyboardType: TextInputType.number,
          textAlign: TextAlign.center,
          maxLength: 1,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          onChanged: (val) {
            setState(() {});
            if (val.length == 1 && index < 5) {
              _focusNodes[index + 1].requestFocus();
            }
            if (_otp.length == 6 && !_isLoading) _verifyOtp();
          },
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: filled ? AppTheme.primaryColor : AppTheme.textPrimary,
          ),
          decoration: InputDecoration(
            counterText: '',
            filled: true,
            fillColor: filled
                ? AppTheme.primaryColor.withOpacity(0.08)
                : const Color(0xFFF1F5F9),
            contentPadding: const EdgeInsets.symmetric(vertical: 14),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: filled ? AppTheme.primaryColor : AppTheme.borderColor,
                width: filled ? 2 : 1,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppTheme.primaryColor, width: 2),
            ),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final allFilled = _otp.length == 6;

    return Scaffold(
      appBar: AppBar(elevation: 0),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 16),
              // Icon
              Center(
                child: Container(
                  width: 84,
                  height: 84,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        AppTheme.primaryColor.withOpacity(0.12),
                        AppTheme.secondaryColor.withOpacity(0.12),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: const Icon(Icons.sms_outlined, size: 44, color: AppTheme.primaryColor),
                ),
              ),
              const SizedBox(height: 28),
              const Text(
                'Verify your number',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.textPrimary,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 10),
              RichText(
                textAlign: TextAlign.center,
                text: TextSpan(
                  text: 'OTP sent to  ',
                  style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary),
                  children: [
                    TextSpan(
                      text: widget.phoneNumber,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              // OTP boxes
              Row(children: List.generate(6, (i) => _buildOtpBox(i))),
              const SizedBox(height: 12),
              AnimatedOpacity(
                opacity: allFilled ? 1 : 0,
                duration: const Duration(milliseconds: 300),
                child: const Text(
                  'Auto-submitting…',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: AppTheme.primaryColor, fontWeight: FontWeight.w500),
                ),
              ),
              const SizedBox(height: 36),
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                height: 54,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _verifyOtp,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: allFilled ? AppTheme.primaryColor : AppTheme.primaryColor.withOpacity(0.6),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text(
                          'Verify & Login',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                        ),
                ),
              ),
              const SizedBox(height: 20),
              Center(
                child: TextButton(
                  onPressed: () => context.pop(),
                  child: const Text(
                    'Change phone number',
                    style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.w500),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
