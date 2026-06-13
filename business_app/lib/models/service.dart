enum ServiceCategory {
  consultation,
  diagnostics,
  procedure,
  therapy,
  grooming,
  other;

  String get label {
    switch (this) {
      case ServiceCategory.consultation:
        return 'Consultation';
      case ServiceCategory.diagnostics:
        return 'Diagnostics';
      case ServiceCategory.procedure:
        return 'Procedure';
      case ServiceCategory.therapy:
        return 'Therapy';
      case ServiceCategory.grooming:
        return 'Grooming';
      case ServiceCategory.other:
        return 'Other';
    }
  }

  static ServiceCategory fromString(String value) {
    return ServiceCategory.values.firstWhere(
      (e) => e.name.toUpperCase() == value.toUpperCase(),
      orElse: () => ServiceCategory.other,
    );
  }
}

class ServiceCharge {
  final int amount;
  final String currency;
  final bool isEditable;
  final int? minAmount;
  final int? maxAmount;

  const ServiceCharge({
    required this.amount,
    this.currency = 'INR',
    this.isEditable = true,
    this.minAmount,
    this.maxAmount,
  });

  double get amountInRupees => amount / 100;

  factory ServiceCharge.fromJson(Map<String, dynamic> json) {
    return ServiceCharge(
      amount: (json['amount'] as num).toInt(),
      currency: json['currency'] ?? 'INR',
      isEditable: json['isEditable'] ?? true,
      minAmount: json['minAmount'] != null ? (json['minAmount'] as num).toInt() : null,
      maxAmount: json['maxAmount'] != null ? (json['maxAmount'] as num).toInt() : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'amount': amount,
    'currency': currency,
    'isEditable': isEditable,
    if (minAmount != null) 'minAmount': minAmount,
    if (maxAmount != null) 'maxAmount': maxAmount,
  };

  ServiceCharge copyWith({
    int? amount,
    String? currency,
    bool? isEditable,
    int? minAmount,
    int? maxAmount,
  }) {
    return ServiceCharge(
      amount: amount ?? this.amount,
      currency: currency ?? this.currency,
      isEditable: isEditable ?? this.isEditable,
      minAmount: minAmount ?? this.minAmount,
      maxAmount: maxAmount ?? this.maxAmount,
    );
  }
}

class ServiceModel {
  final String id;
  final String businessId;
  final String? branchId;
  final String name;
  final String code;
  final String description;
  final ServiceCategory category;
  final ServiceCharge charge;
  final int estimatedDuration;
  final bool isActive;
  final int sortOrder;

  const ServiceModel({
    required this.id,
    required this.businessId,
    this.branchId,
    required this.name,
    required this.code,
    this.description = '',
    required this.category,
    required this.charge,
    required this.estimatedDuration,
    this.isActive = true,
    this.sortOrder = 0,
  });

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    return ServiceModel(
      id: json['_id'] ?? '',
      businessId: json['businessId'] ?? '',
      branchId: json['branchId'],
      name: json['name'] ?? '',
      code: json['code'] ?? '',
      description: json['description'] ?? '',
      category: ServiceCategory.fromString(json['category'] ?? 'OTHER'),
      charge: ServiceCharge.fromJson(json['charge'] ?? {}),
      estimatedDuration: (json['estimatedDuration'] as num?)?.toInt() ?? 15,
      isActive: json['isActive'] ?? true,
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'businessId': businessId,
    if (branchId != null) 'branchId': branchId,
    'name': name,
    'code': code,
    'description': description,
    'category': category.name.toUpperCase(),
    'charge': charge.toJson(),
    'estimatedDuration': estimatedDuration,
    'isActive': isActive,
    'sortOrder': sortOrder,
  };

  ServiceModel copyWith({
    String? name,
    String? code,
    String? description,
    ServiceCategory? category,
    ServiceCharge? charge,
    int? estimatedDuration,
    bool? isActive,
    int? sortOrder,
  }) {
    return ServiceModel(
      id: id,
      businessId: businessId,
      branchId: branchId,
      name: name ?? this.name,
      code: code ?? this.code,
      description: description ?? this.description,
      category: category ?? this.category,
      charge: charge ?? this.charge,
      estimatedDuration: estimatedDuration ?? this.estimatedDuration,
      isActive: isActive ?? this.isActive,
      sortOrder: sortOrder ?? this.sortOrder,
    );
  }
}
