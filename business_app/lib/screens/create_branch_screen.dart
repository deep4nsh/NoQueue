import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/registration_provider.dart';

class CreateBranchScreen extends ConsumerStatefulWidget {
  const CreateBranchScreen({super.key});

  @override
  ConsumerState<CreateBranchScreen> createState() => _CreateBranchScreenState();
}

class _CreateBranchScreenState extends ConsumerState<CreateBranchScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _slugController = TextEditingController();

  static final _slugRegex = RegExp(r'^[a-z0-9]+(-[a-z0-9]+)*$');

  @override
  void dispose() {
    _nameController.dispose();
    _slugController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Branch')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'Set up your first branch',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 32),
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Branch Name',
                ),
                validator: (value) => (value == null || value.isEmpty)
                    ? 'Please enter a name'
                    : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _slugController,
                decoration: const InputDecoration(
                  labelText: 'Branch URL Slug (e.g. city-clinic)',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a slug';
                  }
                  if (!_slugRegex.hasMatch(value)) {
                    return 'Use only lowercase letters, numbers, and hyphens';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {
                      ref.read(registrationProvider.notifier).setBranch(
                            id: '', // TODO: set real branchId after API call
                            name: _nameController.text.trim(),
                            slug: _slugController.text.trim(),
                          );
                      context.go('/branch-dashboard');
                    }
                  },
                  child: const Text('Create Branch'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
