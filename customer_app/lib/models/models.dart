// User Models
class User {
  final String id;
  final String name;
  final String? phone;
  final String? email;
  final String? photoUrl;
  final String role;

  User({
    required this.id,
    required this.name,
    this.phone,
    this.email,
    this.photoUrl,
    this.role = 'CUSTOMER',
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'],
      email: json['email'],
      photoUrl: json['photoUrl'],
      role: json['role'] ?? 'CUSTOMER',
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'name': name,
    'phone': phone,
    'email': email,
    'photoUrl': photoUrl,
    'role': role,
  };
}

// Branch Model
class Branch {
  final String id;
  final String name;
  final String address;
  final String phone;
  final String businessId;

  Branch({
    required this.id,
    required this.name,
    required this.address,
    required this.phone,
    required this.businessId,
  });

  factory Branch.fromJson(Map<String, dynamic> json) {
    return Branch(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      address: json['address'] ?? '',
      phone: json['phone'] ?? '',
      businessId: json['businessId'] ?? '',
    );
  }
}

// Queue Model
class Queue {
  final String id;
  final String branchId;
  final String name;
  final String prefix;
  final int currentToken;
  final int lastTokenIssued;
  final int averageServiceTime;
  final String status;
  final int waitingCount;

  Queue({
    required this.id,
    required this.branchId,
    required this.name,
    required this.prefix,
    required this.currentToken,
    required this.lastTokenIssued,
    required this.averageServiceTime,
    required this.status,
    required this.waitingCount,
  });

  factory Queue.fromJson(Map<String, dynamic> json) {
    return Queue(
      id: json['_id'] ?? '',
      branchId: json['branchId'] ?? '',
      name: json['name'] ?? '',
      prefix: json['prefix'] ?? 'A',
      currentToken: json['currentToken'] ?? 0,
      lastTokenIssued: json['lastTokenIssued'] ?? 0,
      averageServiceTime: json['averageServiceTime'] ?? 10,
      status: json['status'] ?? 'OPEN',
      waitingCount: json['waitingCount'] ?? 0,
    );
  }

  String get currentDisplayToken => '$prefix-${currentToken.toString().padLeft(3, '0')}';
}

// Token Model
class Token {
  final String id;
  final String queueId;
  final String tokenNumber;
  final String displayToken;
  final String customerName;
  final String customerPhone;
  final String status;
  final int position;
  final int estimatedWaitMinutes;
  final DateTime joinedAt;
  final DateTime? calledAt;
  final DateTime? completedAt;

  Token({
    required this.id,
    required this.queueId,
    required this.tokenNumber,
    required this.displayToken,
    required this.customerName,
    required this.customerPhone,
    required this.status,
    required this.position,
    required this.estimatedWaitMinutes,
    required this.joinedAt,
    this.calledAt,
    this.completedAt,
  });

  factory Token.fromJson(Map<String, dynamic> json) {
    return Token(
      id: json['_id'] ?? '',
      queueId: json['queueId'] ?? '',
      tokenNumber: json['tokenNumber']?.toString() ?? '0',
      displayToken: json['displayToken'] ?? 'A-001',
      customerName: json['customer']?['name'] ?? 'Unknown',
      customerPhone: json['customer']?['phone'] ?? '',
      status: json['status'] ?? 'WAITING',
      position: json['position'] ?? 0,
      estimatedWaitMinutes: json['estimatedWaitMinutes'] ?? 0,
      joinedAt: json['joinedAt'] != null
          ? DateTime.parse(json['joinedAt'])
          : DateTime.now(),
      calledAt: json['calledAt'] != null ? DateTime.parse(json['calledAt']) : null,
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'queueId': queueId,
    'tokenNumber': tokenNumber,
    'displayToken': displayToken,
    'customer': {
      'name': customerName,
      'phone': customerPhone,
    },
    'status': status,
    'position': position,
    'estimatedWaitMinutes': estimatedWaitMinutes,
    'joinedAt': joinedAt.toIso8601String(),
    'calledAt': calledAt?.toIso8601String(),
    'completedAt': completedAt?.toIso8601String(),
  };

  bool get isCalled => status == 'CALLED' || status == 'IN_PROGRESS';
  bool get isCompleted => status == 'COMPLETED' || status == 'SKIPPED';
  bool get isCancelled => status == 'CANCELLED';
}

// Notification Model
class QueueNotification {
  final String id;
  final String tokenId;
  final String channel;
  final String event;
  final String message;
  final DateTime sentAt;
  final bool read;

  QueueNotification({
    required this.id,
    required this.tokenId,
    required this.channel,
    required this.event,
    required this.message,
    required this.sentAt,
    required this.read,
  });

  factory QueueNotification.fromJson(Map<String, dynamic> json) {
    return QueueNotification(
      id: json['_id'] ?? '',
      tokenId: json['tokenId'] ?? '',
      channel: json['channel'] ?? 'WHATSAPP',
      event: json['event'] ?? 'TOKEN_JOINED',
      message: json['message'] ?? '',
      sentAt: json['sentAt'] != null
          ? DateTime.parse(json['sentAt'])
          : DateTime.now(),
      read: json['read'] ?? false,
    );
  }
}

// API Response Models
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final int? statusCode;

  ApiResponse({
    required this.success,
    this.data,
    this.message,
    this.statusCode,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic) fromJsonT,
  ) {
    return ApiResponse(
      success: json['success'] ?? false,
      data: json['data'] != null ? fromJsonT(json['data']) : null,
      message: json['message'],
      statusCode: json['statusCode'],
    );
  }
}
