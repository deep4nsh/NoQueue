import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/business.dart';

class BusinessAuthService {
  final firebase_auth.FirebaseAuth _firebaseAuth = firebase_auth.FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Stream of auth state changes
  Stream<firebase_auth.User?> get authStateChanges => _firebaseAuth.authStateChanges();

  // Get current business details from Firestore
  Future<Business?> getCurrentBusiness() async {
    final firebaseUser = _firebaseAuth.currentUser;
    if (firebaseUser != null) {
      try {
        final doc = await _firestore.collection('business').doc(firebaseUser.uid).get();
        if (doc.exists) {
          return Business.fromJson(doc.data()!);
        }
      } catch (e) {
        debugPrint('Error fetching business profile: $e');
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
      debugPrint('Error during Google Sign in: $e');
      rethrow;
    }
  }

  // Save profile to Firestore
  Future<Business> saveBusinessProfile(firebase_auth.User firebaseUser, {String? phone, String? businessName}) async {
    final business = Business(
      id: firebaseUser.uid,
      name: businessName ?? firebaseUser.displayName ?? 'Unknown',
      phone: phone ?? firebaseUser.phoneNumber ?? '',
      email: firebaseUser.email,
      photoUrl: firebaseUser.photoURL,
    );

    await _firestore.collection('business').doc(firebaseUser.uid).set(
      business.toJson(),
      SetOptions(merge: true),
    );

    return business;
  }

  // Update business profile
  Future<Business?> updateBusinessProfile({String? name, String? photoUrl}) async {
    final firebaseUser = _firebaseAuth.currentUser;
    if (firebaseUser == null) return null;

    final updates = <String, dynamic>{};
    if (name != null) updates['name'] = name;
    if (photoUrl != null) updates['photoUrl'] = photoUrl;

    if (updates.isEmpty) return await getCurrentBusiness();

    await _firestore.collection('business').doc(firebaseUser.uid).update(updates);
    
    if (name != null || photoUrl != null) {
      await firebaseUser.updateDisplayName(name ?? firebaseUser.displayName);
      await firebaseUser.updatePhotoURL(photoUrl ?? firebaseUser.photoURL);
    }

    return await getCurrentBusiness();
  }

  // Sign out
  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _firebaseAuth.signOut();
  }
}
