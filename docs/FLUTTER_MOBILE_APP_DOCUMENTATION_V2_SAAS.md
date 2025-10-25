# FRSC Housing Management - Flutter Mobile App Documentation (SaaS Multi-Tenant Version)

## Table of Contents
1. [Overview](#overview)
2. [Multi-Tenancy Architecture](#multi-tenancy-architecture)
3. [Design System](#design-system)
4. [Authentication Flow](#authentication-flow)
5. [User Dashboard](#user-dashboard)
6. [Core Features](#core-features)
7. [API Integration](#api-integration)
8. [State Management](#state-management)
9. [Implementation Guide](#implementation-guide)

---

## Overview

**App Type:** Multi-Tenant Mobile Application

**Platform:** Flutter (iOS & Android)

**Minimum SDK:**
- Android: API 21 (Android 5.0)
- iOS: 12.0

**Theme Colors:**
- Primary: `#FDB11E` (Gold/Orange)
- Secondary: `#276254` (Dark Teal/Green)

**Architecture:** Clean Architecture with BLoC Pattern

---

## Multi-Tenancy Architecture

### Tenant Resolution

The mobile app identifies the tenant through:

1. **Tenant Selection Screen** - User selects their organization
2. **Deep Links** - `yourapp://tenant-slug`
3. **QR Code** - Scan organization QR code
4. **Stored Preference** - Remember last used tenant

### Tenant Context Service

\`\`\`dart
class TenantService {
  static const String _tenantKey = 'selected_tenant';
  
  Future<Tenant?> getSelectedTenant() async {
    final prefs = await SharedPreferences.getInstance();
    final tenantJson = prefs.getString(_tenantKey);
    if (tenantJson != null) {
      return Tenant.fromJson(jsonDecode(tenantJson));
    }
    return null;
  }
  
  Future<void> setSelectedTenant(Tenant tenant) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tenantKey, jsonEncode(tenant.toJson()));
  }
  
  Future<void> clearTenant() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tenantKey);
  }
}

class Tenant {
  final int id;
  final String name;
  final String slug;
  final String? customDomain;
  final String? logo;
  final TenantTheme theme;
  
  Tenant({
    required this.id,
    required this.name,
    required this.slug,
    this.customDomain,
    this.logo,
    required this.theme,
  });
  
  String get baseUrl {
    if (customDomain != null) {
      return 'https://$customDomain/api/v1';
    }
    return 'https://$slug.yourplatform.com/api/v1';
  }
  
  factory Tenant.fromJson(Map<String, dynamic> json) {
    return Tenant(
      id: json['id'],
      name: json['name'],
      slug: json['slug'],
      customDomain: json['custom_domain'],
      logo: json['logo'],
      theme: TenantTheme.fromJson(json['theme'] ?? {}),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'custom_domain': customDomain,
      'logo': logo,
      'theme': theme.toJson(),
    };
  }
}

class TenantTheme {
  final Color primaryColor;
  final Color secondaryColor;
  
  TenantTheme({
    required this.primaryColor,
    required this.secondaryColor,
  });
  
  factory TenantTheme.fromJson(Map<String, dynamic> json) {
    return TenantTheme(
      primaryColor: _colorFromHex(json['primary_color'] ?? '#FDB11E'),
      secondaryColor: _colorFromHex(json['secondary_color'] ?? '#276254'),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'primary_color': _colorToHex(primaryColor),
      'secondary_color': _colorToHex(secondaryColor),
    };
  }
  
  static Color _colorFromHex(String hexString) {
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
    buffer.write(hexString.replaceFirst('#', ''));
    return Color(int.parse(buffer.toString(), radix: 16));
  }
  
  static String _colorToHex(Color color) {
    return '#${color.value.toRadixString(16).substring(2).toUpperCase()}';
  }
}
\`\`\`

---

## Design System

### App Colors (Dynamic based on Tenant)

\`\`\`dart
class AppColors {
  // Dynamic colors from tenant theme
  static Color primary = const Color(0xFFFDB11E);
  static Color secondary = const Color(0xFF276254);
  
  // Static colors
  static const Color background = Color(0xFFF5F5F5);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  static const Color divider = Color(0xFFE0E0E0);
  
  // Status colors
  static const Color success = Color(0xFF4CAF50);
  static const Color warning = Color(0xFFFFC107);
  static const Color error = Color(0xFFF44336);
  static const Color info = Color(0xFF2196F3);
  
  // Update colors from tenant theme
  static void updateFromTenant(TenantTheme theme) {
    primary = theme.primaryColor;
    secondary = theme.secondaryColor;
  }
}
\`\`\`

### Typography

\`\`\`dart
class AppTextStyles {
  static const String fontFamily = 'Inter';
  
  static const TextStyle h1 = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
    fontFamily: fontFamily,
  );
  
  static const TextStyle h2 = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
    fontFamily: fontFamily,
  );
  
  static const TextStyle h3 = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    fontFamily: fontFamily,
  );
  
  static const TextStyle bodyLarge = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.normal,
    height: 1.5,
    fontFamily: fontFamily,
  );
  
  static const TextStyle bodyMedium = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    height: 1.5,
    fontFamily: fontFamily,
  );
  
  static const TextStyle button = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
    fontFamily: fontFamily,
  );
}
\`\`\`

### Theme Configuration

\`\`\`dart
class AppTheme {
  static ThemeData getTheme(TenantTheme? tenantTheme) {
    final primaryColor = tenantTheme?.primaryColor ?? const Color(0xFFFDB11E);
    final secondaryColor = tenantTheme?.secondaryColor ?? const Color(0xFF276254);
    
    return ThemeData(
      primaryColor: primaryColor,
      colorScheme: ColorScheme.light(
        primary: primaryColor,
        secondary: secondaryColor,
        surface: AppColors.surface,
        background: AppColors.background,
        error: AppColors.error,
      ),
      scaffoldBackgroundColor: AppColors.background,
      fontFamily: AppTextStyles.fontFamily,
      appBarTheme: AppBarTheme(
        backgroundColor: primaryColor,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: AppTextStyles.h3.copyWith(color: Colors.white),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: AppTextStyles.button,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.divider),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.divider),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: primaryColor, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
      cardTheme: CardTheme(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
    );
  }
}
\`\`\`

---

## Authentication Flow

### 1. Tenant Selection Screen

\`\`\`dart
class TenantSelectionScreen extends StatefulWidget {
  @override
  _TenantSelectionScreenState createState() => _TenantSelectionScreenState();
}

class _TenantSelectionScreenState extends State<TenantSelectionScreen> {
  final _searchController = TextEditingController();
  List<Tenant> _tenants = [];
  bool _isLoading = false;
  
  @override
  void initState() {
    super.initState();
    _loadTenants();
  }
  
  Future<void> _loadTenants() async {
    setState(() => _isLoading = true);
    try {
      // Search for tenants
      final response = await ApiService.searchTenants(_searchController.text);
      setState(() {
        _tenants = response;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading organizations: $e')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Your Organization'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search for your organization...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.qr_code_scanner),
                  onPressed: _scanQRCode,
                ),
              ),
              onChanged: (value) => _loadTenants(),
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    itemCount: _tenants.length,
                    itemBuilder: (context, index) {
                      final tenant = _tenants[index];
                      return ListTile(
                        leading: tenant.logo != null
                            ? CircleAvatar(
                                backgroundImage: NetworkImage(tenant.logo!),
                              )
                            : CircleAvatar(
                                backgroundColor: AppColors.primary,
                                child: Text(
                                  tenant.name[0].toUpperCase(),
                                  style: const TextStyle(color: Colors.white),
                                ),
                              ),
                        title: Text(tenant.name),
                        subtitle: Text(tenant.slug),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                        onTap: () => _selectTenant(tenant),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
  
  Future<void> _scanQRCode() async {
    // Implement QR code scanning
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => QRScannerScreen()),
    );
    
    if (result != null) {
      // Parse tenant from QR code
      final tenant = Tenant.fromJson(jsonDecode(result));
      _selectTenant(tenant);
    }
  }
  
  Future<void> _selectTenant(Tenant tenant) async {
    await TenantService().setSelectedTenant(tenant);
    AppColors.updateFromTenant(tenant.theme);
    
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => LoginScreen()),
    );
  }
}
\`\`\`

### 2. Login Screen (Tenant-Aware)

\`\`\`dart
class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;
  Tenant? _tenant;
  
  @override
  void initState() {
    super.initState();
    _loadTenant();
  }
  
  Future<void> _loadTenant() async {
    final tenant = await TenantService().getSelectedTenant();
    setState(() => _tenant = tenant);
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 40),
                // Tenant Logo
                if (_tenant?.logo != null)
                  Center(
                    child: Image.network(
                      _tenant!.logo!,
                      height: 80,
                      width: 80,
                    ),
                  )
                else
                  Center(
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.home_work,
                        size: 40,
                        color: Colors.white,
                      ),
                    ),
                  ),
                const SizedBox(height: 24),
                // Tenant Name
                if (_tenant != null)
                  Text(
                    _tenant!.name,
                    style: AppTextStyles.h2,
                    textAlign: TextAlign.center,
                  ),
                const SizedBox(height: 8),
                Text(
                  'Welcome Back!',
                  style: AppTextStyles.h3,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Sign in to continue',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                // Email Field
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Email or Member ID',
                    prefixIcon: Icon(Icons.email_outlined),
                  ),
                  validator: (value) {
                    if (value?.isEmpty ?? true) {
                      return 'Please enter your email or member ID';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                // Password Field
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    labelText: 'Password',
                    prefixIcon: const Icon(Icons.lock_outlined),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                      ),
                      onPressed: () {
                        setState(() => _obscurePassword = !_obscurePassword);
                      },
                    ),
                  ),
                  validator: (value) {
                    if (value?.isEmpty ?? true) {
                      return 'Please enter your password';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                // Sign In Button
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text('Sign In'),
                ),
                const SizedBox(height: 16),
                // Change Organization
                TextButton(
                  onPressed: () async {
                    await TenantService().clearTenant();
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (_) => TenantSelectionScreen()),
                    );
                  },
                  child: const Text('Change Organization'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
  
  Future<void> _handleLogin() async {
    if (_formKey.currentState?.validate() ?? false) {
      setState(() => _isLoading = true);
      try {
        final authService = AuthService(_tenant!);
        final response = await authService.login(
          _emailController.text,
          _passwordController.text,
        );
        
        // Save auth token
        await SecureStorage().saveToken(response.token);
        await SecureStorage().saveUser(response.user);
        
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => DashboardScreen()),
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Login failed: $e')),
        );
      } finally {
        setState(() => _isLoading = false);
      }
    }
  }
}
\`\`\`

---

## User Dashboard

### Dashboard Screen (All User Features)

\`\`\`dart
class DashboardScreen extends StatefulWidget {
  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  User? _user;
  DashboardStats? _stats;
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _loadDashboard();
  }
  
  Future<void> _loadDashboard() async {
    try {
      final user = await SecureStorage().getUser();
      final stats = await ApiService().getDashboardStats();
      
      setState(() {
        _user = user;
        _stats = stats;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading dashboard: $e')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => NotificationsScreen()),
              );
            },
          ),
        ],
      ),
      drawer: AppDrawer(user: _user),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadDashboard,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // User Header
                    _buildUserHeader(),
                    const SizedBox(height: 24),
                    // Quick Stats
                    _buildQuickStats(),
                    const SizedBox(height: 24),
                    // Quick Actions
                    _buildQuickActions(),
                    const SizedBox(height: 24),
                    // Recent Activity
                    _buildRecentActivity(),
                  ],
                ),
              ),
            ),
    );
  }
  
  Widget _buildUserHeader() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.secondary],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundColor: Colors.white,
            child: Text(
              _user?.firstName[0].toUpperCase() ?? 'U',
              style: AppTextStyles.h2.copyWith(color: AppColors.primary),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Welcome back,',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: Colors.white70,
                  ),
                ),
                Text(
                  _user?.fullName ?? '',
                  style: AppTextStyles.h3.copyWith(color: Colors.white),
                ),
                Text(
                  _user?.memberId ?? '',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildQuickStats() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Quick Stats', style: AppTextStyles.h3),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  'Wallet Balance',
                  '₦${_stats?.walletBalance.toStringAsFixed(2) ?? '0.00'}',
                  Icons.account_balance_wallet,
                  AppColors.primary,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildStatCard(
                  'Total Contributions',
                  '₦${_stats?.totalContributions.toStringAsFixed(2) ?? '0.00'}',
                  Icons.savings,
                  AppColors.success,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  'Active Loans',
                  '${_stats?.activeLoans ?? 0}',
                  Icons.credit_card,
                  AppColors.warning,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildStatCard(
                  'Investments',
                  '₦${_stats?.totalInvestments.toStringAsFixed(2) ?? '0.00'}',
                  Icons.trending_up,
                  AppColors.info,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 8),
          Text(
            title,
            style: AppTextStyles.bodySmall.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: AppTextStyles.h3.copyWith(color: color),
          ),
        ],
      ),
    );
  }
  
  Widget _buildQuickActions() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Quick Actions', style: AppTextStyles.h3),
          const SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 3,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            children: [
              _buildActionCard(
                'Contribute',
                Icons.add_circle_outline,
                AppColors.primary,
                () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => MakeContributionScreen()),
                ),
              ),
              _buildActionCard(
                'Apply Loan',
                Icons.request_quote,
                AppColors.secondary,
                () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => ApplyLoanScreen()),
                ),
              ),
              _buildActionCard(
                'Properties',
                Icons.home,
                AppColors.info,
                () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => PropertiesScreen()),
                ),
              ),
              _buildActionCard(
                'Invest',
                Icons.trending_up,
                AppColors.success,
                () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => InvestmentsScreen()),
                ),
              ),
              _buildActionCard(
                'Wallet',
                Icons.account_balance_wallet,
                AppColors.warning,
                () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => WalletScreen()),
                ),
              ),
              _buildActionCard(
                'Mail',
                Icons.mail_outline,
                AppColors.error,
                () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => MailScreen()),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  Widget _buildActionCard(
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              title,
              style: AppTextStyles.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildRecentActivity() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Recent Activity', style: AppTextStyles.h3),
              TextButton(
                onPressed: () {
                  // View all activity
                },
                child: const Text('View All'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _stats?.recentActivity.length ?? 0,
            itemBuilder: (context, index) {
              final activity = _stats!.recentActivity[index];
              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: _getActivityColor(activity.type),
                  child: Icon(
                    _getActivityIcon(activity.type),
                    color: Colors.white,
                  ),
                ),
                title: Text(activity.title),
                subtitle: Text(activity.description),
                trailing: Text(
                  _formatDate(activity.createdAt),
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
  
  Color _getActivityColor(String type) {
    switch (type) {
      case 'contribution':
        return AppColors.success;
      case 'loan':
        return AppColors.warning;
      case 'investment':
        return AppColors.info;
      case 'property':
        return AppColors.primary;
      default:
        return AppColors.secondary;
    }
  }
  
  IconData _getActivityIcon(String type) {
    switch (type) {
      case 'contribution':
        return Icons.savings;
      case 'loan':
        return Icons.credit_card;
      case 'investment':
        return Icons.trending_up;
      case 'property':
        return Icons.home;
      default:
        return Icons.info;
    }
  }
  
  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inDays == 0) {
      return 'Today';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else {
      return DateFormat('MMM d, y').format(date);
    }
  }
}
\`\`\`

---

## Core Features

### 1. Contributions Module

\`\`\`dart
class MakeContributionScreen extends StatefulWidget {
  @override
  _MakeContributionScreenState createState() => _MakeContributionScreenState();
}

class _MakeContributionScreenState extends State<MakeContributionScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  String _paymentMethod = 'wallet';
  bool _isLoading = false;
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Make Contribution'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _amountController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Amount',
                  prefixText: '₦',
                  hintText: '0.00',
                ),
                validator: (value) {
                  if (value?.isEmpty ?? true) {
                    return 'Please enter amount';
                  }
                  final amount = double.tryParse(value!);
                  if (amount == null || amount <= 0) {
                    return 'Please enter a valid amount';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              Text('Payment Method', style: AppTextStyles.h3),
              const SizedBox(height: 16),
              _buildPaymentMethodOption('wallet', 'Wallet', Icons.account_balance_wallet),
              _buildPaymentMethodOption('paystack', 'Card Payment', Icons.credit_card),
              _buildPaymentMethodOption('remita', 'Bank Transfer', Icons.account_balance),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: _isLoading ? null : _handleContribution,
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Make Contribution'),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildPaymentMethodOption(String value, String label, IconData icon) {
    return RadioListTile<String>(
      value: value,
      groupValue: _paymentMethod,
      onChanged: (val) => setState(() => _paymentMethod = val!),
      title: Text(label),
      secondary: Icon(icon, color: AppColors.primary),
    );
  }
  
  Future<void> _handleContribution() async {
    if (_formKey.currentState?.validate() ?? false) {
      setState(() => _isLoading = true);
      try {
        final amount = double.parse(_amountController.text);
        final response = await ApiService().makeContribution(
          amount: amount,
          paymentMethod: _paymentMethod,
        );
        
        if (_paymentMethod == 'wallet') {
          // Show success
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Contribution successful')),
          );
        } else {
          // Open payment gateway
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => PaymentWebView(
                url: response.authorizationUrl,
                reference: response.reference,
              ),
            ),
          );
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      } finally {
        setState(() => _isLoading = false);
      }
    }
  }
}
\`\`\`

### 2. Loans Module

\`\`\`dart
class ApplyLoanScreen extends StatefulWidget {
  @override
  _ApplyLoanScreenState createState() => _ApplyLoanScreenState();
}

class _ApplyLoanScreenState extends State<ApplyLoanScreen> {
  final _formKey = GlobalKey<FormState>();
  LoanPlan? _selectedPlan;
  final _amountController = TextEditingController();
  int _tenureMonths = 6;
  LoanCalculation? _calculation;
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Apply for Loan'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Loan Plan Selection
              DropdownButtonFormField<LoanPlan>(
                decoration: const InputDecoration(
                  labelText: 'Select Loan Plan',
                ),
                items: [], // Load from API
                onChanged: (plan) {
                  setState(() => _selectedPlan = plan);
                  _calculateLoan();
                },
                validator: (value) {
                  if (value == null) {
                    return 'Please select a loan plan';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              // Amount
              TextFormField(
                controller: _amountController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Loan Amount',
                  prefixText: '₦',
                ),
                onChanged: (_) => _calculateLoan(),
                validator: (value) {
                  if (value?.isEmpty ?? true) {
                    return 'Please enter amount';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              // Tenure
              Text('Tenure: $_tenureMonths months', style: AppTextStyles.bodyLarge),
              Slider(
                value: _tenureMonths.toDouble(),
                min: 1,
                max: _selectedPlan?.maxTenureMonths.toDouble() ?? 12,
                divisions: (_selectedPlan?.maxTenureMonths ?? 12) - 1,
                label: '$_tenureMonths months',
                onChanged: (value) {
                  setState(() => _tenureMonths = value.toInt());
                  _calculateLoan();
                },
              ),
              const SizedBox(height: 24),
              // Loan Calculation
              if (_calculation != null) ...[
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Loan Summary', style: AppTextStyles.h3),
                        const Divider(),
                        _buildSummaryRow('Interest Rate', '${_calculation!.interestRate}%'),
                        _buildSummaryRow('Total Interest', '₦${_calculation!.totalInterest.toStringAsFixed(2)}'),
                        _buildSummaryRow('Total Repayment', '₦${_calculation!.totalRepayment.toStringAsFixed(2)}'),
                        _buildSummaryRow('Monthly Repayment', '₦${_calculation!.monthlyRepayment.toStringAsFixed(2)}'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],
              ElevatedButton(
                onPressed: _handleApply,
                child: const Text('Apply for Loan'),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTextStyles.bodyMedium),
          Text(
            value,
            style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
  
  Future<void> _calculateLoan() async {
    if (_selectedPlan != null && _amountController.text.isNotEmpty) {
      final amount = double.tryParse(_amountController.text);
      if (amount != null) {
        final calculation = await ApiService().calculateLoan(
          loanPlanId: _selectedPlan!.id,
          amount: amount,
          tenureMonths: _tenureMonths,
        );
        setState(() => _calculation = calculation);
      }
    }
  }
  
  Future<void> _handleApply() async {
    if (_formKey.currentState?.validate() ?? false) {
      // Navigate to guarantor selection
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => LoanGuarantorScreen(
            loanPlanId: _selectedPlan!.id,
            amount: double.parse(_amountController.text),
            tenureMonths: _tenureMonths,
          ),
        ),
      );
    }
  }
}
\`\`\`

### 3. Properties Module

\`\`\`dart
class PropertiesScreen extends StatefulWidget {
  @override
  _PropertiesScreenState createState() => _PropertiesScreenState();
}

class _PropertiesScreenState extends State<PropertiesScreen> {
  List<Property> _properties = [];
  bool _isLoading = true;
  String _selectedType = 'all';
  String _searchQuery = '';
  
  @override
  void initState() {
    super.initState();
    _loadProperties();
  }
  
  Future<void> _loadProperties() async {
    setState(() => _isLoading = true);
    try {
      final properties = await ApiService().getProperties(
        type: _selectedType == 'all' ? null : _selectedType,
        search: _searchQuery.isEmpty ? null : _searchQuery,
      );
      setState(() {
        _properties = properties;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading properties: $e')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Properties'),
      ),
      body: Column(
        children: [
          // Search and Filter
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                TextField(
                  decoration: const InputDecoration(
                    hintText: 'Search properties...',
                    prefixIcon: Icon(Icons.search),
                  ),
                  onChanged: (value) {
                    setState(() => _searchQuery = value);
                    _loadProperties();
                  },
                ),
                const SizedBox(height: 16),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('All', 'all'),
                      _buildFilterChip('Residential', 'residential'),
                      _buildFilterChip('Commercial', 'commercial'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Properties List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    itemCount: _properties.length,
                    itemBuilder: (context, index) {
                      final property = _properties[index];
                      return PropertyCard(
                        property: property,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => PropertyDetailScreen(property: property),
                            ),
                          );
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedType == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) {
          setState(() => _selectedType = value);
          _loadProperties();
        },
        backgroundColor: Colors.white,
        selectedColor: AppColors.primary.withOpacity(0.2),
        checkmarkColor: AppColors.primary,
      ),
    );
  }
}

class PropertyCard extends StatelessWidget {
  final Property property;
  final VoidCallback onTap;
  
  const PropertyCard({
    required this.property,
    required this.onTap,
  });
  
  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Property Image
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
              child: Image.network(
                property.images.first,
                height: 200,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(property.title, style: AppTextStyles.h3),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.location_on, size: 16, color: AppColors.textSecondary),
                      const SizedBox(width: 4),
                      Text(
                        property.location,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '₦${property.price.toStringAsFixed(2)}',
                    style: AppTextStyles.h2.copyWith(color: AppColors.primary),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: property.features.take(3).map((feature) {
                      return Chip(
                        label: Text(feature, style: AppTextStyles.bodySmall),
                        backgroundColor: AppColors.background,
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
\`\`\`

### 4. Investments Module

\`\`\`dart
class InvestmentsScreen extends StatefulWidget {
  @override
  _InvestmentsScreenState createState() => _InvestmentsScreenState();
}

class _InvestmentsScreenState extends State<InvestmentsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<InvestmentPlan> _plans = [];
  List<Investment> _myInvestments = [];
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }
  
  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final plans = await ApiService().getInvestmentPlans();
      final investments = await ApiService().getMyInvestments();
      setState(() {
        _plans = plans;
        _myInvestments = investments;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading data: $e')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Investments'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Investment Plans'),
            Tab(text: 'My Investments'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildPlansTab(),
                _buildMyInvestmentsTab(),
              ],
            ),
    );
  }
  
  Widget _buildPlansTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _plans.length,
      itemBuilder: (context, index) {
        final plan = _plans[index];
        return InvestmentPlanCard(
          plan: plan,
          onInvest: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => MakeInvestmentScreen(plan: plan),
              ),
            );
          },
        );
      },
    );
  }
  
  Widget _buildMyInvestmentsTab() {
    if (_myInvestments.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.trending_up, size: 64, color: AppColors.textSecondary),
            const SizedBox(height: 16),
            Text(
              'No investments yet',
              style: AppTextStyles.h3.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 8),
            Text(
              'Start investing to grow your wealth',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      );
    }
    
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _myInvestments.length,
      itemBuilder: (context, index) {
        final investment = _myInvestments[index];
        return InvestmentCard(
          investment: investment,
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => InvestmentDetailScreen(investment: investment),
              ),
            );
          },
        );
      },
    );
  }
}
\`\`\`

### 5. Wallet Module

\`\`\`dart
class WalletScreen extends StatefulWidget {
  @override
  _WalletScreenState createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  WalletBalance? _balance;
  List<WalletTransaction> _transactions = [];
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _loadWallet();
  }
  
  Future<void> _loadWallet() async {
    setState(() => _isLoading = true);
    try {
      final balance = await ApiService().getWalletBalance();
      final transactions = await ApiService().getWalletTransactions();
      setState(() {
        _balance = balance;
        _transactions = transactions;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading wallet: $e')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Wallet'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadWallet,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  children: [
                    // Balance Card
                    Container(
                      margin: const EdgeInsets.all(16),
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [AppColors.primary, AppColors.secondary],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Available Balance',
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: Colors.white70,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '₦${_balance?.balance.toStringAsFixed(2) ?? '0.00'}',
                            style: AppTextStyles.h1.copyWith(color: Colors.white),
                          ),
                          const SizedBox(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Total Credits',
                                    style: AppTextStyles.bodySmall.copyWith(
                                      color: Colors.white70,
                                    ),
                                  ),
                                  Text(
                                    '₦${_balance?.totalCredits.toStringAsFixed(2) ?? '0.00'}',
                                    style: AppTextStyles.bodyLarge.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    'Total Debits',
                                    style: AppTextStyles.bodySmall.copyWith(
                                      color: Colors.white70,
                                    ),
                                  ),
                                  Text(
                                    '₦${_balance?.totalDebits.toStringAsFixed(2) ?? '0.00'}',
                                    style: AppTextStyles.bodyLarge.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    // Action Buttons
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => FundWalletScreen(),
                                  ),
                                );
                              },
                              icon: const Icon(Icons.add),
                              label: const Text('Fund Wallet'),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => WithdrawScreen(),
                                  ),
                                );
                              },
                              icon: const Icon(Icons.remove),
                              label: const Text('Withdraw'),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Transactions
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Recent Transactions', style: AppTextStyles.h3),
                          TextButton(
                            onPressed: () {
                              // View all transactions
                            },
                            child: const Text('View All'),
                          ),
                        ],
                      ),
                    ),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _transactions.length,
                      itemBuilder: (context, index) {
                        final transaction = _transactions[index];
                        return TransactionTile(transaction: transaction);
                      },
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}

class TransactionTile extends StatelessWidget {
  final WalletTransaction transaction;
  
  const TransactionTile({required this.transaction});
  
  @override
  Widget build(BuildContext context) {
    final isCredit = transaction.type == 'credit';
    
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: isCredit
            ? AppColors.success.withOpacity(0.1)
            : AppColors.error.withOpacity(0.1),
        child: Icon(
          isCredit ? Icons.arrow_downward : Icons.arrow_upward,
          color: isCredit ? AppColors.success : AppColors.error,
        ),
      ),
      title: Text(transaction.description),
      subtitle: Text(
        DateFormat('MMM d, y - h:mm a').format(transaction.createdAt),
        style: AppTextStyles.bodySmall.copyWith(
          color: AppColors.textSecondary,
        ),
      ),
      trailing: Text(
        '${isCredit ? '+' : '-'}₦${transaction.amount.toStringAsFixed(2)}',
        style: AppTextStyles.bodyLarge.copyWith(
          color: isCredit ? AppColors.success : AppColors.error,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
\`\`\`

### 6. Mail Service Module

\`\`\`dart
class MailScreen extends StatefulWidget {
  @override
  _MailScreenState createState() => _MailScreenState();
}

class _MailScreenState extends State<MailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Message> _inbox = [];
  List<Message> _sent = [];
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadMail();
  }
  
  Future<void> _loadMail() async {
    setState(() => _isLoading = true);
    try {
      final inbox = await ApiService().getInbox();
      final sent = await ApiService().getSentMail();
      setState(() {
        _inbox = inbox;
        _sent = sent;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading mail: $e')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mail'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Inbox'),
            Tab(text: 'Sent'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildMailList(_inbox),
                _buildMailList(_sent),
              ],
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => ComposeMailScreen()),
          );
        },
        child: const Icon(Icons.edit),
      ),
    );
  }
  
  Widget _buildMailList(List<Message> messages) {
    if (messages.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.mail_outline, size: 64, color: AppColors.textSecondary),
            const SizedBox(height: 16),
            Text(
              'No messages',
              style: AppTextStyles.h3.copyWith(color: AppColors.textSecondary),
            ),
          ],
        ),
      );
    }
    
    return ListView.builder(
      itemCount: messages.length,
      itemBuilder: (context, index) {
        final message = messages[index];
        return MessageTile(
          message: message,
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => MessageDetailScreen(message: message),
              ),
            );
          },
        );
      },
    );
  }
}
\`\`\`

### 7. Statutory Charges Module

\`\`\`dart
class StatutoryChargesScreen extends StatefulWidget {
  @override
  _StatutoryChargesScreenState createState() => _StatutoryChargesScreenState();
}

class _StatutoryChargesScreenState extends State<StatutoryChargesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<StatutoryChargeType> _types = [];
  List<StatutoryChargePayment> _payments = [];
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }
  
  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final types = await ApiService().getStatutoryChargeTypes();
      final payments = await ApiService().getStatutoryChargePayments();
      setState(() {
        _types = types;
        _payments = payments;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading data: $e')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Statutory Charges'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Available Charges'),
            Tab(text: 'Payment History'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildChargesTab(),
                _buildHistoryTab(),
              ],
            ),
    );
  }
  
  Widget _buildChargesTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _types.length,
      itemBuilder: (context, index) {
        final type = _types[index];
        return StatutoryChargeCard(
          type: type,
          onPay: () {
            _showPaymentDialog(type);
          },
        );
      },
    );
  }
  
  Widget _buildHistoryTab() {
    if (_payments.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.receipt_long, size: 64, color: AppColors.textSecondary),
            const SizedBox(height: 16),
            Text(
              'No payment history',
              style: AppTextStyles.h3.copyWith(color: AppColors.textSecondary),
            ),
          ],
        ),
      );
    }
    
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _payments.length,
      itemBuilder: (context, index) {
        final payment = _payments[index];
        return PaymentHistoryCard(payment: payment);
      },
    );
  }
  
  void _showPaymentDialog(StatutoryChargeType type) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => PayStatutoryChargeSheet(type: type),
    );
  }
}
\`\`\`

### 8. Property Management Module (User Side)

\`\`\`dart
class PropertyManagementScreen extends StatefulWidget {
  @override
  _PropertyManagementScreenState createState() =>
      _PropertyManagementScreenState();
}

class _PropertyManagementScreenState extends State<PropertyManagementScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Allotment> _allotments = [];
  List<MaintenanceRequest> _requests = [];
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }
  
  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final allotments = await ApiService().getMyAllotments();
      final requests = await ApiService().getMyMaintenanceRequests();
      setState(() {
        _allotments = allotments;
        _requests = requests;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading data: $e')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Property Management'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'My Allotments'),
            Tab(text: 'Maintenance'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildAllotmentsTab(),
                _buildMaintenanceTab(),
              ],
            ),
      floatingActionButton: _tabController.index == 1
          ? FloatingActionButton.extended(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => CreateMaintenanceRequestScreen(),
                  ),
                );
              },
              icon: const Icon(Icons.add),
              label: const Text('New Request'),
            )
          : null,
    );
  }
  
  Widget _buildAllotmentsTab() {
    if (_allotments.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.home_outlined, size: 64, color: AppColors.textSecondary),
            const SizedBox(height: 16),
            Text(
              'No allotments yet',
              style: AppTextStyles.h3.copyWith(color: AppColors.textSecondary),
            ),
          ],
        ),
      );
    }
    
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _allotments.length,
      itemBuilder: (context, index) {
        final allotment = _allotments[index];
        return AllotmentCard(
          allotment: allotment,
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => AllotmentDetailScreen(allotment: allotment),
              ),
            );
          },
        );
      },
    );
  }
  
  Widget _buildMaintenanceTab() {
    if (_requests.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.build_outlined, size: 64, color: AppColors.textSecondary),
            const SizedBox(height: 16),
            Text(
              'No maintenance requests',
              style: AppTextStyles.h3.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 8),
            Text(
              'Tap the button below to create one',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      );
    }
    
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _requests.length,
      itemBuilder: (context, index) {
        final request = _requests[index];
        return MaintenanceRequestCard(
          request: request,
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => MaintenanceRequestDetailScreen(request: request),
              ),
            );
          },
        );
      },
    );
  }
}
\`\`\`

---

## API Integration

### API Service with Tenant Context

\`\`\`dart
class ApiService {
  static const String platformBaseUrl = 'https://api.yourplatform.com/api/v1';
  late String _baseUrl;
  late Dio _dio;
  
  ApiService() {
    _initializeDio();
  }
  
  Future<void> _initializeDio() async {
    final tenant = await TenantService().getSelectedTenant();
    _baseUrl = tenant?.baseUrl ?? platformBaseUrl;
    
    _dio = Dio(BaseOptions(
      baseUrl: _baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
    
    // Add interceptors
    _dio.interceptors.add(AuthInterceptor());
    _dio.interceptors.add(TenantInterceptor());
    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
    ));
  }
  
  // Authentication
  Future<LoginResponse> login(String email, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    return LoginResponse.fromJson(response.data['data']);
  }
  
  // Dashboard
  Future<DashboardStats> getDashboardStats() async {
    final response = await _dio.get('/user/dashboard/stats');
    return DashboardStats.fromJson(response.data['data']);
  }
  
  // Contributions
  Future<ContributionResponse> makeContribution({
    required double amount,
    required String paymentMethod,
  }) async {
    final response = await _dio.post('/contributions', data: {
      'amount': amount,
      'payment_method': paymentMethod,
    });
    return ContributionResponse.fromJson(response.data['data']);
  }
  
  // Loans
  Future<LoanCalculation> calculateLoan({
    required int loanPlanId,
    required double amount,
    required int tenureMonths,
  }) async {
    final response = await _dio.post('/loans/calculate', data: {
      'loan_plan_id': loanPlanId,
      'amount': amount,
      'tenure_months': tenureMonths,
    });
    return LoanCalculation.fromJson(response.data['data']);
  }
  
  Future<Loan> applyForLoan({
    required int loanPlanId,
    required double amount,
    required int tenureMonths,
    required String purpose,
    required Map<String, dynamic> guarantor1,
    required Map<String, dynamic> guarantor2,
  }) async {
    final response = await _dio.post('/loans/apply', data: {
      'loan_plan_id': loanPlanId,
      'amount': amount,
      'tenure_months': tenureMonths,
      'purpose': purpose,
      'guarantor_1': guarantor1,
      'guarantor_2': guarantor2,
    });
    return Loan.fromJson(response.data['data']);
  }
  
  // Properties
  Future<List<Property>> getProperties({
    String? type,
    String? search,
  }) async {
    final response = await _dio.get('/properties', queryParameters: {
      if (type != null) 'type': type,
      if (search != null) 'search': search,
    });
    return (response.data['data'] as List)
        .map((json) => Property.fromJson(json))
        .toList();
  }
  
  // Investments
  Future<List<InvestmentPlan>> getInvestmentPlans() async {
    final response = await _dio.get('/investments/plans');
    return (response.data['data'] as List)
        .map((json) => InvestmentPlan.fromJson(json))
        .toList();
  }
  
  Future<Investment> makeInvestment({
    required int investmentPlanId,
    required double amount,
    required String paymentMethod,
  }) async {
    final response = await _dio.post('/investments/invest', data: {
      'investment_plan_id': investmentPlanId,
      'amount': amount,
      'payment_method': paymentMethod,
    });
    return Investment.fromJson(response.data['data']);
  }
  
  // Wallet
  Future<WalletBalance> getWalletBalance() async {
    final response = await _dio.get('/wallet/balance');
    return WalletBalance.fromJson(response.data['data']);
  }
  
  Future<List<WalletTransaction>> getWalletTransactions() async {
    final response = await _dio.get('/wallet/transactions');
    return (response.data['data'] as List)
        .map((json) => WalletTransaction.fromJson(json))
        .toList();
  }
  
  Future<FundWalletResponse> fundWallet({
    required double amount,
    required String paymentMethod,
  }) async {
    final response = await _dio.post('/wallet/fund', data: {
      'amount': amount,
      'payment_method': paymentMethod,
    });
    return FundWalletResponse.fromJson(response.data['data']);
  }
  
  // Mail
  Future<List<Message>> getInbox() async {
    final response = await _dio.get('/mail/inbox');
    return (response.data['data'] as List)
        .map((json) => Message.fromJson(json))
        .toList();
  }
  
  Future<List<Message>> getSentMail() async {
    final response = await _dio.get('/mail/sent');
    return (response.data['data'] as List)
        .map((json) => Message.fromJson(json))
        .toList();
  }
  
  Future<void> sendMail({
    required List<int> recipients,
    required String subject,
    required String message,
  }) async {
    await _dio.post('/mail/send', data: {
      'recipients': recipients,
      'subject': subject,
      'message': message,
    });
  }
  
  // Statutory Charges
  Future<List<StatutoryChargeType>> getStatutoryChargeTypes() async {
    final response = await _dio.get('/statutory-charges/types');
    return (response.data['data'] as List)
        .map((json) => StatutoryChargeType.fromJson(json))
        .toList();
  }
  
  Future<void> payStatutoryCharge({
    required int chargeTypeId,
    required String paymentMethod,
  }) async {
    await _dio.post('/statutory-charges/pay', data: {
      'charge_type_id': chargeTypeId,
      'payment_method': paymentMethod,
    });
  }
  
  // Property Management
  Future<List<Allotment>> getMyAllotments() async {
    final response = await _dio.get('/property-management/my-allotments');
    return (response.data['data'] as List)
        .map((json) => Allotment.fromJson(json))
        .toList();
  }
  
  Future<List<MaintenanceRequest>> getMyMaintenanceRequests() async {
    final response = await _dio.get('/property-management/maintenance-requests');
    return (response.data['data'] as List)
        .map((json) => MaintenanceRequest.fromJson(json))
        .toList();
  }
  
  Future<MaintenanceRequest> createMaintenanceRequest({
    required int allotmentId,
    required String category,
    required String description,
    required String priority,
    List<String>? images,
  }) async {
    final response = await _dio.post(
      '/property-management/maintenance-requests',
      data: {
        'allotment_id': allotmentId,
        'category': category,
        'description': description,
        'priority': priority,
        if (images != null) 'images': images,
      },
    );
    return MaintenanceRequest.fromJson(response.data['data']);
  }
}
\`\`\`

### Interceptors

\`\`\`dart
class AuthInterceptor extends Interceptor {
  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await SecureStorage().getToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }
  
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      // Handle unauthorized - redirect to login
      // You can use a global navigator key or event bus
    }
    handler.next(err);
  }
}

class TenantInterceptor extends Interceptor {
  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final tenant = await TenantService().getSelectedTenant();
    if (tenant != null) {
      options.headers['X-Tenant-ID'] = tenant.id.toString();
    }
    handler.next(options);
  }
}
\`\`\`

---

## State Management

### BLoC Pattern Implementation

\`\`\`dart
// Contribution BLoC
class ContributionBloc extends Bloc<ContributionEvent, ContributionState> {
  final ApiService _apiService;
  
  ContributionBloc(this._apiService) : super(ContributionInitial()) {
    on<LoadContributions>(_onLoadContributions);
    on<MakeContribution>(_onMakeContribution);
  }
  
  Future<void> _onLoadContributions(
    LoadContributions event,
    Emitter<ContributionState> emit,
  ) async {
    emit(ContributionLoading());
    try {
      final summary = await _apiService.getContributionSummary();
      final history = await _apiService.getContributionHistory();
      emit(ContributionLoaded(summary: summary, history: history));
    } catch (e) {
      emit(ContributionError(e.toString()));
    }
  }
  
  Future<void> _onMakeContribution(
    MakeContribution event,
    Emitter<ContributionState> emit,
  ) async {
    emit(ContributionProcessing());
    try {
      final response = await _apiService.makeContribution(
        amount: event.amount,
        paymentMethod: event.paymentMethod,
      );
      emit(ContributionSuccess(response));
    } catch (e) {
      emit(ContributionError(e.toString()));
    }
  }
}

// Events
abstract class ContributionEvent {}

class LoadContributions extends ContributionEvent {}

class MakeContribution extends ContributionEvent {
  final double amount;
  final String paymentMethod;
  
  MakeContribution({required this.amount, required this.paymentMethod});
}

// States
abstract class ContributionState {}

class ContributionInitial extends ContributionState {}

class ContributionLoading extends ContributionState {}

class ContributionLoaded extends ContributionState {
  final ContributionSummary summary;
  final List<Contribution> history;
  
  ContributionLoaded({required this.summary, required this.history});
}

class ContributionProcessing extends ContributionState {}

class ContributionSuccess extends ContributionState {
  final ContributionResponse response;
  
  ContributionSuccess(this.response);
}

class ContributionError extends ContributionState {
  final String message;
  
  ContributionError(this.message);
}
\`\`\`

---

## Implementation Guide

### Step 1: Setup Flutter Project

\`\`\`bash
flutter create frsc_housing_app
cd frsc_housing_app
\`\`\`

### Step 2: Add Dependencies

\`\`\`yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  flutter_bloc: ^8.1.3
  equatable: ^2.0.5
  
  # Networking
  dio: ^5.3.3
  retrofit: ^4.0.3
  
  # Storage
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0
  
  # UI
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  flutter_svg: ^2.0.9
  
  # Forms
  flutter_form_builder: ^9.1.1
  form_builder_validators: ^9.1.0
  
  # Date & Time
  intl: ^0.18.1
  
  # QR Code
  qr_code_scanner: ^1.0.1
  qr_flutter: ^4.1.0
  
  # Payment
  flutter_paystack: ^1.0.7
  
  # PDF
  pdf: ^3.10.7
  printing: ^5.11.1
  
  # Charts
  fl_chart: ^0.65.0
  
  # Notifications
  flutter_local_notifications: ^16.2.0
  
  # Permissions
  permission_handler: ^11.1.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  build_runner: ^2.4.6
  retrofit_generator: ^8.0.0
\`\`\`

### Step 3: Project Structure

\`\`\`
lib/
├── main.dart
├── app.dart
├── core/
│   ├── constants/
│   │   ├── app_colors.dart
│   │   ├── app_text_styles.dart
│   │   └── app_constants.dart
│   ├── theme/
│   │   └── app_theme.dart
│   ├── utils/
│   │   ├── date_formatter.dart
│   │   └── currency_formatter.dart
│   └── widgets/
│       ├── custom_button.dart
│       ├── custom_text_field.dart
│       └── loading_indicator.dart
├── data/
│   ├── models/
│   │   ├── tenant.dart
│   │   ├── user.dart
│   │   ├── contribution.dart
│   │   ├── loan.dart
│   │   ├── property.dart
│   │   ├── investment.dart
│   │   └── wallet.dart
│   ├── repositories/
│   │   ├── auth_repository.dart
│   │   ├── contribution_repository.dart
│   │   ├── loan_repository.dart
│   │   └── property_repository.dart
│   └── services/
│       ├── api_service.dart
│       ├── tenant_service.dart
│       ├── secure_storage.dart
│       └── payment_service.dart
├── presentation/
│   ├── auth/
│   │   ├── screens/
│   │   │   ├── tenant_selection_screen.dart
│   │   │   ├── login_screen.dart
│   │   │   └── register_screen.dart
│   │   └── bloc/
│   │       ├── auth_bloc.dart
│   │       ├── auth_event.dart
│   │       └── auth_state.dart
│   ├── dashboard/
│   │   ├── screens/
│   │   │   └── dashboard_screen.dart
│   │   └── bloc/
│   │       ├── dashboard_bloc.dart
│   │       ├── dashboard_event.dart
│   │       └── dashboard_state.dart
│   ├── contributions/
│   │   ├── screens/
│   │   │   ├── contributions_screen.dart
│   │   │   └── make_contribution_screen.dart
│   │   └── bloc/
│   ├── loans/
│   │   ├── screens/
│   │   │   ├── loans_screen.dart
│   │   │   ├── apply_loan_screen.dart
│   │   │   └── loan_detail_screen.dart
│   │   └── bloc/
│   ├── properties/
│   │   ├── screens/
│   │   │   ├── properties_screen.dart
│   │   │   └── property_detail_screen.dart
│   │   └── bloc/
│   ├── investments/
│   │   ├── screens/
│   │   │   ├── investments_screen.dart
│   │   │   └── make_investment_screen.dart
│   │   └── bloc/
│   ├── wallet/
│   │   ├── screens/
│   │   │   ├── wallet_screen.dart
│   │   │   ├── fund_wallet_screen.dart
│   │   │   └── withdraw_screen.dart
│   │   └── bloc/
│   ├── mail/
│   │   ├── screens/
│   │   │   ├── mail_screen.dart
│   │   │   ├── compose_mail_screen.dart
│   │   │   └── message_detail_screen.dart
│   │   └── bloc/
│   ├── statutory_charges/
│   │   ├── screens/
│   │   │   └── statutory_charges_screen.dart
│   │   └── bloc/
│   └── property_management/
│       ├── screens/
│       │   ├── property_management_screen.dart
│       │   ├── allotment_detail_screen.dart
│       │   └── maintenance_request_screen.dart
│       └── bloc/
└── routes/
    └── app_router.dart
\`\`\`

### Step 4: Initialize App with Tenant Support

\`\`\`dart
// main.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize services
  await TenantService().init();
  await SecureStorage().init();
  
  runApp(const MyApp());
}

// app.dart
class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => AuthBloc(ApiService())),
        BlocProvider(create: (_) => DashboardBloc(ApiService())),
        BlocProvider(create: (_) => ContributionBloc(ApiService())),
        BlocProvider(create: (_) => LoanBloc(ApiService())),
        BlocProvider(create: (_) => PropertyBloc(ApiService())),
        BlocProvider(create: (_) => InvestmentBloc(ApiService())),
        BlocProvider(create: (_) => WalletBloc(ApiService())),
      ],
      child: FutureBuilder<Tenant?>(
        future: TenantService().getSelectedTenant(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return MaterialApp(
              home: Scaffold(
                body: Center(child: CircularProgressIndicator()),
              ),
            );
          }
          
          final tenant = snapshot.data;
          if (tenant != null) {
            AppColors.updateFromTenant(tenant.theme);
          }
          
          return MaterialApp(
            title: 'FRSC Housing Management',
            theme: AppTheme.getTheme(tenant?.theme),
            debugShowCheckedModeBanner: false,
            home: _getInitialScreen(tenant),
            onGenerateRoute: AppRouter.generateRoute,
          );
        },
      ),
    );
  }
  
  Widget _getInitialScreen(Tenant? tenant) {
    if (tenant == null) {
      return TenantSelectionScreen();
    }
    
    return FutureBuilder<String?>(
      future: SecureStorage().getToken(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        
        if (snapshot.data != null) {
          return DashboardScreen();
        }
        
        return LoginScreen();
      },
    );
  }
}
\`\`\`

### Step 5: Secure Storage Implementation

\`\`\`dart
class SecureStorage {
  static final SecureStorage _instance = SecureStorage._internal();
  factory SecureStorage() => _instance;
  SecureStorage._internal();
  
  final _storage = const FlutterSecureStorage();
  
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';
  
  Future<void> init() async {
    // Initialize secure storage
  }
  
  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }
  
  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }
  
  Future<void> saveUser(User user) async {
    await _storage.write(key: _userKey, value: jsonEncode(user.toJson()));
  }
  
  Future<User?> getUser() async {
    final userJson = await _storage.read(key: _userKey);
    if (userJson != null) {
      return User.fromJson(jsonDecode(userJson));
    }
    return null;
  }
  
  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
\`\`\`

### Step 6: Payment Integration

\`\`\`dart
class PaymentService {
  Future<void> processPaystackPayment({
    required String publicKey,
    required String email,
    required double amount,
    required String reference,
    required Function(String) onSuccess,
    required Function(String) onError,
  }) async {
    final plugin = PaystackPlugin();
    
    await plugin.initialize(publicKey: publicKey);
    
    final charge = Charge()
      ..amount = (amount * 100).toInt() // Convert to kobo
      ..email = email
      ..reference = reference
      ..currency = 'NGN';
    
    try {
      final response = await plugin.checkout(
        Get.context!,
        method: CheckoutMethod.card,
        charge: charge,
      );
      
      if (response.status) {
        onSuccess(response.reference ?? reference);
      } else {
        onError(response.message);
      }
    } catch (e) {
      onError(e.toString());
    }
  }
}
\`\`\`

### Step 7: Testing

\`\`\`dart
// test/auth_bloc_test.dart
void main() {
  group('AuthBloc', () {
    late AuthBloc authBloc;
    late MockApiService mockApiService;
    
    setUp(() {
      mockApiService = MockApiService();
      authBloc = AuthBloc(mockApiService);
    });
    
    tearDown(() {
      authBloc.close();
    });
    
    test('initial state is AuthInitial', () {
      expect(authBloc.state, AuthInitial());
    });
    
    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthSuccess] when login is successful',
      build: () {
        when(() => mockApiService.login(any(), any()))
            .thenAnswer((_) async => LoginResponse(
                  user: User(id: 1, email: 'test@example.com'),
                  token: 'test_token',
                ));
        return authBloc;
      },
      act: (bloc) => bloc.add(LoginRequested(
        email: 'test@example.com',
        password: 'password',
      )),
      expect: () => [
        AuthLoading(),
        AuthSuccess(user: User(id: 1, email: 'test@example.com')),
      ],
    );
  });
}
\`\`\`

---

## Deployment

### Android Configuration

\`\`\`gradle
// android/app/build.gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.frsc.housing"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
        }
    }
}
\`\`\`

### iOS Configuration

\`\`\`xml
 ios/Runner/Info.plist 
<key>NSCameraUsageDescription</key>
<string>We need camera access to scan QR codes</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to upload documents</string>
\`\`\`

### Build Commands

\`\`\`bash
# Android
flutter build apk --release
flutter build appbundle --release

# iOS
flutter build ios --release
\`\`\`

---

## Best Practices

1. **Always validate tenant context** before making API calls
2. **Cache tenant information** to reduce API calls
3. **Implement proper error handling** with user-friendly messages
4. **Use optimistic updates** for better UX
5. **Implement offline support** where possible
6. **Follow Material Design** guidelines
7. **Test on multiple devices** and screen sizes
8. **Implement proper state management** with BLoC
9. **Use secure storage** for sensitive data
10. **Implement proper logging** for debugging

---

This comprehensive Flutter mobile app documentation provides everything needed to build a fully functional multi-tenant mobile application that mirrors all user-side features of the FRSC Housing Management System. The app supports dynamic theming based on tenant branding, complete API integration, and all core features including contributions, loans, properties, investments, wallet, mail service, statutory charges, and property management.
