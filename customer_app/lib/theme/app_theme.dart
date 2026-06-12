import 'package:flutter/material.dart';

class AppTheme {
  static const Color primaryColor = Color(0xFF6366F1);
  static const Color secondaryColor = Color(0xFF8B5CF6);
  static const Color accentColor = Color(0xFFEC4899);
  static const Color successColor = Color(0xFF10B981);
  static const Color warningColor = Color(0xFFF59E0B);
  static const Color errorColor = Color(0xFEF4444);

  static const Color backgroundColor = Color(0xFFF8FAFC);
  static const Color surfaceColor = Color(0xFFFFFFFF);
  static const Color borderColor = Color(0xFFE2E8F0);

  static const Color textPrimary = Color(0xFF1E293B);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textTertiary = Color(0xFFAEB8C9);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        brightness: Brightness.light,
        primary: primaryColor,
        secondary: secondaryColor,
        tertiary: accentColor,
      ),
      scaffoldBackgroundColor: backgroundColor,

      appBarTheme: AppBarTheme(
        elevation: 0,
        backgroundColor: surfaceColor,
        foregroundColor: textPrimary,
        centerTitle: false,
        titleTextStyle: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: textPrimary,
        ),
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          side: const BorderSide(color: borderColor, width: 1.5),
          foregroundColor: textPrimary,
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFFF1F5F9),
        contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderColor),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
        labelStyle: const TextStyle(color: textSecondary),
        hintStyle: const TextStyle(color: textTertiary),
      ),

      cardTheme: const CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
        ),
        color: surfaceColor,
      ),

      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        elevation: 8,
        backgroundColor: surfaceColor,
        selectedItemColor: primaryColor,
        unselectedItemColor: textTertiary,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}

class GradientCard extends StatelessWidget {
  final Gradient gradient;
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final Widget child;
  final BoxShadow? shadow;

  const GradientCard({
    Key? key,
    required this.gradient,
    this.borderRadius = 16,
    this.padding = const EdgeInsets.all(20),
    required this.child,
    this.shadow,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: shadow != null ? [shadow!] : [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      padding: padding,
      child: child,
    );
  }
}

class SoftCard extends StatefulWidget {
  final Widget child;
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry? margin;
  final VoidCallback? onTap;
  final Color? backgroundColor;
  final double? elevation;

  const SoftCard({
    Key? key,
    required this.child,
    this.borderRadius = 16,
    this.padding = const EdgeInsets.all(16),
    this.margin,
    this.onTap,
    this.backgroundColor,
    this.elevation = 2,
  }) : super(key: key);

  @override
  State<SoftCard> createState() => _SoftCardState();
}

class _SoftCardState extends State<SoftCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => widget.onTap != null ? setState(() => _isPressed = true) : null,
      onTapUp: (_) => widget.onTap != null ? setState(() => _isPressed = false) : null,
      onTapCancel: () => widget.onTap != null ? setState(() => _isPressed = false) : null,
      onTap: widget.onTap,
      child: Container(
        margin: widget.margin,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          decoration: BoxDecoration(
            color: widget.backgroundColor ?? AppTheme.surfaceColor,
            borderRadius: BorderRadius.circular(widget.borderRadius),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(_isPressed ? 0.12 : 0.06),
                blurRadius: _isPressed ? 12 : 16,
                offset: Offset(0, _isPressed ? 4 : 8),
              ),
            ],
          ),
          padding: widget.padding,
          child: widget.child,
        ),
      ),
    );
  }
}
