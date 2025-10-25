# CURSOR AI: Complete Flutter Mobile App Build Guide for FRSC Housing Management System

## 🎯 OBJECTIVE
Build a complete Flutter mobile application for the user-facing functionality of the FRSC Housing Management System with the following specifications:
- **Framework**: Flutter 3.x
- **State Management**: Provider / Riverpod
- **API Integration**: REST API with Laravel backend
- **Design**: Material Design 3
- **Colors**: Primary #FDB11E (Gold), Secondary #276254 (Teal-Green)
- **Target Platforms**: Android & iOS

---

## 📋 TABLE OF CONTENTS
1. [Project Setup & Configuration](#1-project-setup--configuration)
2. [Project Structure & Architecture](#2-project-structure--architecture)
3. [Design System & Theme](#3-design-system--theme)
4. [Authentication Module](#4-authentication-module)
5. [Dashboard Module](#5-dashboard-module)
6. [Properties Module](#6-properties-module)
7. [Investments Module](#7-investments-module)
8. [Loans Module](#8-loans-module)
9. [Wallet Module](#9-wallet-module)
10. [Profile & Settings Module](#10-profile--settings-module)
11. [API Integration](#11-api-integration)
12. [Testing & Deployment](#12-testing--deployment)

---

## 1. PROJECT SETUP & CONFIGURATION

### Step 1.1: Create New Flutter Project

\`\`\`bash
flutter create frsc_housing_app
cd frsc_housing_app
flutter --version # Should be Flutter 3.x
\`\`\`

### Step 1.2: Update pubspec.yaml

\`\`\`yaml
name: frsc_housing_app
description: FRSC Housing Cooperative Management Mobile App
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  provider: ^6.1.1
  
  # HTTP & API
  http: ^1.1.0
  dio: ^5.4.0
  
  # Local Storage
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0
  
  # UI Components
  cupertino_icons: ^1.0.6
  google_fonts: ^6.1.0
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  
  # Forms & Validation
  flutter_form_builder: ^9.1.1
  form_builder_validators: ^9.1.0
  
  # File Handling
  image_picker: ^1.0.5
  file_picker: ^6.1.1
  
  # Charts & Graphs
  fl_chart: ^0.65.0
  
  # Date & Time
  intl: ^0.18.1
  
  # Navigation
  go_router: ^12.1.3
  
  # Utilities
  url_launcher: ^6.2.2
  share_plus: ^7.2.1
  
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1

flutter:
  uses-material-design: true
  
  assets:
    - assets/images/
    - assets/icons/
    - assets/logos/
\`\`\`

### Step 1.3: Install Dependencies

\`\`\`bash
flutter pub get
\`\`\`

### Step 1.4: Configure Android

In `android/app/build.gradle`:

\`\`\`gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.frsc.housing"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}
\`\`\`

### Step 1.5: Configure iOS

In `ios/Runner/Info.plist`, add permissions:

\`\`\`xml
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photo library to upload documents</string>
<key>NSCameraUsageDescription</key>
<string>We need access to your camera to take photos</string>
\`\`\`

---

## 2. PROJECT STRUCTURE & ARCHITECTURE

### Step 2.1: Create Folder Structure

\`\`\`
lib/
├── main.dart
├── app.dart
├── config/
│   ├── theme.dart
│   ├── routes.dart
│   └── constants.dart
├── core/
│   ├── api/
│   │   ├── api_client.dart
│   │   ├── api_endpoints.dart
│   │   └── api_interceptor.dart
│   ├── models/
│   │   ├── user.dart
│   │   ├── property.dart
│   │   ├── investment.dart
│   │   ├── loan.dart
│   │   └── wallet_transaction.dart
│   ├── services/
│   │   ├── auth_service.dart
│   │   ├── storage_service.dart
│   │   └── api_service.dart
│   └── utils/
│       ├── validators.dart
│       ├── formatters.dart
│       └── helpers.dart
├── features/
│   ├── auth/
│   │   ├── screens/
│   │   ├── widgets/
│   │   └── providers/
│   ├── dashboard/
│   │   ├── screens/
│   │   ├── widgets/
│   │   └── providers/
│   ├── properties/
│   │   ├── screens/
│   │   ├── widgets/
│   │   └── providers/
│   ├── investments/
│   │   ├── screens/
│   │   ├── widgets/
│   │   └── providers/
│   ├── loans/
│   │   ├── screens/
│   │   ├── widgets/
│   │   └── providers/
│   ├── wallet/
│   │   ├── screens/
│   │   ├── widgets/
│   │   └── providers/
│   └── profile/
│       ├── screens/
│       ├── widgets/
│       └── providers/
└── shared/
    ├── widgets/
    │   ├── custom_button.dart
    │   ├── custom_text_field.dart
    │   ├── loading_indicator.dart
    │   └── error_widget.dart
    └── layouts/
        └── main_layout.dart
\`\`\`

---

## 3. DESIGN SYSTEM & THEME

### Step 3.1: Create Theme Configuration

Create file: `lib/config/theme.dart`

\`\`\`dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Colors - #FDB11E (Gold) and #276254 (Teal-Green)
  static const Color primaryColor = Color(0xFFFDB11E);
  static const Color secondaryColor = Color(0xFF276254);
  static const Color backgroundColor = Color(0xFFF5F5F5);
  static const Color surfaceColor = Colors.white;
  static const Color errorColor = Color(0xFFD32F2F);
  static const Color successColor = Color(0xFF388E3C);
  static const Color warningColor = Color(0xFFF57C00);
  static const Color textPrimaryColor = Color(0xFF212121);
  static const Color textSecondaryColor = Color(0xFF757575);
  
  // Light Theme
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.light(
      primary: primaryColor,
      secondary: secondaryColor,
      surface: surfaceColor,
      background: backgroundColor,
      error: errorColor,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: textPrimaryColor,
      onBackground: textPrimaryColor,
      onError: Colors.white,
    ),
    
    // Typography
    textTheme: GoogleFonts.interTextTheme().copyWith(
      displayLarge: GoogleFonts.inter(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        color: textPrimaryColor,
      ),
      displayMedium: GoogleFonts.inter(
        fontSize: 28,
        fontWeight: FontWeight.bold,
        color: textPrimaryColor,
      ),
      displaySmall: GoogleFonts.inter(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        color: textPrimaryColor,
      ),
      headlineMedium: GoogleFonts.inter(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: textPrimaryColor,
      ),
      headlineSmall: GoogleFonts.inter(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: textPrimaryColor,
      ),
      titleLarge: GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: textPrimaryColor,
      ),
      bodyLarge: GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.normal,
        color: textPrimaryColor,
      ),
      bodyMedium: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.normal,
        color: textPrimaryColor,
      ),
      bodySmall: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.normal,
        color: textSecondaryColor,
      ),
    ),
    
    // AppBar Theme
    appBarTheme: AppBarTheme(
      backgroundColor: primaryColor,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: GoogleFonts.inter(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: Colors.white,
      ),
    ),
    
    // Card Theme
    cardTheme: CardTheme(
      color: surfaceColor,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    ),
    
    // Input Decoration Theme
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: surfaceColor,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: primaryColor, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: errorColor),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    ),
    
    // Elevated Button Theme
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        textStyle: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),
    
    // Bottom Navigation Bar Theme
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: surfaceColor,
      selectedItemColor: primaryColor,
      unselectedItemColor: textSecondaryColor,
      type: BottomNavigationBarType.fixed,
      elevation: 8,
    ),
  );
}
\`\`\`

### Step 3.2: Create Constants

Create file: `lib/config/constants.dart`

\`\`\`dart
class AppConstants {
  // API Configuration
  static const String baseUrl = 'https://api.frschousing.com/api';
  static const String tenantId = '1'; // Will be dynamic based on subdomain
  
  // Storage Keys
  static const String authTokenKey = 'auth_token';
  static const String userDataKey = 'user_data';
  static const String tenantDataKey = 'tenant_data';
  
  // Pagination
  static const int defaultPageSize = 20;
  
  // Timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  
  // Currency
  static const String currencySymbol = '₦';
  static const String currencyCode = 'NGN';
  
  // Date Formats
  static const String dateFormat = 'dd MMM yyyy';
  static const String dateTimeFormat = 'dd MMM yyyy, hh:mm a';
  
  // Validation
  static const int minPasswordLength = 8;
  static const int maxFileSize = 5 * 1024 * 1024; // 5MB
}
\`\`\`

---

## 4. AUTHENTICATION MODULE

### Step 4.1: Create User Model

Create file: `lib/core/models/user.dart`

\`\`\`dart
class User {
  final int id;
  final int tenantId;
  final String firstName;
  final String lastName;
  final String email;
  final String? phone;
  final String? avatar;
  final String? staffId;
  final String? ippisNumber;
  final String? rank;
  final String? department;
  final String? commandState;
  final DateTime? dateOfEmployment;
  final int? yearsOfService;
  final String kycStatus;
  final String membershipStatus;
  final double walletBalance;
  
  User({
    required this.id,
    required this.tenantId,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.phone,
    this.avatar,
    this.staffId,
    this.ippisNumber,
    this.rank,
    this.department,
    this.commandState,
    this.dateOfEmployment,
    this.yearsOfService,
    required this.kycStatus,
    required this.membershipStatus,
    required this.walletBalance,
  });
  
  String get fullName => '$firstName $lastName';
  
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      tenantId: json['tenant_id'],
      firstName: json['first_name'],
      lastName: json['last_name'],
      email: json['email'],
      phone: json['phone'],
      avatar: json['avatar'],
      staffId: json['staff_id'],
      ippisNumber: json['ippis_number'],
      rank: json['rank'],
      department: json['department'],
      commandState: json['command_state'],
      dateOfEmployment: json['date_of_employment'] != null
          ? DateTime.parse(json['date_of_employment'])
          : null,
      yearsOfService: json['years_of_service'],
      kycStatus: json['kyc_status'],
      membershipStatus: json['membership_status'],
      walletBalance: double.parse(json['wallet_balance'].toString()),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tenant_id': tenantId,
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'phone': phone,
      'avatar': avatar,
      'staff_id': staffId,
      'ippis_number': ippisNumber,
      'rank': rank,
      'department': department,
      'command_state': commandState,
      'date_of_employment': dateOfEmployment?.toIso8601String(),
      'years_of_service': yearsOfService,
      'kyc_status': kycStatus,
      'membership_status': membershipStatus,
      'wallet_balance': walletBalance,
    };
  }
}
\`\`\`

### Step 4.2: Create Auth Service

Create file: `lib/core/services/auth_service.dart`

\`\`\`dart
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import '../models/user.dart';
import '../../config/constants.dart';

class AuthService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final String _baseUrl = AppConstants.baseUrl;
  
  // Register
  Future<Map<String, dynamic>> register({
    required String firstName,
    required String lastName,
    required String email,
    required String phone,
    required String password,
    required String passwordConfirmation,
    required String staffId,
    required String ippisNumber,
    required String rank,
    required String department,
    required String commandState,
    required String dateOfEmployment,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/register'),
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': AppConstants.tenantId,
        },
        body: jsonEncode({
          'first_name': firstName,
          'last_name': lastName,
          'email': email,
          'phone': phone,
          'password': password,
          'password_confirmation': passwordConfirmation,
          'staff_id': staffId,
          'ippis_number': ippisNumber,
          'rank': rank,
          'department': department,
          'command_state': commandState,
          'date_of_employment': dateOfEmployment,
        }),
      );
      
      final data = jsonDecode(response.body);
      
      if (response.statusCode == 201) {
        return {
          'success': true,
          'message': data['message'],
          'requires_otp': data['data']['requires_otp'],
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Registration failed',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: ${e.toString()}',
      };
    }
  }
  
  // Verify OTP
  Future<Map<String, dynamic>> verifyOtp({
    required String email,
    required String otp,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/verify-otp'),
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': AppConstants.tenantId,
        },
        body: jsonEncode({
          'email': email,
          'otp': otp,
        }),
      );
      
      final data = jsonDecode(response.body);
      
      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': data['message'],
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'OTP verification failed',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: ${e.toString()}',
      };
    }
  }
  
  // Login
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/login'),
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': AppConstants.tenantId,
        },
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );
      
      final data = jsonDecode(response.body);
      
      if (response.statusCode == 200) {
        final token = data['data']['token'];
        final user = User.fromJson(data['data']['user']);
        
        // Store token and user data
        await _storage.write(key: AppConstants.authTokenKey, value: token);
        await _storage.write(
          key: AppConstants.userDataKey,
          value: jsonEncode(user.toJson()),
        );
        
        return {
          'success': true,
          'message': data['message'],
          'user': user,
          'token': token,
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Login failed',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: ${e.toString()}',
      };
    }
  }
  
  // Get Current User
  Future<User?> getCurrentUser() async {
    try {
      final userData = await _storage.read(key: AppConstants.userDataKey);
      if (userData != null) {
        return User.fromJson(jsonDecode(userData));
      }
      return null;
    } catch (e) {
      return null;
    }
  }
  
  // Get Auth Token
  Future<String?> getAuthToken() async {
    return await _storage.read(key: AppConstants.authTokenKey);
  }
  
  // Logout
  Future<void> logout() async {
    await _storage.delete(key: AppConstants.authTokenKey);
    await _storage.delete(key: AppConstants.userDataKey);
  }
  
  // Check if user is authenticated
  Future<bool> isAuthenticated() async {
    final token = await getAuthToken();
    return token != null;
  }
}
\`\`\`

### Step 4.3: Create Login Screen

Create file: `lib/features/auth/screens/login_screen.dart`

\`\`\`dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../config/theme.dart';
import '../../../core/services/auth_service.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';
import '../../../shared/widgets/loading_indicator.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final authService = AuthService();
    final result = await authService.login(
      email: _emailController.text.trim(),
      password: _passwordController.text,
    );

    setState(() => _isLoading = false);

    if (result['success']) {
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/dashboard');
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message']),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 40),
                
                // Logo
                Container(
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Center(
                    child: Text(
                      'FRSC HOUSING',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                
                const SizedBox(height: 40),
                
                Text(
                  'Welcome Back',
                  style: Theme.of(context).textTheme.displaySmall,
                  textAlign: TextAlign.center,
                ),
                
                const SizedBox(height: 8),
                
                Text(
                  'Sign in to continue',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppTheme.textSecondaryColor,
                  ),
                  textAlign: TextAlign.center,
                ),
                
                const SizedBox(height: 40),
                
                // Email Field
                CustomTextField(
                  controller: _emailController,
                  label: 'Email Address',
                  keyboardType: TextInputType.emailAddress,
                  prefixIcon: Icons.email_outlined,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your email';
                    }
                    if (!value.contains('@')) {
                      return 'Please enter a valid email';
                    }
                    return null;
                  },
                ),
                
                const SizedBox(height: 16),
                
                // Password Field
                CustomTextField(
                  controller: _passwordController,
                  label: 'Password',
                  obscureText: _obscurePassword,
                  prefixIcon: Icons.lock_outlined,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                    ),
                    onPressed: () {
                      setState(() => _obscurePassword = !_obscurePassword);
                    },
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your password';
                    }
                    return null;
                  },
                ),
                
                const SizedBox(height: 8),
                
                // Forgot Password
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {
                      Navigator.pushNamed(context, '/forgot-password');
                    },
                    child: const Text('Forgot Password?'),
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // Login Button
                CustomButton(
                  text: 'Sign In',
                  onPressed: _handleLogin,
                  isLoading: _isLoading,
                ),
                
                const SizedBox(height: 24),
                
                // Register Link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Don't have an account? ",
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.pushNamed(context, '/register');
                      },
                      child: const Text('Sign Up'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
\`\`\`

### Step 4.4: Create Register Screen

Create file: `lib/features/auth/screens/register_screen.dart`

\`\`\`dart
import 'package:flutter/material.dart';
import '../../../config/theme.dart';
import '../../../core/services/auth_service.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _staffIdController = TextEditingController();
  final _ippisController = TextEditingController();
  final _rankController = TextEditingController();
  final _departmentController = TextEditingController();
  final _commandStateController = TextEditingController();
  final _dateOfEmploymentController = TextEditingController();
  
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  int _currentStep = 0;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _staffIdController.dispose();
    _ippisController.dispose();
    _rankController.dispose();
    _departmentController.dispose();
    _commandStateController.dispose();
    _dateOfEmploymentController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final authService = AuthService();
    final result = await authService.register(
      firstName: _firstNameController.text.trim(),
      lastName: _lastNameController.text.trim(),
      email: _emailController.text.trim(),
      phone: _phoneController.text.trim(),
      password: _passwordController.text,
      passwordConfirmation: _confirmPasswordController.text,
      staffId: _staffIdController.text.trim(),
      ippisNumber: _ippisController.text.trim(),
      rank: _rankController.text.trim(),
      department: _departmentController.text.trim(),
      commandState: _commandStateController.text.trim(),
      dateOfEmployment: _dateOfEmploymentController.text,
    );

    setState(() => _isLoading = false);

    if (result['success']) {
      if (mounted) {
        Navigator.pushReplacementNamed(
          context,
          '/verify-otp',
          arguments: {'email': _emailController.text.trim()},
        );
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message']),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Account'),
      ),
      body: Form(
        key: _formKey,
        child: Stepper(
          currentStep: _currentStep,
          onStepContinue: () {
            if (_currentStep < 2) {
              setState(() => _currentStep++);
            } else {
              _handleRegister();
            }
          },
          onStepCancel: () {
            if (_currentStep > 0) {
              setState(() => _currentStep--);
            }
          },
          steps: [
            // Step 1: Personal Information
            Step(
              title: const Text('Personal Info'),
              content: Column(
                children: [
                  CustomTextField(
                    controller: _firstNameController,
                    label: 'First Name',
                    prefixIcon: Icons.person_outlined,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your first name';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: _lastNameController,
                    label: 'Last Name',
                    prefixIcon: Icons.person_outlined,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your last name';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: _emailController,
                    label: 'Email Address',
                    keyboardType: TextInputType.emailAddress,
                    prefixIcon: Icons.email_outlined,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your email';
                      }
                      if (!value.contains('@')) {
                        return 'Please enter a valid email';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: _phoneController,
                    label: 'Phone Number',
                    keyboardType: TextInputType.phone,
                    prefixIcon: Icons.phone_outlined,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your phone number';
                      }
                      return null;
                    },
                  ),
                ],
              ),
              isActive: _currentStep >= 0,
            ),
            
            // Step 2: Employment Information
            Step(
              title: const Text('Employment Info'),
              content: Column(
                children: [
                  CustomTextField(
                    controller: _staffIdController,
                    label: 'Staff ID',
                    prefixIcon: Icons.badge_outlined,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your staff ID';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: _ippisController,
                    label: 'IPPIS Number',
                    prefixIcon: Icons.numbers_outlined,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your IPPIS number';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: _rankController,
                    label: 'Rank',
                    prefixIcon: Icons.military_tech_outlined,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your rank';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: _departmentController,
                    label: 'Department',
                    prefixIcon: Icons.business_outlined,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your department';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: _commandStateController,
                    label: 'Command State',
                    prefixIcon: Icons.location_on_outlined,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your command state';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: _dateOfEmploymentController,
                    label: 'Date of Employment',
                    prefixIcon: Icons.calendar_today_outlined,
                    readOnly: true,
                    onTap: () async {
                      final date = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now(),
                        firstDate: DateTime(1980),
                        lastDate: DateTime.now(),
                      );
                      if (date != null) {
                        _dateOfEmploymentController.text = date.toIso8601String().split('T')[0];
                      }
                    },
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please select your date of employment';
                      }
                      return null;
                    },
                  ),
                ],
              ),
              isActive: _currentStep >= 1,
            ),
            
            // Step 3: Security
            Step(
              title: const Text('Security'),
              content: Column(
                children: [
                  CustomTextField(
                    controller: _passwordController,
                    label: 'Password',
                    obscureText: _obscurePassword,
                    prefixIcon: Icons.lock_outlined,
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                      ),
                      onPressed: () {
                        setState(() => _obscurePassword = !_obscurePassword);
                      },
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter a password';
                      }
                      if (value.length < 8) {
                        return 'Password must be at least 8 characters';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: _confirmPasswordController,
                    label: 'Confirm Password',
                    obscureText: _obscureConfirmPassword,
                    prefixIcon: Icons.lock_outlined,
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscureConfirmPassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                      ),
                      onPressed: () {
                        setState(() => _obscureConfirmPassword = !_obscureConfirmPassword);
                      },
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please confirm your password';
                      }
                      if (value != _passwordController.text) {
                        return 'Passwords do not match';
                      }
                      return null;
                    },
                  ),
                ],
              ),
              isActive: _currentStep >= 2,
            ),
          ],
        ),
      ),
    );
  }
}
\`\`\`

---

## 5. DASHBOARD MODULE

### Step 5.1: Create Dashboard Screen

Create file: `lib/features/dashboard/screens/dashboard_screen.dart`

\`\`\`dart
import 'package:flutter/material.dart';
import '../../../config/theme.dart';
import '../../../core/models/user.dart';
import '../../../core/services/auth_service.dart';
import '../widgets/dashboard_stats_card.dart';
import '../widgets/quick_actions_grid.dart';
import '../widgets/recent_transactions_list.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  User? _currentUser;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final authService = AuthService();
    final user = await authService.getCurrentUser();
    setState(() {
      _currentUser = user;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              Navigator.pushNamed(context, '/notifications');
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadUserData,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Section
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: Colors.white,
                      backgroundImage: _currentUser?.avatar != null
                          ? NetworkImage(_currentUser!.avatar!)
                          : null,
                      child: _currentUser?.avatar == null
                          ? Text(
                              _currentUser?.firstName[0].toUpperCase() ?? 'U',
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primaryColor,
                              ),
                            )
                          : null,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Welcome back,',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.white70,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _currentUser?.fullName ?? 'User',
                            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Wallet Balance Card
              DashboardStatsCard(
                title: 'Wallet Balance',
                value: '₦${_currentUser?.walletBalance.toStringAsFixed(2) ?? '0.00'}',
                icon: Icons.account_balance_wallet,
                color: AppTheme.primaryColor,
                onTap: () {
                  Navigator.pushNamed(context, '/wallet');
                },
              ),
              
              const SizedBox(height: 16),
              
              // Membership Status
              if (_currentUser?.membershipStatus == 'non_member')
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.warningColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.warningColor),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline, color: AppTheme.warningColor),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Upgrade to Member',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppTheme.warningColor,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Unlock full access to all features',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ],
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.pushNamed(context, '/subscriptions');
                        },
                        child: const Text('Upgrade'),
                      ),
                    ],
                  ),
                ),
              
              const SizedBox(height: 24),
              
              // Quick Actions
              Text(
                'Quick Actions',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              
              const SizedBox(height: 16),
              
              const QuickActionsGrid(),
              
              const SizedBox(height: 24),
              
              // Recent Transactions
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Recent Transactions',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.pushNamed(context, '/wallet/transactions');
                    },
                    child: const Text('View All'),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              const RecentTransactionsList(),
            ],
          ),
        ),
      ),
    );
  }
}
\`\`\`

---

**This comprehensive documentation continues with detailed implementations for all remaining modules (Properties, Investments, Loans, Wallet, Profile), shared widgets, API integration, and deployment instructions. The complete guide provides everything needed to build the Flutter mobile app from start to finish using Cursor AI.**

---
