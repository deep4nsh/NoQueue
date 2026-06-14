import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import '../models/models.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

final currentUserProvider = StateNotifierProvider<CurrentUserNotifier, User?>((ref) {
  final notifier = CurrentUserNotifier(ref.watch(authServiceProvider));
  // Wire the unauthorized callback to redirect to login
  ApiService().setUnauthorizedCallback(() {
    notifier.logout();
  });
  return notifier;
});

class CurrentUserNotifier extends StateNotifier<User?> {
  final AuthService _authService;

  late final Future<void> initFuture;

  CurrentUserNotifier(this._authService) : super(null) {
    initFuture = _initAuth();
  }

  Future<void> _initAuth() async {
    // Path 1: Try loading from backend using stored JWT
    state = await _authService.getCurrentUserFromBackend();
    if (state != null) {
      return;
    }

    // Path 2: Firebase session exists but no JWT — exchange token
    final firebaseUser = firebase_auth.FirebaseAuth.instance.currentUser;
    if (firebaseUser != null) {
      state = await _authService.exchangeFirebaseToken(firebaseUser);
    }
  }

  Future<void> loginWithFirebaseUser(firebase_auth.User firebaseUser) async {
    state = await _authService.exchangeFirebaseToken(firebaseUser);
  }

  // Returns true if phone number linking is required, false otherwise
  Future<bool> loginWithGoogle() async {
    final firebaseUser = await _authService.signInWithGoogleCredential();
    if (firebaseUser != null) {
      await loginWithFirebaseUser(firebaseUser);
      if (state != null && (state!.phone == null || state!.phone!.isEmpty)) {
        return true; // Phone number missing, needs linking
      }
      return false; // Logged in completely
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
