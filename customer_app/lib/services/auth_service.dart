import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/models.dart';

class AuthService {
  final firebase_auth.FirebaseAuth _firebaseAuth = firebase_auth.FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Stream of auth state changes
  Stream<firebase_auth.User?> get authStateChanges => _firebaseAuth.authStateChanges();

  // Get current user details from Firestore
  Future<User?> getCurrentUser() async {
    final firebaseUser = _firebaseAuth.currentUser;
    if (firebaseUser != null) {
      try {
        final doc = await _firestore.collection('users').doc(firebaseUser.uid).get();
        if (doc.exists) {
          return User.fromJson(doc.data()!);
        }
      } catch (e) {
        print('Error fetching user profile: $e');
        // Optionally, return a basic User object from firebaseUser if needed,
        // but returning null will prompt re-authentication or profile creation.
      }
    }
    return null;
  }

  // Google Sign In (Returns Firebase User, doesn't save to Firestore yet)
  Future<firebase_auth.User?> signInWithGoogleCredential() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null; // User canceled

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final firebase_auth.OAuthCredential credential = firebase_auth.GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final firebase_auth.UserCredential userCredential =
          await _firebaseAuth.signInWithCredential(credential);

      return userCredential.user;
    } catch (e) {
      print('Error during Google Sign in: $e');
      rethrow;
    }
  }

  // Save profile to Firestore
  Future<User> saveUserProfile(firebase_auth.User firebaseUser, {String? phone}) async {
    final user = User(
      id: firebaseUser.uid,
      name: firebaseUser.displayName ?? 'Unknown',
      phone: phone ?? firebaseUser.phoneNumber ?? '',
      email: firebaseUser.email,
      photoUrl: firebaseUser.photoURL,
    );

    await _firestore.collection('users').doc(firebaseUser.uid).set(
      user.toJson(),
      SetOptions(merge: true),
    );

    return user;
  }

  // Update user profile
  Future<User?> updateUserProfile({String? name, String? photoUrl}) async {
    final firebaseUser = _firebaseAuth.currentUser;
    if (firebaseUser == null) return null;

    final updates = <String, dynamic>{};
    if (name != null) updates['name'] = name;
    if (photoUrl != null) updates['photoUrl'] = photoUrl;

    if (updates.isEmpty) return await getCurrentUser();

    await _firestore.collection('users').doc(firebaseUser.uid).update(updates);
    
    // Also update Firebase Auth profile if name or photo changed
    if (name != null || photoUrl != null) {
      await firebaseUser.updateDisplayName(name ?? firebaseUser.displayName);
      await firebaseUser.updatePhotoURL(photoUrl ?? firebaseUser.photoURL);
    }

    return await getCurrentUser();
  }


  // Start Phone Auth (Send OTP)
  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String verificationId) codeSent,
    required Function(firebase_auth.FirebaseAuthException e) verificationFailed,
    required Function(firebase_auth.PhoneAuthCredential credential) verificationCompleted,
  }) async {
    await _firebaseAuth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      verificationCompleted: verificationCompleted,
      verificationFailed: verificationFailed,
      codeSent: (String verificationId, int? resendToken) {
        codeSent(verificationId);
      },
      codeAutoRetrievalTimeout: (String verificationId) {},
    );
  }

  // Verify OTP for Phone Login
  Future<firebase_auth.User?> verifyOTP(String verificationId, String smsCode) async {
    final credential = firebase_auth.PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: smsCode,
    );
    final userCredential = await _firebaseAuth.signInWithCredential(credential);
    return userCredential.user;
  }

  // Handle linking or merging a phone credential
  Future<firebase_auth.User?> linkOrMergePhoneCredential(firebase_auth.PhoneAuthCredential credential) async {
    final currentUser = _firebaseAuth.currentUser;
    if (currentUser == null) return null;

    try {
      final userCredential = await currentUser.linkWithCredential(credential);
      return userCredential.user;
    } on firebase_auth.FirebaseAuthException catch (e) {
      if (e.code == 'credential-already-in-use') {
        // Account merging logic
        // 1. Get Google credential again (silently)
        final googleUser = await _googleSignIn.signInSilently();
        if (googleUser == null) {
          rethrow;
        }
        final googleAuth = await googleUser.authentication;
        final googleCredential = firebase_auth.GoogleAuthProvider.credential(
          accessToken: googleAuth.accessToken,
          idToken: googleAuth.idToken,
        );

        // 2. Delete current temporary Google user to clean up
        await currentUser.delete();

        // 3. Sign in with the phone credential (which is the original account)
        final phoneUserCredential = await _firebaseAuth.signInWithCredential(credential);

        // 4. Link Google credential to the phone user
        final mergedUserCredential = await phoneUserCredential.user!.linkWithCredential(googleCredential);
        
        return mergedUserCredential.user;
      }
      rethrow;
    }
  }

  // Link Phone to Google User via OTP
  Future<firebase_auth.User?> linkPhoneToUser(String verificationId, String smsCode) async {
    final credential = firebase_auth.PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: smsCode,
    );
    return linkOrMergePhoneCredential(credential);
  }

  // Sign out
  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _firebaseAuth.signOut();
  }
}
