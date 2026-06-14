import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorageService {
  static const _jwtKey = 'noqueue_jwt';

  final _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  Future<void> saveJwt(String token) async {
    await _storage.write(key: _jwtKey, value: token);
  }

  Future<String?> getJwt() async {
    return _storage.read(key: _jwtKey);
  }

  Future<void> clearJwt() async {
    await _storage.delete(key: _jwtKey);
  }

  Future<bool> hasJwt() async {
    final token = await getJwt();
    return token != null && token.isNotEmpty;
  }
}
