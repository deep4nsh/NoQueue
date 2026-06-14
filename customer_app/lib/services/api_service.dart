import 'package:dio/dio.dart';
import '../config/api_config.dart';
import 'token_storage_service.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  late final Dio _dio;
  final _tokenStorage = TokenStorageService();
  void Function()? _onUnauthorized;

  ApiService._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
      contentType: 'application/json',
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final jwt = await _tokenStorage.getJwt();
        if (jwt != null) {
          options.headers['Authorization'] = 'Bearer $jwt';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          await _tokenStorage.clearJwt();
          _onUnauthorized?.call();
        }
        return handler.next(error);
      },
    ));
  }

  void setUnauthorizedCallback(void Function() callback) {
    _onUnauthorized = callback;
  }

  Future<Map<String, dynamic>> get(String path) async {
    final res = await _dio.get(path);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> data) async {
    final res = await _dio.post(path, data: data);
    return res.data as Map<String, dynamic>;
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
