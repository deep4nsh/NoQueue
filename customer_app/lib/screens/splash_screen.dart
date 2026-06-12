import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _logoController;
  late AnimationController _textController;
  late Animation<double> _logoScale;
  late Animation<double> _logoOpacity;
  late Animation<Offset> _textSlide;
  late Animation<double> _textFade;

  @override
  void initState() {
    super.initState();

    _logoController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _textController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    _logoScale = Tween<double>(begin: 0.4, end: 1.0).animate(
      CurvedAnimation(parent: _logoController, curve: Curves.elasticOut),
    );
    _logoOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _logoController,
        curve: const Interval(0.0, 0.45, curve: Curves.easeIn),
      ),
    );
    _textSlide = Tween<Offset>(
      begin: const Offset(0, 0.5),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _textController, curve: Curves.easeOutCubic));
    _textFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _textController, curve: Curves.easeIn),
    );

    _logoController.forward();
    Future.delayed(const Duration(milliseconds: 450), () {
      if (mounted) _textController.forward();
    });

    _checkAuth();
  }

  @override
  void dispose() {
    _logoController.dispose();
    _textController.dispose();
    super.dispose();
  }

  Future<void> _checkAuth() async {
    final minimumDelay = Future.delayed(const Duration(seconds: 2));
    final authInit = ref.read(currentUserProvider.notifier).initFuture;
    await Future.wait([minimumDelay, authInit]);
    if (!mounted) return;

    final isAuthenticated = ref.read(isAuthenticatedProvider);
    if (isAuthenticated) {
      final currentUser = ref.read(currentUserProvider);
      if (currentUser != null) {
        if (currentUser.phone.isEmpty) {
          context.go('/link-phone');
        } else if (currentUser.name == 'Unknown' || currentUser.name.trim().isEmpty) {
          context.go('/edit-profile', extra: {'isSetup': true});
        } else {
          context.go('/home');
        }
      } else {
        context.go('/login');
      }
    } else {
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFEEF0FF), Color(0xFFF5EEFF)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              const Spacer(flex: 2),
              // Logo
              AnimatedBuilder(
                animation: _logoController,
                builder: (context, child) => Opacity(
                  opacity: _logoOpacity.value,
                  child: Transform.scale(scale: _logoScale.value, child: child),
                ),
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
                    ),
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryColor.withOpacity(0.4),
                        blurRadius: 36,
                        offset: const Offset(0, 18),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.queue_rounded, size: 56, color: Colors.white),
                ),
              ),
              const SizedBox(height: 32),
              // Brand text
              FadeTransition(
                opacity: _textFade,
                child: SlideTransition(
                  position: _textSlide,
                  child: Column(
                    children: [
                      const Text(
                        'NoQueue',
                        style: TextStyle(
                          fontSize: 40,
                          fontWeight: FontWeight.w900,
                          color: AppTheme.textPrimary,
                          letterSpacing: -1.5,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'Skip the wait. Live your life.',
                        style: TextStyle(
                          fontSize: 15,
                          color: AppTheme.textSecondary,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const Spacer(flex: 2),
              // Loading spinner
              FadeTransition(
                opacity: _textFade,
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 48),
                  child: SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        AppTheme.primaryColor.withOpacity(0.5),
                      ),
                    ),
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
