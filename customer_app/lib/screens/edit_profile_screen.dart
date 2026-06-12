import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  final bool isSetup;
  const EditProfileScreen({Key? key, this.isSetup = false}) : super(key: key);

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = ref.read(currentUserProvider);
      if (user != null && user.name != 'Unknown') {
        _nameController.text = user.name;
      }
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    try {
      final user = ref.read(currentUserProvider);
      if (user != null) {
        await ref.read(currentUserProvider.notifier).updateProfile(
              name: _nameController.text.trim(),
            );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: const Text('Profile updated!'),
            backgroundColor: AppTheme.successColor,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ));
          if (widget.isSetup) {
            context.go('/home');
          } else {
            context.pop();
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Failed to update: $e'),
          backgroundColor: AppTheme.errorColor,
        ));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final initial = (user?.name.isNotEmpty == true && user?.name != 'Unknown')
        ? user!.name[0].toUpperCase()
        : '?';

    return PopScope(
      canPop: !widget.isSetup,
      child: Scaffold(
        appBar: AppBar(
          title: Text(widget.isSetup ? 'Set Up Profile' : 'Edit Profile'),
          automaticallyImplyLeading: !widget.isSetup,
          elevation: 0,
        ),
        body: SingleChildScrollView(
          child: Column(
            children: [
              // Avatar section
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(24, 28, 24, 36),
                color: AppTheme.backgroundColor,
                child: Center(
                  child: Column(
                    children: [
                      Stack(
                        alignment: Alignment.bottomRight,
                        children: [
                          Container(
                            width: 96,
                            height: 96,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
                              ),
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.primaryColor.withOpacity(0.3),
                                  blurRadius: 20,
                                  offset: const Offset(0, 8),
                                ),
                              ],
                            ),
                            child: Center(
                              child: Text(
                                initial,
                                style: const TextStyle(
                                  fontSize: 36,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                          Container(
                            width: 30,
                            height: 30,
                            decoration: BoxDecoration(
                              color: AppTheme.primaryColor,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                            ),
                            child: const Icon(Icons.edit_rounded, color: Colors.white, size: 14),
                          ),
                        ],
                      ),
                      if (widget.isSetup) ...[
                        const SizedBox(height: 16),
                        const Text(
                          'Almost there!',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Tell us your name to get started',
                          style: TextStyle(fontSize: 14, color: AppTheme.textSecondary),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              // Form
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 40),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'Your Name',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _nameController,
                        textCapitalization: TextCapitalization.words,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                        decoration: const InputDecoration(
                          prefixIcon: Icon(Icons.person_outline_rounded, size: 20),
                          hintText: 'Enter your full name',
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Name cannot be empty';
                          }
                          if (value.trim().length < 2) {
                            return 'Name must be at least 2 characters';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 36),
                      SizedBox(
                        height: 54,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _saveProfile,
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
                                  widget.isSetup ? 'Get Started' : 'Save Changes',
                                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                                ),
                        ),
                      ),
                    ],
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
