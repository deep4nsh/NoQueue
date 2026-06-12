import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import '../models/models.dart';
import '../services/auth_service.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

final currentUserProvider = StateNotifierProvider<CurrentUserNotifier, User?>((ref) {
  return CurrentUserNotifier(ref.watch(authServiceProvider));
});

class CurrentUserNotifier extends StateNotifier<User?> {
  final AuthService _authService;

  late final Future<void> initFuture;

  CurrentUserNotifier(this._authService) : super(null) {
    initFuture = _initAuth();
  }

  Future<void> _initAuth() async {
    state = await _authService.getCurrentUser();
  }

  // Returns true if phone number linking is required, false otherwise
  Future<bool> loginWithGoogle() async {
    final firebaseUser = await _authService.signInWithGoogleCredential();
    if (firebaseUser != null) {
      final user = await _authService.getCurrentUser();
      if (user != null && user.phone.isNotEmpty) {
        state = user;
        return false; // Logged in completely
      } else {
        return true; // Phone number missing, needs linking
      }
    }
    return false; // Canceled or failed
  }

  Future<void> saveProfile(firebase_auth.User firebaseUser, {String? phone}) async {
    state = await _authService.saveUserProfile(firebaseUser, phone: phone);
  }

  Future<void> updateProfile({String? name, String? photoUrl}) async {
    state = await _authService.updateUserProfile(name: name, photoUrl: photoUrl);
  }

  Future<void> logout() async {
    await _authService.signOut();
    state = null;
  }

  bool get isLoggedIn => state != null;
}

// Auth state for UI
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(currentUserProvider) != null;
});

// Loading state for auth operations
final authLoadingProvider = StateProvider<bool>((ref) => false);

// Error state for auth
final authErrorProvider = StateProvider<String?>((ref) => null);
