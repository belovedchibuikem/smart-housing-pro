# CURSOR AI IDE - Complete Flutter Mobile App Development Guide
## FRSC Housing Management User Dashboard

> **Purpose**: This document provides comprehensive, step-by-step instructions for building the complete Flutter mobile application for the FRSC Housing Management System user dashboard using Cursor AI IDE. Follow this guide sequentially to build a production-ready mobile app.

---

## Table of Contents
1. [Project Setup & Architecture](#1-project-setup--architecture)
2. [State Management & Services](#2-state-management--services)
3. [Authentication Flow](#3-authentication-flow)
4. [Dashboard & Home Screen](#4-dashboard--home-screen)
5. [Profile & KYC Management](#5-profile--kyc-management)
6. [Wallet & Transactions](#6-wallet--transactions)
7. [Loans Management](#7-loans-management)
8. [Investments Management](#8-investments-management)
9. [Properties & Allotments](#9-properties--allotments)
10. [Contributions Management](#10-contributions-management)
11. [Mail Service](#11-mail-service)
12. [Documents & Settings](#12-documents--settings)
13. [Notifications](#13-notifications)
14. [Testing & Deployment](#14-testing--deployment)

---

## 1. Project Setup & Architecture

### 1.1 Initialize Flutter Project

\`\`\`bash
# Create new Flutter project
flutter create frsc_housing_mobile
cd frsc_housing_mobile

# Add required dependencies
flutter pub add provider
flutter pub add http
flutter pub add shared_preferences
flutter pub add flutter_secure_storage
flutter pub add cached_network_image
flutter pub add image_picker
flutter pub add file_picker
flutter pub add intl
flutter pub add fl_chart
flutter pub add shimmer
flutter pub add pull_to_refresh
flutter pub add flutter_svg
flutter pub add url_launcher
flutter pub add share_plus
flutter pub add permission_handler
flutter pub add flutter_local_notifications
flutter pub add firebase_core
flutter pub add firebase_messaging
flutter pub add flutter_dotenv

# Development dependencies
flutter pub add --dev flutter_launcher_icons
flutter pub add --dev flutter_native_splash
\`\`\`

### 1.2 Project Structure

\`\`\`
lib/
├── main.dart
├── app.dart
├── config/
│   ├── app_config.dart
│   ├── theme.dart
│   └── routes.dart
├── core/
│   ├── constants/
│   │   ├── api_constants.dart
│   │   ├── app_constants.dart
│   │   └── storage_keys.dart
│   ├── utils/
│   │   ├── date_utils.dart
│   │   ├── currency_utils.dart
│   │   ├── validators.dart
│   │   └── helpers.dart
│   └── errors/
│       └── exceptions.dart
├── data/
│   ├── models/
│   │   ├── user_model.dart
│   │   ├── loan_model.dart
│   │   ├── investment_model.dart
│   │   ├── property_model.dart
│   │   ├── transaction_model.dart
│   │   └── notification_model.dart
│   ├── repositories/
│   │   ├── auth_repository.dart
│   │   ├── user_repository.dart
│   │   ├── loan_repository.dart
│   │   ├── investment_repository.dart
│   │   ├── property_repository.dart
│   │   └── wallet_repository.dart
│   └── services/
│       ├── api_service.dart
│       ├── storage_service.dart
│       ├── notification_service.dart
│       └── payment_service.dart
├── presentation/
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   ├── user_provider.dart
│   │   ├── loan_provider.dart
│   │   ├── investment_provider.dart
│   │   └── theme_provider.dart
│   ├── screens/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── wallet/
│   │   ├── loans/
│   │   ├── investments/
│   │   ├── properties/
│   │   ├── contributions/
│   │   ├── mail/
│   │   └── settings/
│   └── widgets/
│       ├── common/
│       ├── cards/
│       ├── buttons/
│       └── forms/
└── l10n/
    └── app_en.arb
\`\`\`

### 1.3 App Configuration

\`\`\`dart
// lib/config/app_config.dart

class AppConfig {
  // API Configuration
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.frschousing.com',
  );
  
  static const String apiVersion = 'v1';
  static const String apiPrefix = '/api/$apiVersion';
  
  // App Information
  static const String appName = 'FRSC Housing';
  static const String appVersion = '1.0.0';
  static const String appBuildNumber = '1';
  
  // Timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  
  // Pagination
  static const int defaultPageSize = 20;
  
  // Cache
  static const Duration cacheExpiry = Duration(hours: 1);
  
  // File Upload
  static const int maxFileSize = 5 * 1024 * 1024; // 5MB
  static const List<String> allowedImageTypes = ['jpg', 'jpeg', 'png'];
  static const List<String> allowedDocumentTypes = ['pdf', 'doc', 'docx'];
}
\`\`\`

### 1.4 Theme Configuration

\`\`\`dart
// lib/config/theme.dart

import 'package:flutter/material.dart';

class AppTheme {
  // Brand Colors
  static const Color primaryGold = Color(0xFFFDB11E);
  static const Color secondaryGreen = Color(0xFF276254);
  
  // Neutral Colors
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
  static const Color grey50 = Color(0xFFFAFAFA);
  static const Color grey100 = Color(0xFFF5F5F5);
  static const Color grey200 = Color(0xFFEEEEEE);
  static const Color grey300 = Color(0xFFE0E0E0);
  static const Color grey400 = Color(0xFFBDBDBD);
  static const Color grey500 = Color(0xFF9E9E9E);
  static const Color grey600 = Color(0xFF757575);
  static const Color grey700 = Color(0xFF616161);
  static const Color grey800 = Color(0xFF424242);
  static const Color grey900 = Color(0xFF212121);
  
  // Status Colors
  static const Color success = Color(0xFF4CAF50);
  static const Color error = Color(0xFFF44336);
  static const Color warning = Color(0xFFFF9800);
  static const Color info = Color(0xFF2196F3);
  
  // Light Theme
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    primaryColor: primaryGold,
    scaffoldBackgroundColor: grey50,
    
    colorScheme: const ColorScheme.light(
      primary: primaryGold,
      secondary: secondaryGreen,
      surface: white,
      background: grey50,
      error: error,
      onPrimary: white,
      onSecondary: white,
      onSurface: grey900,
      onBackground: grey900,
      onError: white,
    ),
    
    appBarTheme: const AppBarTheme(
      backgroundColor: white,
      foregroundColor: grey900,
      elevation: 0,
      centerTitle: true,
      iconTheme: IconThemeData(color: grey900),
    ),
    
    cardTheme: CardTheme(
      color: white,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    ),
    
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryGold,
        foregroundColor: white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        elevation: 0,
      ),
    ),
    
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: primaryGold,
        side: const BorderSide(color: primaryGold),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    ),
    
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: grey100,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: primaryGold, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: error),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    ),
    
    textTheme: const TextTheme(
      displayLarge: TextStyle(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        color: grey900,
      ),
      displayMedium: TextStyle(
        fontSize: 28,
        fontWeight: FontWeight.bold,
        color: grey900,
      ),
      displaySmall: TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        color: grey900,
      ),
      headlineMedium: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: grey900,
      ),
      headlineSmall: TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: grey900,
      ),
      titleLarge: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: grey900,
      ),
      bodyLarge: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.normal,
        color: grey900,
      ),
      bodyMedium: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.normal,
        color: grey700,
      ),
      bodySmall: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.normal,
        color: grey600,
      ),
    ),
  );
  
  // Dark Theme
  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    primaryColor: primaryGold,
    scaffoldBackgroundColor: grey900,
    
    colorScheme: const ColorScheme.dark(
      primary: primaryGold,
      secondary: secondaryGreen,
      surface: grey800,
      background: grey900,
      error: error,
      onPrimary: grey900,
      onSecondary: white,
      onSurface: white,
      onBackground: white,
      onError: white,
    ),
    
    appBarTheme: const AppBarTheme(
      backgroundColor: grey900,
      foregroundColor: white,
      elevation: 0,
      centerTitle: true,
      iconTheme: IconThemeData(color: white),
    ),
    
    cardTheme: CardTheme(
      color: grey800,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    ),
    
    // ... similar configurations for dark theme
  );
}
\`\`\`

### 1.5 Routes Configuration

\`\`\`dart
// lib/config/routes.dart

import 'package:flutter/material.dart';
import 'package:frsc_housing_mobile/presentation/screens/auth/login_screen.dart';
import 'package:frsc_housing_mobile/presentation/screens/auth/register_screen.dart';
import 'package:frsc_housing_mobile/presentation/screens/auth/forgot_password_screen.dart';
import 'package:frsc_housing_mobile/presentation/screens/dashboard/dashboard_screen.dart';
// ... import other screens

class AppRoutes {
  // Auth Routes
  static const String login = '/login';
  static const String register = '/register';
  static const String forgotPassword = '/forgot-password';
  static const String verifyEmail = '/verify-email';
  
  // Main Routes
  static const String dashboard = '/dashboard';
  static const String profile = '/profile';
  static const String editProfile = '/edit-profile';
  
  // KYC Routes
  static const String kyc = '/kyc';
  static const String kycStatus = '/kyc-status';
  
  // Wallet Routes
  static const String wallet = '/wallet';
  static const String topUp = '/wallet/top-up';
  static const String transfer = '/wallet/transfer';
  static const String transactions = '/wallet/transactions';
  
  // Loan Routes
  static const String loans = '/loans';
  static const String loanDetails = '/loans/details';
  static const String applyLoan = '/loans/apply';
  static const String loanRepayment = '/loans/repayment';
  
  // Investment Routes
  static const String investments = '/investments';
  static const String investmentDetails = '/investments/details';
  static const String createInvestment = '/investments/create';
  
  // Property Routes
  static const String properties = '/properties';
  static const String propertyDetails = '/properties/details';
  static const String myProperties = '/properties/my-properties';
  static const String applyProperty = '/properties/apply';
  
  // Contribution Routes
  static const String contributions = '/contributions';
  static const String contributionHistory = '/contributions/history';
  static const String makeContribution = '/contributions/make';
  
  // Mail Routes
  static const String mail = '/mail';
  static const String mailDetails = '/mail/details';
  static const String composeMail = '/mail/compose';
  
  // Document Routes
  static const String documents = '/documents';
  
  // Settings Routes
  static const String settings = '/settings';
  static const String changePassword = '/settings/change-password';
  static const String notifications = '/settings/notifications';
  
  static Map<String, WidgetBuilder> routes = {
    login: (context) => const LoginScreen(),
    register: (context) => const RegisterScreen(),
    forgotPassword: (context) => const ForgotPasswordScreen(),
    dashboard: (context) => const DashboardScreen(),
    // ... map other routes
  };
  
  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case loanDetails:
        final loanId = settings.arguments as String;
        return MaterialPageRoute(
          builder: (context) => LoanDetailsScreen(loanId: loanId),
        );
      
      case propertyDetails:
        final propertyId = settings.arguments as String;
        return MaterialPageRoute(
          builder: (context) => PropertyDetailsScreen(propertyId: propertyId),
        );
      
      // ... handle other parameterized routes
      
      default:
        return MaterialPageRoute(
          builder: (context) => const Scaffold(
            body: Center(child: Text('Page not found')),
          ),
        );
    }
  }
}
\`\`\`

---

## 2. State Management & Services

### 2.1 API Service

\`\`\`dart
// lib/data/services/api_service.dart

import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:frsc_housing_mobile/config/app_config.dart';
import 'package:frsc_housing_mobile/data/services/storage_service.dart';
import 'package:frsc_housing_mobile/core/errors/exceptions.dart';

class ApiService {
  final StorageService _storageService;
  late final http.Client _client;
  
  ApiService(this._storageService) {
    _client = http.Client();
  }
  
  String get baseUrl => AppConfig.baseUrl + AppConfig.apiPrefix;
  
  Future<Map<String, String>> _getHeaders({bool requiresAuth = true}) async {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (requiresAuth) {
      final token = await _storageService.getToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    
    // Add tenant identification
    final tenantDomain = await _storageService.getTenantDomain();
    if (tenantDomain != null) {
      headers['X-Tenant-Domain'] = tenantDomain;
    }
    
    return headers;
  }
  
  Future<dynamic> get(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
    bool requiresAuth = true,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint').replace(
        queryParameters: queryParameters,
      );
      
      final headers = await _getHeaders(requiresAuth: requiresAuth);
      
      final response = await _client
          .get(uri, headers: headers)
          .timeout(AppConfig.connectionTimeout);
      
      return _handleResponse(response);
    } on SocketException {
      throw NetworkException('No internet connection');
    } on HttpException {
      throw NetworkException('Could not connect to server');
    } catch (e) {
      throw ApiException('An error occurred: $e');
    }
  }
  
  Future<dynamic> post(
    String endpoint, {
    Map<String, dynamic>? body,
    bool requiresAuth = true,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');
      final headers = await _getHeaders(requiresAuth: requiresAuth);
      
      final response = await _client
          .post(
            uri,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(AppConfig.connectionTimeout);
      
      return _handleResponse(response);
    } on SocketException {
      throw NetworkException('No internet connection');
    } on HttpException {
      throw NetworkException('Could not connect to server');
    } catch (e) {
      throw ApiException('An error occurred: $e');
    }
  }
  
  Future<dynamic> put(
    String endpoint, {
    Map<String, dynamic>? body,
    bool requiresAuth = true,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');
      final headers = await _getHeaders(requiresAuth: requiresAuth);
      
      final response = await _client
          .put(
            uri,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(AppConfig.connectionTimeout);
      
      return _handleResponse(response);
    } on SocketException {
      throw NetworkException('No internet connection');
    } on HttpException {
      throw NetworkException('Could not connect to server');
    } catch (e) {
      throw ApiException('An error occurred: $e');
    }
  }
  
  Future<dynamic> delete(
    String endpoint, {
    bool requiresAuth = true,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');
      final headers = await _getHeaders(requiresAuth: requiresAuth);
      
      final response = await _client
          .delete(uri, headers: headers)
          .timeout(AppConfig.connectionTimeout);
      
      return _handleResponse(response);
    } on SocketException {
      throw NetworkException('No internet connection');
    } on HttpException {
      throw NetworkException('Could not connect to server');
    } catch (e) {
      throw ApiException('An error occurred: $e');
    }
  }
  
  Future<dynamic> uploadFile(
    String endpoint,
    File file, {
    Map<String, String>? fields,
    String fileField = 'file',
    bool requiresAuth = true,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');
      final headers = await _getHeaders(requiresAuth: requiresAuth);
      headers.remove('Content-Type'); // Let multipart set its own content type
      
      final request = http.MultipartRequest('POST', uri);
      request.headers.addAll(headers);
      
      if (fields != null) {
        request.fields.addAll(fields);
      }
      
      request.files.add(
        await http.MultipartFile.fromPath(fileField, file.path),
      );
      
      final streamedResponse = await request.send()
          .timeout(AppConfig.connectionTimeout);
      
      final response = await http.Response.fromStream(streamedResponse);
      
      return _handleResponse(response);
    } on SocketException {
      throw NetworkException('No internet connection');
    } on HttpException {
      throw NetworkException('Could not connect to server');
    } catch (e) {
      throw ApiException('An error occurred: $e');
    }
  }
  
  dynamic _handleResponse(http.Response response) {
    final statusCode = response.statusCode;
    final body = response.body;
    
    if (statusCode >= 200 && statusCode < 300) {
      if (body.isEmpty) return null;
      return jsonDecode(body);
    } else if (statusCode == 401) {
      throw UnauthorizedException('Unauthorized access');
    } else if (statusCode == 403) {
      throw ForbiddenException('Access forbidden');
    } else if (statusCode == 404) {
      throw NotFoundException('Resource not found');
    } else if (statusCode == 422) {
      final data = jsonDecode(body);
      throw ValidationException(
        data['message'] ?? 'Validation error',
        errors: data['errors'],
      );
    } else if (statusCode >= 500) {
      throw ServerException('Server error occurred');
    } else {
      throw ApiException('Request failed with status: $statusCode');
    }
  }
  
  void dispose() {
    _client.close();
  }
}
\`\`\`

### 2.2 Storage Service

\`\`\`dart
// lib/data/services/storage_service.dart

import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:frsc_housing_mobile/core/constants/storage_keys.dart';

class StorageService {
  late final SharedPreferences _prefs;
  late final FlutterSecureStorage _secureStorage;
  
  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    _secureStorage = const FlutterSecureStorage();
  }
  
  // Token Management
  Future<void> saveToken(String token) async {
    await _secureStorage.write(key: StorageKeys.authToken, value: token);
  }
  
  Future<String?> getToken() async {
    return await _secureStorage.read(key: StorageKeys.authToken);
  }
  
  Future<void> deleteToken() async {
    await _secureStorage.delete(key: StorageKeys.authToken);
  }
  
  // User Data
  Future<void> saveUser(Map<String, dynamic> user) async {
    await _prefs.setString(StorageKeys.userData, jsonEncode(user));
  }
  
  Future<Map<String, dynamic>?> getUser() async {
    final userJson = _prefs.getString(StorageKeys.userData);
    if (userJson != null) {
      return jsonDecode(userJson);
    }
    return null;
  }
  
  Future<void> deleteUser() async {
    await _prefs.remove(StorageKeys.userData);
  }
  
  // Tenant Domain
  Future<void> saveTenantDomain(String domain) async {
    await _prefs.setString(StorageKeys.tenantDomain, domain);
  }
  
  Future<String?> getTenantDomain() async {
    return _prefs.getString(StorageKeys.tenantDomain);
  }
  
  // Theme
  Future<void> saveThemeMode(bool isDark) async {
    await _prefs.setBool(StorageKeys.isDarkMode, isDark);
  }
  
  Future<bool> getThemeMode() async {
    return _prefs.getBool(StorageKeys.isDarkMode) ?? false;
  }
  
  // Onboarding
  Future<void> setOnboardingComplete() async {
    await _prefs.setBool(StorageKeys.onboardingComplete, true);
  }
  
  Future<bool> isOnboardingComplete() async {
    return _prefs.getBool(StorageKeys.onboardingComplete) ?? false;
  }
  
  // Clear all data
  Future<void> clearAll() async {
    await _secureStorage.deleteAll();
    await _prefs.clear();
  }
}
\`\`\`

### 2.3 Auth Provider

\`\`\`dart
// lib/presentation/providers/auth_provider.dart

import 'package:flutter/foundation.dart';
import 'package:frsc_housing_mobile/data/models/user_model.dart';
import 'package:frsc_housing_mobile/data/repositories/auth_repository.dart';
import 'package:frsc_housing_mobile/data/services/storage_service.dart';

enum AuthStatus {
  initial,
  authenticated,
  unauthenticated,
  loading,
}

class AuthProvider with ChangeNotifier {
  final AuthRepository _authRepository;
  final StorageService _storageService;
  
  AuthProvider(this._authRepository, this._storageService) {
    _checkAuthStatus();
  }
  
  AuthStatus _status = AuthStatus.initial;
  UserModel? _user;
  String? _error;
  
  AuthStatus get status => _status;
  UserModel? get user => _user;
  String? get error => _error;
  bool get isAuthenticated => _status == AuthStatus.authenticated;
  
  Future<void> _checkAuthStatus() async {
    final token = await _storageService.getToken();
    if (token != null) {
      try {
        final userData = await _storageService.getUser();
        if (userData != null) {
          _user = UserModel.fromJson(userData);
          _status = AuthStatus.authenticated;
        } else {
          _status = AuthStatus.unauthenticated;
        }
      } catch (e) {
        _status = AuthStatus.unauthenticated;
      }
    } else {
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }
  
  Future<bool> login(String email, String password) async {
    _status = AuthStatus.loading;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _authRepository.login(email, password);
      
      await _storageService.saveToken(response['token']);
      await _storageService.saveUser(response['user']);
      
      _user = UserModel.fromJson(response['user']);
      _status = AuthStatus.authenticated;
      notifyListeners();
      
      return true;
    } catch (e) {
      _error = e.toString();
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return false;
    }
  }
  
  Future<bool> register(Map<String, dynamic> data) async {
    _status = AuthStatus.loading;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _authRepository.register(data);
      
      // Registration successful, but email verification required
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      
      return true;
    } catch (e) {
      _error = e.toString();
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return false;
    }
  }
  
  Future<bool> verifyEmail(String userId, String otp) async {
    _status = AuthStatus.loading;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _authRepository.verifyEmail(userId, otp);
      
      await _storageService.saveToken(response['token']);
      await _storageService.saveUser(response['user']);
      
      _user = UserModel.fromJson(response['user']);
      _status = AuthStatus.authenticated;
      notifyListeners();
      
      return true;
    } catch (e) {
      _error = e.toString();
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return false;
    }
  }
  
  Future<void> logout() async {
    try {
      await _authRepository.logout();
    } catch (e) {
      // Ignore logout errors
    } finally {
      await _storageService.clearAll();
      _user = null;
      _status = AuthStatus.unauthenticated;
      notifyListeners();
    }
  }
  
  Future<void> refreshUser() async {
    try {
      final response = await _authRepository.getCurrentUser();
      _user = UserModel.fromJson(response['user']);
      await _storageService.saveUser(response['user']);
      notifyListeners();
    } catch (e) {
      // Handle error silently
    }
  }
}
\`\`\`

---

**Continue to Part 2 for remaining sections...**

This is Part 1 of the comprehensive Flutter Mobile App guide. The document continues with:
- User Models
- Dashboard Implementation
- Profile & KYC Screens
- Wallet & Transactions
- Loans Management
- Investments Management
- Properties & Allotments
- Contributions
- Mail Service
- Documents & Settings
- Notifications
- Testing & Deployment

Would you like me to continue with Part 2 of the Flutter guide?
