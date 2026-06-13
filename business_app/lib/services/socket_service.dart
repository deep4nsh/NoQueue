import 'package:socket_io_client/socket_io_client.dart' as io;
import '../config/api_config.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;

  io.Socket? _socket;
  String? _currentQueueId;

  SocketService._internal();

  void connect() {
    _socket = io.io(ApiConfig.socketUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': true,
    });
  }

  void joinQueue(String queueId) {
    if (_socket == null) connect();
    if (_currentQueueId == queueId) return;

    if (_currentQueueId != null) {
      _socket!.emit('leaveQueue', {'queueId': _currentQueueId});
    }

    _currentQueueId = queueId;
    _socket!.emit('joinQueue', {'queueId': queueId});
  }

  void on(String event, Function(dynamic) handler) {
    _socket?.on(event, handler);
  }

  void off(String event) {
    _socket?.off(event);
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
    _currentQueueId = null;
  }
}
