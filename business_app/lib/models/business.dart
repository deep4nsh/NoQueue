class Business {
  final String id;
  final String name;
  final String phone;
  final String? email;
  final String? photoUrl;

  Business({
    required this.id,
    required this.name,
    required this.phone,
    this.email,
    this.photoUrl,
  });

  factory Business.fromJson(Map<String, dynamic> json) {
    return Business(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'],
      photoUrl: json['photoUrl'],
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'name': name,
    'phone': phone,
    'email': email,
    'photoUrl': photoUrl,
  };
}
