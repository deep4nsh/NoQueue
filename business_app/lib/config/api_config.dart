import 'dart:io';

class ApiConfig {
  // iOS simulator uses localhost; Android emulator uses 10.0.2.2; physical device needs LAN IP.
  static String get baseUrl {
    if (Platform.isAndroid) return 'http://10.0.2.2:3000/api/v1';
    return 'http://localhost:3000/api/v1';
  }
}
