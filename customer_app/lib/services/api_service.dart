import 'package:dio/dio.dart';
import '../config/api_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  late final Dio _dio;

  ApiService._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
      contentType: 'application/json',
    ));
  }

  Future<Map<String, dynamic>> getQueueById(String queueId) async {
    final res = await _dio.get('/queue/$queueId');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> joinQueue(Map<String, dynamic> body) async {
    final res = await _dio.post('/token/join', data: body);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getToken(String tokenId) async {
    final res = await _dio.get('/token/$tokenId');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> cancelToken(String tokenId) async {
    final res = await _dio.patch('/token/$tokenId/cancel');
    return res.data as Map<String, dynamic>;
  }
}
