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

  // ─── Queue ───────────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> getQueueByBranchId(String branchId) async {
    final res = await _dio.get('/queue/branch/$branchId');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getQueueById(String queueId) async {
    final res = await _dio.get('/queue/$queueId');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createQueue(Map<String, dynamic> body) async {
    final res = await _dio.post('/queue', data: body);
    return res.data as Map<String, dynamic>;
  }

  Future<void> openQueue(String queueId) async {
    await _dio.patch('/queue/$queueId/open');
  }

  Future<void> pauseQueue(String queueId) async {
    await _dio.patch('/queue/$queueId/pause');
  }

  Future<void> closeQueue(String queueId) async {
    await _dio.patch('/queue/$queueId/close');
  }

  // ─── Tokens ──────────────────────────────────────────────────────────────────

  Future<List<dynamic>> getQueueTokens(String queueId, {List<String>? status}) async {
    final params = status != null ? {'status': status} : null;
    final res = await _dio.get('/token/queue/$queueId', queryParameters: params);
    return res.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> joinQueue(Map<String, dynamic> body) async {
    final res = await _dio.post('/token/join', data: body);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createEmergencyToken(Map<String, dynamic> body) async {
    final res = await _dio.post('/token/emergency', data: body);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> callToken(String tokenId) async {
    final res = await _dio.patch('/token/$tokenId/call');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> completeToken(String tokenId) async {
    final res = await _dio.patch('/token/$tokenId/complete');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> skipToken(String tokenId) async {
    final res = await _dio.patch('/token/$tokenId/skip');
    return res.data as Map<String, dynamic>;
  }

  Future<void> recallToken(String tokenId) async {
    await _dio.patch('/token/$tokenId/recall');
  }

  Future<Map<String, dynamic>> updateCharge(
    String tokenId,
    Map<String, dynamic> body,
  ) async {
    final res = await _dio.patch('/token/$tokenId/charge', data: body);
    return res.data as Map<String, dynamic>;
  }

  // ─── Services ────────────────────────────────────────────────────────────────

  Future<List<dynamic>> getServices(String businessId) async {
    final res = await _dio.get('/service', queryParameters: {'businessId': businessId});
    return res.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> createService(Map<String, dynamic> body) async {
    final res = await _dio.post('/service', data: body);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateService(
    String serviceId,
    Map<String, dynamic> body,
  ) async {
    final res = await _dio.patch('/service/$serviceId', data: body);
    return res.data as Map<String, dynamic>;
  }

  Future<void> deleteService(String serviceId) async {
    await _dio.delete('/service/$serviceId');
  }
}
