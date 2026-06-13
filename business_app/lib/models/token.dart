import 'service.dart';

enum TokenPriority { normal, emergency }

enum TokenStatus {
  waiting,
  called,
  inProgress,
  completed,
  skipped,
  cancelled,
  noShow;

  static TokenStatus fromString(String v) {
    switch (v.toUpperCase()) {
      case 'WAITING':
        return TokenStatus.waiting;
      case 'CALLED':
        return TokenStatus.called;
      case 'IN_PROGRESS':
        return TokenStatus.inProgress;
      case 'COMPLETED':
        return TokenStatus.completed;
      case 'SKIPPED':
        return TokenStatus.skipped;
      case 'CANCELLED':
        return TokenStatus.cancelled;
      case 'NO_SHOW':
        return TokenStatus.noShow;
      default:
        return TokenStatus.waiting;
    }
  }
}

enum ChargeStatus { pending, confirmed, waived;

  String get apiValue {
    switch (this) {
      case ChargeStatus.pending:
        return 'PENDING';
      case ChargeStatus.confirmed:
        return 'CONFIRMED';
      case ChargeStatus.waived:
        return 'WAIVED';
    }
  }

  static ChargeStatus fromString(String v) {
    switch (v.toUpperCase()) {
      case 'CONFIRMED':
        return ChargeStatus.confirmed;
      case 'WAIVED':
        return ChargeStatus.waived;
      default:
        return ChargeStatus.pending;
    }
  }
}

class ChargeInfo {
  final int defaultAmount;
  final int? finalAmount;
  final String currency;
  final ChargeStatus status;
  final bool isEditable;
  final int? minAmount;
  final int? maxAmount;

  const ChargeInfo({
    required this.defaultAmount,
    this.finalAmount,
    this.currency = 'INR',
    this.status = ChargeStatus.pending,
    this.isEditable = true,
    this.minAmount,
    this.maxAmount,
  });

  int get effectiveAmount => finalAmount ?? defaultAmount;
  double get effectiveAmountInRupees => effectiveAmount / 100;
  double get defaultAmountInRupees => defaultAmount / 100;
  bool get isPending => status == ChargeStatus.pending;

  factory ChargeInfo.fromJson(Map<String, dynamic> json) {
    return ChargeInfo(
      defaultAmount: (json['defaultAmount'] as num?)?.toInt() ?? 0,
      finalAmount: (json['finalAmount'] as num?)?.toInt(),
      currency: json['currency'] ?? 'INR',
      status: ChargeStatus.fromString(json['status'] ?? 'PENDING'),
      isEditable: json['isEditable'] ?? true,
      minAmount: (json['minAmount'] as num?)?.toInt(),
      maxAmount: (json['maxAmount'] as num?)?.toInt(),
    );
  }

  ChargeInfo copyWith({
    int? finalAmount,
    ChargeStatus? status,
    bool clearFinalAmount = false,
  }) {
    return ChargeInfo(
      defaultAmount: defaultAmount,
      finalAmount: clearFinalAmount ? null : (finalAmount ?? this.finalAmount),
      currency: currency,
      status: status ?? this.status,
      isEditable: isEditable,
      minAmount: minAmount,
      maxAmount: maxAmount,
    );
  }
}

class TokenServiceSnapshot {
  final String? serviceId;
  final String? name;
  final String? code;
  final int? estimatedDuration;

  const TokenServiceSnapshot({
    this.serviceId,
    this.name,
    this.code,
    this.estimatedDuration,
  });

  factory TokenServiceSnapshot.fromJson(Map<String, dynamic> json) {
    return TokenServiceSnapshot(
      serviceId: json['serviceId'],
      name: json['name'],
      code: json['code'],
      estimatedDuration: json['estimatedDuration'],
    );
  }
}

class TokenModel {
  final String id;
  final String queueId;
  final String displayToken;
  final String customerName;
  final String? customerPhone;
  final TokenStatus status;
  final TokenPriority priority;
  final String? priorityReason;
  final int position;
  final int estimatedWaitMinutes;
  final TokenServiceSnapshot? service;
  final ChargeInfo? charge;
  final DateTime joinedAt;
  final String notes;

  bool get isEmergency => priority == TokenPriority.emergency;
  bool get hasCharge => charge != null;

  const TokenModel({
    required this.id,
    required this.queueId,
    required this.displayToken,
    required this.customerName,
    this.customerPhone,
    required this.status,
    required this.priority,
    this.priorityReason,
    required this.position,
    required this.estimatedWaitMinutes,
    this.service,
    this.charge,
    required this.joinedAt,
    this.notes = '',
  });

  factory TokenModel.fromJson(Map<String, dynamic> json) {
    final customer = json['customer'] as Map<String, dynamic>? ?? {};
    return TokenModel(
      id: json['_id'] ?? '',
      queueId: json['queueId'] ?? '',
      displayToken: json['displayToken'] ?? '',
      customerName: customer['name'] ?? 'Unknown',
      customerPhone: customer['phone'],
      status: TokenStatus.fromString(json['status'] ?? 'WAITING'),
      priority: (json['priority'] ?? 'NORMAL') == 'EMERGENCY'
          ? TokenPriority.emergency
          : TokenPriority.normal,
      priorityReason: json['priorityReason'],
      position: (json['position'] as num?)?.toInt() ?? 0,
      estimatedWaitMinutes: (json['estimatedWaitMinutes'] as num?)?.toInt() ?? 0,
      service: json['service'] != null
          ? TokenServiceSnapshot.fromJson(json['service'])
          : null,
      charge: json['charge'] != null
          ? ChargeInfo.fromJson(json['charge'])
          : null,
      joinedAt: json['joinedAt'] != null
          ? DateTime.parse(json['joinedAt'])
          : DateTime.now(),
      notes: json['notes'] ?? '',
    );
  }

  TokenModel copyWith({
    TokenStatus? status,
    int? position,
    int? estimatedWaitMinutes,
    ChargeInfo? charge,
  }) {
    return TokenModel(
      id: id,
      queueId: queueId,
      displayToken: displayToken,
      customerName: customerName,
      customerPhone: customerPhone,
      status: status ?? this.status,
      priority: priority,
      priorityReason: priorityReason,
      position: position ?? this.position,
      estimatedWaitMinutes: estimatedWaitMinutes ?? this.estimatedWaitMinutes,
      service: service,
      charge: charge ?? this.charge,
      joinedAt: joinedAt,
      notes: notes,
    );
  }
}

class QueueSnapshot {
  final String id;
  final String name;
  final String prefix;
  final int waitingCount;
  final int averageServiceTime;
  final bool allowEmergencyTokens;
  final List<ServiceModel> services;

  const QueueSnapshot({
    required this.id,
    required this.name,
    required this.prefix,
    required this.waitingCount,
    required this.averageServiceTime,
    this.allowEmergencyTokens = true,
    this.services = const [],
  });
}
