# FRSC Housing Management - Complete Flutter Mobile App Design Guide

## Table of Contents
1. [Design System](#design-system)
2. [Complete Screen Inventory](#complete-screen-inventory)
3. [Authentication Flow](#authentication-flow)
4. [Dashboard & Home](#dashboard--home)
5. [Contributions Module](#contributions-module)
6. [Loans Module](#loans-module)
7. [Investments Module](#investments-module)
8. [Properties Module](#properties-module)
9. [Wallet Module](#wallet-module)
10. [Mail Service Module](#mail-service-module)
11. [Reports Module](#reports-module)
12. [Statutory Charges Module](#statutory-charges-module)
13. [Property Management Module](#property-management-module)
14. [Profile & Settings](#profile--settings)
15. [Advanced Features](#advanced-features)

---

## Design System

### Brand Colors
\`\`\`dart
class AppColors {
  // Primary Colors
  static const Color primaryGold = Color(0xFFD4AF37);
  static const Color primaryGreen = Color(0xFF1B5E20);
  static const Color darkGreen = Color(0xFF0D3D10);
  
  // Accent Colors
  static const Color accentOrange = Color(0xFFFF6B35);
  static const Color accentBlue = Color(0xFF2196F3);
  
  // Neutral Colors
  static const Color background = Color(0xFFF5F5F5);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  static const Color divider = Color(0xFFE0E0E0);
  
  // Status Colors
  static const Color success = Color(0xFF4CAF50);
  static const Color warning = Color(0xFFFFC107);
  static const Color error = Color(0xFFF44336);
  static const Color info = Color(0xFF2196F3);
}
\`\`\`

### Typography
\`\`\`dart
class AppTextStyles {
  static const String fontFamily = 'Inter';
  
  // Headings
  static const TextStyle h1 = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  );
  
  static const TextStyle h2 = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  );
  
  static const TextStyle h3 = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
  );
  
  // Body Text
  static const TextStyle bodyLarge = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.normal,
    height: 1.5,
  );
  
  static const TextStyle bodyMedium = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    height: 1.5,
  );
  
  static const TextStyle bodySmall = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    height: 1.4,
  );
  
  // Special
  static const TextStyle button = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
  );
  
  static const TextStyle caption = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    color: AppColors.textSecondary,
  );
}
\`\`\`

### Spacing System
\`\`\`dart
class AppSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;
}
\`\`\`

### Border Radius
\`\`\`dart
class AppRadius {
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 24.0;
  static const double full = 999.0;
}
\`\`\`

---

## Complete Screen Inventory

### Authentication (5 screens)
1. Splash Screen
2. Onboarding (3 slides)
3. Login Screen
4. Register Screen (Member/Non-Member)
5. Forgot Password Screen

### Main Dashboard (1 screen)
6. Home Dashboard

### Contributions (6 screens)
7. Contributions Overview
8. Make Contribution
9. Contribution History
10. Contribution Details
11. Contribution Receipt
12. Contribution Analytics

### Loans (8 screens)
13. Loans Overview
14. Loan Plans (Browse)
15. Loan Plan Details
16. Apply for Loan
17. My Loans
18. Loan Details
19. Make Repayment
20. Loan Calculator

### Investments (9 screens)
21. Investment Plans (Browse)
22. Investment Plan Details (Cash)
23. Investment Plan Details (Property)
24. Property Image Gallery
25. Make Investment
26. My Investments
27. Investment Details
28. Investment Performance
29. Withdraw Investment

### Properties (7 screens)
30. Properties Browse
31. Property Details
32. Property Image Gallery
33. Property Payment
34. My Properties
35. Property Payment History
36. Expression of Interest Form

### Wallet (5 screens)
37. Wallet Overview
38. Add Funds
39. Transaction History
40. Transaction Details
41. Transfer Funds

### Mail Service (6 screens)
42. Mail Inbox
43. Mail Sent
44. Mail Drafts
45. Mail Outbox
46. Compose Mail
47. Mail Details

### Reports (6 screens)
48. Reports Overview
49. Contribution Report
50. Investment Report
51. Loan Report
52. Property Report
53. Financial Summary

### Statutory Charges (3 screens)
54. Statutory Charges Overview
55. Pay Statutory Charge
56. Statutory Charges History

### Property Management (4 screens)
57. Estates Browse
58. Estate Details
59. My Allotments
60. Maintenance Requests

### Profile & Settings (5 screens)
61. Profile View
62. Edit Profile
63. Settings
64. Security Settings
65. Notifications Settings

### Additional Screens (5 screens)
66. Documents
67. Notifications
68. Search (Global)
69. Help & Support
70. About App

**Total: 70 Screens**

---

## 1. Authentication Flow

### 1.1 Splash Screen

**Design Specifications:**
\`\`\`
┌─────────────────────────────┐
│                             │
│                             │
│         [FRSC LOGO]         │
│                             │
│    Housing Management       │
│         System              │
│                             │
│      [Loading Spinner]      │
│                             │
│                             │
└─────────────────────────────┘
\`\`\`

**Implementation:**
\`\`\`dart
class SplashScreen extends StatefulWidget {
  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> 
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(milliseconds: 2000),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
    );
    
    _scaleAnimation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
    );
    
    _controller.forward();
    _navigateToNext();
  }

  Future<void> _navigateToNext() async {
    await Future.delayed(Duration(seconds: 3));
    // Check authentication status
    final isAuthenticated = await AuthService.isAuthenticated();
    if (isAuthenticated) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => DashboardScreen()),
      );
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => OnboardingScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryGreen,
      body: Center(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: ScaleTransition(
            scale: _scaleAnimation,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo with gradient overlay
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [AppColors.primaryGold, Colors.white],
                    ),
                  ),
                  child: Icon(
                    Icons.home_work,
                    size: 60,
                    color: AppColors.primaryGreen,
                  ),
                ),
                SizedBox(height: AppSpacing.lg),
                Text(
                  'FRSC',
                  style: AppTextStyles.h1.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Housing Management System',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: Colors.white70,
                  ),
                ),
                SizedBox(height: AppSpacing.xl),
                CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(
                    AppColors.primaryGold,
                  ),
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

### 1.2 Onboarding Screens

**3 Slides with Key Features:**

**Slide 1: Welcome**
\`\`\`
┌─────────────────────────────┐
│                             │
│     [Illustration:          │
│      House with Key]        │
│                             │
│   Welcome to FRSC HMS       │
│                             │
│  Your complete housing      │
│  management solution        │
│                             │
│         ● ○ ○               │
│                             │
│         [Next →]            │
└─────────────────────────────┘
\`\`\`

**Slide 2: Features**
\`\`\`
┌─────────────────────────────┐
│                             │
│     [Illustration:          │
│      Money & Investment]    │
│                             │
│   Manage Everything         │
│                             │
│  Contributions, Loans,      │
│  Investments & Properties   │
│                             │
│         ○ ● ○               │
│                             │
│    [← Back]  [Next →]       │
└─────────────────────────────┘
\`\`\`

**Slide 3: Get Started**
\`\`\`
┌─────────────────────────────┐
│                             │
│     [Illustration:          │
│      Mobile Dashboard]      │
│                             │
│   Start Your Journey        │
│                             │
│  Secure, Fast, and          │
│  Easy to use                │
│                             │
│         ○ ○ ●               │
│                             │
│    [← Back] [Get Started]   │
└─────────────────────────────┘
\`\`\`

**Implementation:**
\`\`\`dart
class OnboardingScreen extends StatefulWidget {
  @override
  _OnboardingScreenState createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingPage> _pages = [
    OnboardingPage(
      title: 'Welcome to FRSC HMS',
      description: 'Your complete housing management solution',
      image: 'assets/images/onboarding_1.svg',
      color: AppColors.primaryGreen,
    ),
    OnboardingPage(
      title: 'Manage Everything',
      description: 'Contributions, Loans, Investments & Properties',
      image: 'assets/images/onboarding_2.svg',
      color: AppColors.primaryGold,
    ),
    OnboardingPage(
      title: 'Start Your Journey',
      description: 'Secure, Fast, and Easy to use',
      image: 'assets/images/onboarding_3.svg',
      color: AppColors.accentBlue,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (index) {
                  setState(() => _currentPage = index);
                },
                itemCount: _pages.length,
                itemBuilder: (context, index) {
                  return _buildPage(_pages[index]);
                },
              ),
            ),
            _buildIndicator(),
            _buildButtons(),
          ],
        ),
      ),
    );
  }

  Widget _buildPage(OnboardingPage page) {
    return Padding(
      padding: EdgeInsets.all(AppSpacing.xl),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SvgPicture.asset(
            page.image,
            height: 300,
          ),
          SizedBox(height: AppSpacing.xl),
          Text(
            page.title,
            style: AppTextStyles.h1,
            textAlign: TextAlign.center,
          ),
          SizedBox(height: AppSpacing.md),
          Text(
            page.description,
            style: AppTextStyles.bodyLarge.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildIndicator() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(
        _pages.length,
        (index) => AnimatedContainer(
          duration: Duration(milliseconds: 300),
          margin: EdgeInsets.symmetric(horizontal: 4),
          width: _currentPage == index ? 24 : 8,
          height: 8,
          decoration: BoxDecoration(
            color: _currentPage == index
                ? AppColors.primaryGold
                : AppColors.divider,
            borderRadius: BorderRadius.circular(AppRadius.full),
          ),
        ),
      ),
    );
  }

  Widget _buildButtons() {
    return Padding(
      padding: EdgeInsets.all(AppSpacing.lg),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          if (_currentPage > 0)
            TextButton(
              onPressed: () {
                _pageController.previousPage(
                  duration: Duration(milliseconds: 300),
                  curve: Curves.easeInOut,
                );
              },
              child: Text('Back'),
            )
          else
            SizedBox(width: 80),
          ElevatedButton(
            onPressed: () {
              if (_currentPage == _pages.length - 1) {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (_) => LoginScreen()),
                );
              } else {
                _pageController.nextPage(
                  duration: Duration(milliseconds: 300),
                  curve: Curves.easeInOut,
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGold,
              padding: EdgeInsets.symmetric(
                horizontal: AppSpacing.xl,
                vertical: AppSpacing.md,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
            ),
            child: Text(
              _currentPage == _pages.length - 1 ? 'Get Started' : 'Next',
              style: AppTextStyles.button.copyWith(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}
\`\`\`

### 1.3 Login Screen

**Design:**
\`\`\`
┌─────────────────────────────┐
│                             │
│         [FRSC Logo]         │
│                             │
│      Welcome Back!          │
│   Sign in to continue       │
│                             │
│  ┌─────────────────────┐   │
│  │ 📧 Email/Member ID  │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │ 🔒 Password    👁   │   │
│  └─────────────────────┘   │
│                             │
│  [Remember Me] [Forgot?]    │
│                             │
│  ┌─────────────────────┐   │
│  │      Sign In        │   │
│  └─────────────────────┘   │
│                             │
│  ─────── OR ───────         │
│                             │
│  [👤 Biometric Login]       │
│                             │
│  Don't have an account?     │
│       [Sign Up]             │
│                             │
└─────────────────────────────┘
\`\`\`

**Implementation:**
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
  bool _rememberMe = false;
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(AppSpacing.lg),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(height: AppSpacing.xl),
                // Logo
                Center(
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: AppColors.primaryGreen,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.home_work,
                      size: 40,
                      color: AppColors.primaryGold,
                    ),
                  ),
                ),
                SizedBox(height: AppSpacing.lg),
                // Title
                Text(
                  'Welcome Back!',
                  style: AppTextStyles.h1,
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: AppSpacing.xs),
                Text(
                  'Sign in to continue',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: AppSpacing.xl),
                // Email Field
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(
                    labelText: 'Email or Member ID',
                    prefixIcon: Icon(Icons.email_outlined),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                  ),
                  validator: (value) {
                    if (value?.isEmpty ?? true) {
                      return 'Please enter your email or member ID';
                    }
                    return null;
                  },
                ),
                SizedBox(height: AppSpacing.md),
                // Password Field
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    labelText: 'Password',
                    prefixIcon: Icon(Icons.lock_outlined),
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
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                  ),
                  validator: (value) {
                    if (value?.isEmpty ?? true) {
                      return 'Please enter your password';
                    }
                    return null;
                  },
                ),
                SizedBox(height: AppSpacing.md),
                // Remember Me & Forgot Password
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Checkbox(
                          value: _rememberMe,
                          onChanged: (value) {
                            setState(() => _rememberMe = value ?? false);
                          },
                        ),
                        Text('Remember Me', style: AppTextStyles.bodySmall),
                      ],
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => ForgotPasswordScreen(),
                          ),
                        );
                      },
                      child: Text('Forgot Password?'),
                    ),
                  ],
                ),
                SizedBox(height: AppSpacing.lg),
                // Sign In Button
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGold,
                    padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                  ),
                  child: _isLoading
                      ? CircularProgressIndicator(color: Colors.white)
                      : Text(
                          'Sign In',
                          style: AppTextStyles.button.copyWith(
                            color: Colors.white,
                          ),
                        ),
                ),
                SizedBox(height: AppSpacing.lg),
                // Divider
                Row(
                  children: [
                    Expanded(child: Divider()),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: AppSpacing.md),
                      child: Text('OR', style: AppTextStyles.caption),
                    ),
                    Expanded(child: Divider()),
                  ],
                ),
                SizedBox(height: AppSpacing.lg),
                // Biometric Login
                OutlinedButton.icon(
                  onPressed: _handleBiometricLogin,
                  icon: Icon(Icons.fingerprint),
                  label: Text('Login with Biometrics'),
                  style: OutlinedButton.styleFrom(
                    padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                  ),
                ),
                SizedBox(height: AppSpacing.xl),
                // Sign Up Link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Don't have an account? ",
                      style: AppTextStyles.bodyMedium,
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => RegisterScreen(),
                          ),
                        );
                      },
                      child: Text(
                        'Sign Up',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.primaryGold,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
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

  Future<void> _handleLogin() async {
    if (_formKey.currentState?.validate() ?? false) {
      setState(() => _isLoading = true);
      try {
        await AuthService.login(
          _emailController.text,
          _passwordController.text,
          rememberMe: _rememberMe,
        );
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => DashboardScreen()),
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Login failed: ${e.toString()}')),
        );
      } finally {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _handleBiometricLogin() async {
    // Implement biometric authentication
  }
}
\`\`\`

### 1.4 Register Screen

**Design with Member/Non-Member Toggle and Employment Details:**
\`\`\`
┌─────────────────────────────┐
│      Create Account         │
│                             │
│  ┌─────────┬─────────┐     │
│  │ Member  │Non-Member│     │
│  └─────────┴─────────┘     │
│                             │
│  Personal Information       │
│  ┌─────────────────────┐   │
│  │ Full Name           │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ Email Address       │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ Phone Number        │   │
│  └─────────────────────┘   │
│                             │
│  Employment Details         │
│  ┌─────────────────────┐   │
│  │ IPPIS Number        │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ Date of First Emp.  │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ Years of Service    │   │
│  │ (Auto-calculated)   │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ Command/Department  │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ Unit                │   │
│  └─────────────────────┘   │
│                             │
│  Security                   │
│  ┌─────────────────────┐   │
│  │ Password            │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ Confirm Password    │   │
│  └─────────────────────┘   │
│                             │
│  ☐ I agree to Terms         │
│                             │
│  ┌─────────────────────┐   │
│  │    Sign Up          │   │
│  └─────────────────────┘   │
│                             │
│  Already have account?      │
│       [Sign In]             │
└─────────────────────────────┘
\`\`\`

**Implementation with OTP Verification:**
\`\`\`dart
import 'package:intl/intl.dart'; // Import for DateFormat

class RegisterScreen extends StatefulWidget {
  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  String _membershipType = 'member';
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _ippisController = TextEditingController();
  final _employmentDateController = TextEditingController();
  final _commandController = TextEditingController();
  final _unitController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _termsAccepted = false;

  String _yearsOfService = '';
  bool _showOtpDialog = false;
  String _otpCode = '';

  void _calculateYearsOfService(DateTime employmentDate) {
    final now = DateTime.now();
    final years = now.year - employmentDate.year;
    final months = now.month - employmentDate.month;
    
    int totalYears = years;
    int totalMonths = months;
    
    if (totalMonths < 0) {
      totalYears--;
      totalMonths += 12;
    }
    
    setState(() {
      _yearsOfService = '$totalYears yrs and $totalMonths months (approximately ${totalYears + (totalMonths >= 6 ? 1 : 0)} yrs)';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Create Account'),
        backgroundColor: AppColors.primaryGreen,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Membership Type Toggle
              Container(
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: _buildMembershipToggle('Member', 'member'),
                    ),
                    Expanded(
                      child: _buildMembershipToggle('Non-Member', 'non-member'),
                    ),
                  ],
                ),
              ),
              SizedBox(height: AppSpacing.lg),
              
              // Personal Information Section
              Text('Personal Information', style: AppTextStyles.h3),
              SizedBox(height: AppSpacing.md),
              TextFormField(
                controller: _fullNameController,
                decoration: InputDecoration(
                  labelText: 'Full Name',
                  prefixIcon: Icon(Icons.person_outline),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
                validator: (value) {
                  if (value?.isEmpty ?? true) return 'Please enter your full name';
                  return null;
                },
              ),
              SizedBox(height: AppSpacing.md),
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: 'Email Address',
                  prefixIcon: Icon(Icons.email_outlined),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
                validator: (value) {
                  if (value?.isEmpty ?? true) return 'Please enter your email';
                  if (!value!.contains('@')) return 'Invalid email format';
                  return null;
                },
              ),
              SizedBox(height: AppSpacing.md),
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  labelText: 'Phone Number',
                  prefixIcon: Icon(Icons.phone_outlined),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
                validator: (value) {
                  if (value?.isEmpty ?? true) return 'Please enter your phone number';
                  return null;
                },
              ),
              
              if (_membershipType == 'member') ...[
                SizedBox(height: AppSpacing.lg),
                Text('Employment Details', style: AppTextStyles.h3),
                SizedBox(height: AppSpacing.md),
                
                TextFormField(
                  controller: _ippisController,
                  decoration: InputDecoration(
                    labelText: 'IPPIS Number',
                    prefixIcon: Icon(Icons.badge_outlined),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                  ),
                  validator: (value) {
                    if (value?.isEmpty ?? true) {
                      return 'Please enter your IPPIS number';
                    }
                    return null;
                  },
                ),
                SizedBox(height: AppSpacing.md),
                
                TextFormField(
                  controller: _employmentDateController,
                  decoration: InputDecoration(
                    labelText: 'Date of First Employment',
                    prefixIcon: Icon(Icons.calendar_today),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                  ),
                  readOnly: true,
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: DateTime.now(),
                      firstDate: DateTime(1970),
                      lastDate: DateTime.now(),
                    );
                    if (date != null) {
                      _employmentDateController.text = 
                        DateFormat('yyyy-MM-dd').format(date);
                      _calculateYearsOfService(date);
                    }
                  },
                  validator: (value) {
                    if (_membershipType == 'member' && value?.isEmpty ?? true) {
                      return 'Please select your employment date';
                    }
                    return null;
                  },
                ),
                SizedBox(height: AppSpacing.md),
                
                // Auto-calculated years of service
                Container(
                  padding: EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    border: Border.all(color: AppColors.divider),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.work_history, color: AppColors.primaryGreen),
                      SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Years of Service', style: AppTextStyles.caption),
                            Text(
                              _yearsOfService.isEmpty ? 'Not calculated' : _yearsOfService,
                              style: AppTextStyles.bodyMedium.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: AppSpacing.md),
                
                TextFormField(
                  controller: _commandController,
                  decoration: InputDecoration(
                    labelText: 'Command/Department',
                    prefixIcon: Icon(Icons.business),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                  ),
                ),
                SizedBox(height: AppSpacing.md),
                
                TextFormField(
                  controller: _unitController,
                  decoration: InputDecoration(
                    labelText: 'Unit',
                    prefixIcon: Icon(Icons.group_work),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                  ),
                ),
              ],
              
              // Security Section
              SizedBox(height: AppSpacing.lg),
              Text('Security', style: AppTextStyles.h3),
              SizedBox(height: AppSpacing.md),
              TextFormField(
                controller: _passwordController,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: 'Password',
                  prefixIcon: Icon(Icons.lock_outlined),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
                validator: (value) {
                  if (value?.isEmpty ?? true) return 'Please enter your password';
                  if (value!.length < 6) return 'Password must be at least 6 characters';
                  return null;
                },
              ),
              SizedBox(height: AppSpacing.md),
              TextFormField(
                controller: _confirmPasswordController,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: 'Confirm Password',
                  prefixIcon: Icon(Icons.lock_outlined),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
                validator: (value) {
                  if (value?.isEmpty ?? true) return 'Please confirm your password';
                  if (value != _passwordController.text) return 'Passwords do not match';
                  return null;
                },
              ),
              SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  Checkbox(
                    value: _termsAccepted,
                    onChanged: (value) {
                      setState(() => _termsAccepted = value ?? false);
                    },
                  ),
                  Text('I agree to the '),
                  TextButton(
                    onPressed: () { /* Navigate to Terms and Conditions */ },
                    child: Text('Terms and Conditions', style: TextStyle(decoration: TextDecoration.underline)),
                  ),
                ],
              ),
              SizedBox(height: AppSpacing.xl),
              ElevatedButton(
                onPressed: _handleRegister,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGold,
                  padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
                child: Text('Sign Up', style: AppTextStyles.button.copyWith(color: Colors.white)),
              ),
              SizedBox(height: AppSpacing.lg),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text("Already have an account? "),
                  TextButton(
                    onPressed: () => Navigator.pop(context), // Go back to Login
                    child: Text('Sign In', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMembershipToggle(String label, String value) {
    return InkWell(
      onTap: () => setState(() => _membershipType = value),
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: Container(
        padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: _membershipType == value ? AppColors.primaryGold : Colors.transparent,
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontWeight: _membershipType == value ? FontWeight.bold : FontWeight.normal,
            color: _membershipType == value ? Colors.white : AppColors.textPrimary,
          ),
        ),
      ),
    );
  }

  Future<void> _handleRegister() async {
    if (_formKey.currentState?.validate() ?? false) {
      if (!_termsAccepted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Please accept the terms and conditions')),
        );
        return;
      }

      setState(() => _showOtpDialog = true); // Indicate that OTP dialog should be shown
      _showOtpVerificationDialog();

      // In a real app, you would call an AuthService.register here
      // and then trigger the OTP verification.
      // For demonstration, we simulate registration and then open the dialog.
      
      // try {
      //   await AuthService.register({
      //     'fullName': _fullNameController.text,
      //     'email': _emailController.text,
      //     'phone': _phoneController.text,
      //     'membershipType': _membershipType,
      //     if (_membershipType == 'member') ...{
      //       'ippisNumber': _ippisController.text,
      //       'employmentDate': _employmentDateController.text,
      //       'command': _commandController.text,
      //       'unit': _unitController.text,
      //     },
      //     'password': _passwordController.text,
      //   });
        
      //   setState(() => _showOtpDialog = true); 
      //   _showOtpVerificationDialog();
      // } catch (e) {
      //   ScaffoldMessenger.of(context).showSnackBar(
      //     SnackBar(content: Text('Registration failed: ${e.toString()}')),
      //   );
      // }
    }
  }

  void _showOtpVerificationDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Text('Verify OTP'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Enter the OTP sent to ${_emailController.text}'),
            SizedBox(height: AppSpacing.md),
            TextField(
              onChanged: (value) => _otpCode = value,
              keyboardType: TextInputType.number,
              maxLength: 6,
              decoration: InputDecoration(
                labelText: 'OTP Code',
                border: OutlineInputBorder(),
                counterText: '', // Hide counter
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              // In a real app, you would handle resending OTP here
            },
            child: Text('Resend'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (_otpCode.length == 6) {
                try {
                  // Simulate OTP verification
                  await Future.delayed(Duration(seconds: 1)); // Simulate network call
                  if (_otpCode == '123456') { // Replace with actual verification
                    Navigator.of(context).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('OTP Verified Successfully!')),
                    );
                    // Redirect to subscription page or login
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (_) => SubscriptionScreen(), // Assuming SubscriptionScreen is defined elsewhere
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Invalid OTP. Please try again.')),
                    );
                  }
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('OTP verification failed. Please try again.')),
                  );
                }
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Please enter a 6-digit OTP')),
                );
              }
            },
            child: Text('Verify'),
          ),
        ],
      ),
    );
  }
}

// Dummy classes for compilation
class AuthService {
  static Future<bool> isAuthenticated() async => false;
  static Future<void> login(String email, String password, {bool rememberMe = false}) async {}
  static Future<void> register(Map<String, dynamic> data) async {}
  static Future<void> verifyOtp(String otp) async {}
}

class SubscriptionScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Subscription')),
      body: Center(child: Text('Subscription Screen Placeholder')),
    );
  }
}
\`\`\`

### 1.4 Register Screen - UPDATED

**Multi-Step Registration Form with 4 Steps:**

The registration process is now divided into 4 clear steps with a progress indicator:
1. Personal Information
2. Employment Details (for members)
3. Next of Kin
4. Documents

**Design:**
\`\`\`
┌─────────────────────────────┐
│  FRSC Housing Management    │
│                             │
│  Step 2 of 4    50% Complete│
│  ━━━━━━━━━━━━━━━━━━━━━━━━  │
│                             │
│  ┌─────────┬─────────┬────┐│
│  │Personal │Employment│NOK ││
│  └─────────┴─────────┴────┘│
│  ┌─────────┐               │
│  │Documents│               │
│  └─────────┘               │
│                             │
│  Employment Information     │
│  Provide your FRSC details  │
│                             │
│  ┌─────────────────────┐   │
│  │ Staff ID Number     │   │
│  │ C-01943             │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ IPPIS Number        │   │
│  │ IPPIS123456         │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ Rank/Position       │   │
│  │ Corps Commander     │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ Command/Department  │   │
│  │ Housing             │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ Unit                │   │
│  │ CMO                 │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ Date of Employment  │   │
│  │ 05/01/1998      📅  │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ Years of Service    │   │
│  │ 27 yrs and 0 months │   │
│  │ (approximately 27yrs)│   │
│  └─────────────────────┘   │
│                             │
│  ┌──────┐  ┌──────────┐    │
│  │ Back │  │   Next   │    │
│  └──────┘  └──────────┘    │
└─────────────────────────────┘
\`\`\`

**Implementation with Multi-Step Form:**
\`\`\`dart
class RegisterScreen extends StatefulWidget {
  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  int _currentStep = 0;
  
  // Controllers for all steps
  // Step 1: Personal
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  String _membershipType = 'member';
  
  // Step 2: Employment (for members)
  final _staffIdController = TextEditingController();
  final _ippisController = TextEditingController();
  final _rankController = TextEditingController();
  final _commandController = TextEditingController();
  final _unitController = TextEditingController();
  final _employmentDateController = TextEditingController();
  String _yearsOfService = '';
  
  // Step 3: Next of Kin
  final _nokNameController = TextEditingController();
  final _nokRelationshipController = TextEditingController();
  final _nokPhoneController = TextEditingController();
  final _nokEmailController = TextEditingController();
  final _nokAddressController = TextEditingController();
  
  // Step 4: Documents (for non-members)
  String _idType = 'NIN';
  final _idNumberController = TextEditingController();

  void _calculateYearsOfService(DateTime employmentDate) {
    final now = DateTime.now();
    int years = now.year - employmentDate.year;
    int months = now.month - employmentDate.month;
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    setState(() {
      _yearsOfService = '$years yrs and $months months (approximately ${years + (months >= 6 ? 1 : 0)} yrs)';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Create Account'),
        backgroundColor: AppColors.primaryGreen,
      ),
      body: Column(
        children: [
          _buildProgressIndicator(),
          _buildStepTabs(),
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(AppSpacing.lg),
              child: Form(
                key: _formKey,
                child: _buildCurrentStep(),
              ),
            ),
          ),
          _buildNavigationButtons(),
        ],
      ),
    );
  }

  Widget _buildProgressIndicator() {
    double progress = (_currentStep + 1) / 4;
    return Container(
      padding: EdgeInsets.all(AppSpacing.md),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Step ${_currentStep + 1} of 4', style: AppTextStyles.bodyMedium),
              Text('${(progress * 100).toInt()}% Complete', 
                style: AppTextStyles.bodyMedium.copyWith(color: AppColors.primaryGold)),
            ],
          ),
          SizedBox(height: AppSpacing.sm),
          LinearProgressIndicator(
            value: progress,
            backgroundColor: AppColors.divider,
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryGold),
          ),
        ],
      ),
    );
  }

  Widget _buildStepTabs() {
    return Container(
      height: 60,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.symmetric(horizontal: AppSpacing.md),
        children: [
          _buildStepTab('Personal', 0),
          _buildStepTab('Employment', 1),
          _buildStepTab('Next of Kin', 2),
          _buildStepTab('Documents', 3),
        ],
      ),
    );
  }

  Widget _buildStepTab(String label, int step) {
    bool isActive = _currentStep == step;
    bool isCompleted = _currentStep > step;
    
    return Container(
      margin: EdgeInsets.only(right: AppSpacing.sm),
      child: InkWell(
        onTap: () {
          if (isCompleted || step == _currentStep) {
            setState(() => _currentStep = step);
          }
        },
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
          decoration: BoxDecoration(
            color: isActive ? AppColors.primaryGold : 
                   isCompleted ? AppColors.primaryGreen.withOpacity(0.1) : 
                   AppColors.background,
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(
              color: isActive ? AppColors.primaryGold : 
                     isCompleted ? AppColors.primaryGreen : 
                     AppColors.divider,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: isActive ? Colors.white : 
                     isCompleted ? AppColors.primaryGreen : 
                     AppColors.textSecondary,
              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCurrentStep() {
    switch (_currentStep) {
      case 0:
        return _buildPersonalStep();
      case 1:
        return _buildEmploymentStep();
      case 2:
        return _buildNextOfKinStep();
      case 3:
        return _buildDocumentsStep();
      default:
        return Container();
    }
  }

  Widget _buildPersonalStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('Personal Information', style: AppTextStyles.h2),
        SizedBox(height: AppSpacing.md),
        
        // Membership Type Toggle
        Container(
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          child: Row(
            children: [
              Expanded(child: _buildMembershipToggle('Member', 'member')),
              Expanded(child: _buildMembershipToggle('Non-Member', 'non-member')),
            ],
          ),
        ),
        SizedBox(height: AppSpacing.lg),
        
        // Form fields
        TextFormField(
          controller: _firstNameController,
          decoration: InputDecoration(
            labelText: 'First Name',
            prefixIcon: Icon(Icons.person_outline),
          ),
          validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
        ),
        SizedBox(height: AppSpacing.md),
        
        TextFormField(
          controller: _lastNameController,
          decoration: InputDecoration(
            labelText: 'Last Name',
            prefixIcon: Icon(Icons.person_outline),
          ),
          validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
        ),
        SizedBox(height: AppSpacing.md),
        
        TextFormField(
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          decoration: InputDecoration(
            labelText: 'Email Address',
            prefixIcon: Icon(Icons.email_outlined),
          ),
          validator: (value) {
            if (value?.isEmpty ?? true) return 'Required';
            if (!value!.contains('@')) return 'Invalid email';
            return null;
          },
        ),
        SizedBox(height: AppSpacing.md),
        
        TextFormField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          decoration: InputDecoration(
            labelText: 'Phone Number',
            prefixIcon: Icon(Icons.phone_outlined),
          ),
          validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
        ),
        SizedBox(height: AppSpacing.md),
        
        TextFormField(
          controller: _passwordController,
          obscureText: true,
          decoration: InputDecoration(
            labelText: 'Password',
            prefixIcon: Icon(Icons.lock_outlined),
          ),
          validator: (value) {
            if (value?.isEmpty ?? true) return 'Required';
            if (value!.length < 6) return 'Min 6 characters';
            return null;
          },
        ),
        SizedBox(height: AppSpacing.md),
        
        TextFormField(
          controller: _confirmPasswordController,
          obscureText: true,
          decoration: InputDecoration(
            labelText: 'Confirm Password',
            prefixIcon: Icon(Icons.lock_outlined),
          ),
          validator: (value) {
            if (value != _passwordController.text) return 'Passwords do not match';
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildEmploymentStep() {
    if (_membershipType == 'non-member') {
      return Center(
        child: Text('Employment details not required for non-members'),
      );
    }
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('Employment Information', style: AppTextStyles.h2),
        Text('Provide your FRSC employment details', style: AppTextStyles.bodySmall),
        SizedBox(height: AppSpacing.lg),
        
        TextFormField(
          controller: _staffIdController,
          decoration: InputDecoration(
            labelText: 'Staff ID Number',
            prefixIcon: Icon(Icons.badge_outlined),
          ),
          validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
        ),
        SizedBox(height: AppSpacing.md),
        
        TextFormField(
          controller: _ippisController,
          decoration: InputDecoration(
            labelText: 'IPPIS Number',
            prefixIcon: Icon(Icons.numbers),
          ),
          validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
        ),
        SizedBox(height: AppSpacing.md),
        
        TextFormField(
          controller: _rankController,
          decoration: InputDecoration(
            labelText: 'Rank/Position',
            prefixIcon: Icon(Icons.military_tech),
          ),
        ),
        SizedBox(height: AppSpacing.md),
        
        TextFormField(
          controller: _commandController,
          decoration: InputDecoration(
            labelText: 'Command/Department',
            prefixIcon: Icon(Icons.business),
          ),
        ),
        SizedBox(height: AppSpacing.md),
        
        TextFormField(
          controller: _unitController,
          decoration: InputDecoration(
            labelText: 'Unit',
            prefixIcon: Icon(Icons.group_work),
          ),
        ),
        SizedBox(height: AppSpacing.md),
        
        TextFormField(
          controller: _employmentDateController,
          decoration: InputDecoration(
            labelText: 'Date of First Employment',
            prefixIcon: Icon(Icons.calendar_today),
            suffixIcon: Icon(Icons.calendar_month),
          ),
          readOnly: true,
          onTap: () async {
            final date = await showDatePicker(
              context: context,
              initialDate: DateTime.now(),
              firstDate: DateTime(1970),
              lastDate: DateTime.now(),
            );
            if (date != null) {
              _employmentDateController.text = DateFormat('dd/MM/yyyy').format(date);
              _calculateYearsOfService(date);
            }
          },
          validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
        ),
        SizedBox(height: AppSpacing.md),
        
        Container(
          padding: EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.primaryGreen.withOpacity(0.1),
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(color: AppColors.primaryGreen.withOpacity(0.3)),
          ),
          child: Row(
            children: [
              Icon(Icons.work_history, color: AppColors.primaryGreen),
              SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Years of Service', style: AppTextStyles.caption),
                    Text(
                      _yearsOfService.isEmpty ? 'Not calculated' : _yearsOfService,
                      style: AppTextStyles.bodyMedium.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildNextOfKinStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('Next of Kin Information', style: AppTextStyles.h2),
        SizedBox(height: AppSpacing.lg),
        
        TextFormField(
          controller: _nokNameController,
          decoration: InputDecoration(
            labelText: 'Full Name',
            prefixIcon: Icon(Icons.person),
          ),
          validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
        ),
        SizedBox(height: AppSpacing.md),
        
        TextFormField(
          controller: _nokRelationshipController,
          decoration: InputDecoration(
            labelText: 'Relationship',
            prefixIcon: Icon(Icons.family_restroom),
          ),
        ),
        SizedBox(height: AppSpacing.md),
        
        TextFormField(
          controller: _nokPhoneController,
          keyboardType: TextInputType.phone,
          decoration: InputDecoration(
            labelText: 'Phone Number',
            prefixIcon: Icon(Icons.phone),
          ),
          validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
        ),
        SizedBox(height: AppSpacing.md),
        
        TextFormField(
          controller: _nokEmailController,
          keyboardType: TextInputType.emailAddress,
          decoration: InputDecoration(
            labelText: 'Email Address',
            prefixIcon: Icon(Icons.email),
          ),
        ),
        SizedBox(height: AppSpacing.md),
        
        TextFormField(
          controller: _nokAddressController,
          maxLines: 3,
          decoration: InputDecoration(
            labelText: 'Address',
            prefixIcon: Icon(Icons.location_on),
          ),
        ),
      ],
    );
  }

  Widget _buildDocumentsStep() {
    if (_membershipType == 'member') {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.check_circle, size: 64, color: AppColors.primaryGreen),
            SizedBox(height: AppSpacing.md),
            Text('All information collected!', style: AppTextStyles.h3),
            Text('Click Submit to complete registration', style: AppTextStyles.bodySmall),
          ],
        ),
      );
    }
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('ID Verification', style: AppTextStyles.h2),
        Text('For non-members only', style: AppTextStyles.bodySmall),
        SizedBox(height: AppSpacing.lg),
        
        DropdownButtonFormField<String>(
          value: _idType,
          decoration: InputDecoration(
            labelText: 'ID Type',
            prefixIcon: Icon(Icons.credit_card),
          ),
          items: [
            DropdownMenuItem(value: 'NIN', child: Text('NIN Card')),
            DropdownMenuItem(value: 'Drivers License', child: Text('Driver\'s License')),
            DropdownMenuItem(value: 'FRSC ID', child: Text('FRSC ID')),
            DropdownMenuItem(value: 'International Passport', child: Text('International Passport')),
          ],
          onChanged: (value) => setState(() => _idType = value!),
        ),
        SizedBox(height: AppSpacing.md),
        
        TextFormField(
          controller: _idNumberController,
          decoration: InputDecoration(
            labelText: 'ID Number',
            prefixIcon: Icon(Icons.numbers),
          ),
          validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
        ),
      ],
    );
  }

  Widget _buildNavigationButtons() {
    return Container(
      padding: EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          if (_currentStep > 0)
            Expanded(
              child: OutlinedButton(
                onPressed: () => setState(() => _currentStep--),
                style: OutlinedButton.styleFrom(
                  padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
                ),
                child: Text('Back'),
              ),
            ),
          if (_currentStep > 0) SizedBox(width: AppSpacing.md),
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: _handleNext,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGold,
                padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
              ),
              child: Text(
                _currentStep == 3 ? 'Submit' : 'Next',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMembershipToggle(String label, String value) {
    return InkWell(
      onTap: () => setState(() => _membershipType = value),
      child: Container(
        padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: _membershipType == value ? AppColors.primaryGold : Colors.transparent,
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontWeight: _membershipType == value ? FontWeight.bold : FontWeight.normal,
            color: _membershipType == value ? Colors.white : AppColors.textPrimary,
          ),
        ),
      ),
    );
  }

  void _handleNext() {
    if (_formKey.currentState?.validate() ?? false) {
      if (_currentStep < 3) {
        setState(() => _currentStep++);
      } else {
        _submitRegistration();
      }
    }
  }

  Future<void> _submitRegistration() async {
    // Show loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Center(child: CircularProgressIndicator()),
    );

    try {
      // Call API to register
      // await AuthService.register({...});
      
      Navigator.pop(context); // Close loading
      
      _showOtpDialog();
    } catch (e) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Registration failed: ${e.toString()}')),
      );
    }
  }

  void _showOtpDialog() {
    String otpCode = '';
    
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Text('Verify OTP'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Enter the OTP sent to ${_emailController.text}'),
            SizedBox(height: AppSpacing.md),
            TextField(
              onChanged: (value) => otpCode = value,
              keyboardType: TextInputType.number,
              maxLength: 6,
              textAlign: TextAlign.center,
              decoration: InputDecoration(
                labelText: 'OTP Code',
                border: OutlineInputBorder(),
                counterText: '',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              // Resend OTP
            },
            child: Text('Resend'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (otpCode.length == 6) {
                try {
                  // Verify OTP
                  // await AuthService.verifyOtp(otpCode);
                  
                  Navigator.pop(context); // Close OTP dialog
                  
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (_) => SubscriptionScreen(),
                    ),
                  );
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Invalid OTP')),
                  );
                }
              }
            },
            child: Text('Verify'),
          ),
        ],
      ),
    );
  }
}
\`\`\`

### 1.5 Forgot Password Screen

**Design:**
\`\`\`
┌─────────────────────────────┐
│  ← Forgot Password          │
├─────────────────────────────┤
│                             │
│  Enter your email address   │
│  to reset your password.    │
│                             │
│  ┌─────────────────────┐   │
│  │ 📧 Email Address    │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │ [Send Reset Link]   │   │
│  └─────────────────────┘   │
│                             │
│  Remembered your password?  │
│       [Sign In]             │
└─────────────────────────────┘
\`\`\`

**Implementation:**
\`\`\`dart
class ForgotPasswordScreen extends StatefulWidget {
  @override
  _ForgotPasswordScreenState createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Forgot Password'),
        backgroundColor: AppColors.primaryGreen,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(height: AppSpacing.xl),
              Icon(
                Icons.lock_reset,
                size: 80,
                color: AppColors.primaryGreen,
              ),
              SizedBox(height: AppSpacing.lg),
              Text(
                'Reset Your Password',
                style: AppTextStyles.h2,
                textAlign: TextAlign.center,
              ),
              SizedBox(height: AppSpacing.xs),
              Text(
                'Enter your email address to receive a password reset link.',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: AppSpacing.xl),
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: 'Email Address',
                  prefixIcon: Icon(Icons.email_outlined),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
                validator: (value) {
                  if (value?.isEmpty ?? true) {
                    return 'Please enter your email address';
                  }
                  if (!value!.contains('@')) {
                    return 'Invalid email format';
                  }
                  return null;
                },
              ),
              SizedBox(height: AppSpacing.lg),
              ElevatedButton(
                onPressed: _isLoading ? null : _handleResetPassword,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGold,
                  padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
                child: _isLoading
                    ? CircularProgressIndicator(color: Colors.white)
                    : Text(
                        'Send Reset Link',
                        style: AppTextStyles.button.copyWith(color: Colors.white),
                      ),
              ),
              SizedBox(height: AppSpacing.lg),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text("Remembered your password? "),
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text('Sign In', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleResetPassword() async {
    if (_formKey.currentState?.validate() ?? false) {
      setState(() => _isLoading = true);
      try {
        // Simulate password reset API call
        await Future.delayed(Duration(seconds: 2));
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Password reset link sent to ${_emailController.text}')),
        );
        Navigator.pop(context); // Go back to login screen
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send reset link. Please try again.')),
        );
      } finally {
        setState(() => _isLoading = false);
      }
    }
  }
}
\`\`\`

### 1.5 Subscription Screen - NEW

After successful OTP verification, users are redirected to the subscription page to choose a membership plan.

**Design:**
\`\`\`
┌─────────────────────────────┐
│  Choose Your Plan           │
│                             │
│  ┌─────────────────────┐   │
│  │  Weekly Basic       │   │
│  │  7 days             │   │
│  │                     │   │
│  │  ₦500               │   │
│  │                     │   │
│  │  ✓ Access to all    │   │
│  │    modules          │   │
│  │  ✓ Basic support    │   │
│  │  ✓ Weekly reports   │   │
│  │  ✓ Mobile app access│   │
│  │                     │   │
│  │  [Subscribe Now]    │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │ 🏆 Most Popular     │   │
│  │  Monthly Standard   │   │
│  │  30 days            │   │
│  │                     │   │
│  │  ₦1,500             │   │
│  │                     │   │
│  │  ✓ Access to all    │   │
│  │    modules          │   │
│  │  ✓ Priority support │   │
│  │  ✓ Daily reports    │   │
│  │  ✓ Mobile app access│   │
│  │  ✓ Email notifs     │   │
│  │                     │   │
│  │  [Subscribe Now]    │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
\`\`\`

**Implementation:**
\`\`\`dart
class SubscriptionScreen extends StatefulWidget {
  @override
  _SubscriptionScreenState createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends State<SubscriptionScreen> {
  String? _selectedPlan;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Choose Your Plan'),
        backgroundColor: AppColors.primaryGreen,
        automaticallyImplyLeading: false, // Prevent back navigation
      ),
      body: Padding(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(
          children: [
            Text('Join FRSC Housing Management System', style: AppTextStyles.h2),
            SizedBox(height: AppSpacing.md),
            Text(
              'Select a plan to access all features and benefits.',
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: AppSpacing.xl),
            
            _buildPlanCard(
              title: 'Weekly Basic',
              duration: '7 days',
              price: '₦500',
              features: [
                'Access to all modules',
                'Basic support',
                'Weekly reports',
                'Mobile app access',
              ],
              planKey: 'weekly',
            ),
            SizedBox(height: AppSpacing.md),
            
            _buildPlanCard(
              title: 'Monthly Standard',
              duration: '30 days',
              price: '₦1,500',
              features: [
                'Access to all modules',
                'Priority support',
                'Daily reports',
                'Mobile app access',
                'Email notifications',
              ],
              isPopular: true,
              planKey: 'monthly',
            ),
            
            Spacer(),
            
            ElevatedButton(
              onPressed: _selectedPlan == null ? null : _handleSubscription,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGold,
                padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
              ),
              child: Text(
                'Subscribe Now',
                style: AppTextStyles.button.copyWith(color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlanCard({
    required String title,
    required String duration,
    required String price,
    required List<String> features,
    String planKey = '',
    bool isPopular = false,
  }) {
    return InkWell(
      onTap: () => setState(() => _selectedPlan = planKey),
      child: Card(
        elevation: isPopular ? 6 : 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          side: BorderSide(
            color: _selectedPlan == planKey ? AppColors.primaryGold : AppColors.divider,
            width: _selectedPlan == planKey ? 2 : 1,
          ),
        ),
        child: Padding(
          padding: EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (isPopular)
                Row(
                  children: [
                    Icon(Icons.star, color: AppColors.primaryGold),
                    SizedBox(width: AppSpacing.xs),
                    Text('🏆 Most Popular', style: AppTextStyles.bodySmall.copyWith(color: AppColors.primaryGold, fontWeight: FontWeight.bold)),
                  ],
                ),
              SizedBox(height: isPopular ? AppSpacing.sm : 0),
              Text(title, style: AppTextStyles.h3),
              Text(duration, style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
              SizedBox(height: AppSpacing.md),
              Text(price, style: AppTextStyles.h1.copyWith(fontWeight: FontWeight.bold)),
              SizedBox(height: AppSpacing.lg),
              ...features.map((feature) => Padding(
                padding: EdgeInsets.only(bottom: AppSpacing.xs),
                child: Row(
                  children: [
                    Icon(Icons.check, color: AppColors.success, size: 16),
                    SizedBox(width: AppSpacing.sm),
                    Text(feature, style: AppTextStyles.bodyMedium),
                  ],
                ),
              )).toList(),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleSubscription() async {
    if (_selectedPlan == null) return;

    // Simulate payment processing and subscription activation
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Center(child: CircularProgressIndicator()),
    );
    
    await Future.delayed(Duration(seconds: 2));
    
    Navigator.pop(context); // Close loading dialog

    // On successful subscription, navigate to dashboard
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => DashboardScreen()),
    );
  }
}
\`\`\`

---

## 2. Dashboard & Home

### 2.1 Main Dashboard

**Design:**
\`\`\`
┌─────────────────────────────┐
│ ☰  FRSC HMS        🔔 👤   │
├─────────────────────────────┤
│                             │
│  Good Morning, John! 👋     │
│  Member ID: FRSC-2024-001   │
│                             │
│  ┌─────────────────────┐   │
│  │  💰 Wallet Balance  │   │
│  │  ₦ 250,000.00       │   │
│  │  [👁] [+ Add Funds] │   │
│  └─────────────────────┘   │
│                             │
│  Quick Actions              │
│  ┌───┬───┬───┬───┐         │
│  │💵 │Loan│Buy│Rpt│         │
│  │Pay│   │   │   │         │
│  └───┴───┴───┴───┘         │
│                             │
│  Overview                   │
│  ┌─────────────────────┐   │
│  │ 📈 Contributions    │   │
│  │ ₦ 1,500,000         │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ 💼 Investments      │   │
│  │ ₦ 3,200,000         │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ 🏦 Active Loans     │   │
│  │ ₦ 500,000           │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ 🏠 Properties       │   │
│  │ 2 Properties        │   │
│  └─────────────────────┘   │
│                             │
│  Recent Transactions        │
│  ┌─────────────────────┐   │
│  │ 💵 Contribution     │   │
│  │ ₦ 50,000  Today     │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ 🏦 Loan Repayment   │   │
│  │ ₦ 25,000  Yesterday │   │
│  └─────────────────────┘   │
│                             │
└─────────────────────────────┘
│ [🏠] [💰] [📊] [✉️] [👤]  │
└─────────────────────────────┘
\`\`\`

**Implementation:**
\`\`\`dart
class DashboardScreen extends StatefulWidget {
  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _showBalance = true;
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.primaryGreen,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.menu, color: Colors.white),
          onPressed: () => Scaffold.of(context).openDrawer(),
        ),
        title: Text(
          'FRSC HMS',
          style: TextStyle(color: Colors.white),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.notifications_outlined, color: Colors.white),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => NotificationsScreen()),
              );
            },
          ),
          IconButton(
            icon: Icon(Icons.account_circle_outlined, color: Colors.white),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => ProfileScreen()),
              );
            },
          ),
        ],
      ),
      drawer: _buildDrawer(),
      body: RefreshIndicator(
        onRefresh: _refreshData,
        child: SingleChildScrollView(
          padding: EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildGreeting(),
              SizedBox(height: AppSpacing.lg),
              _buildWalletCard(),
              SizedBox(height: AppSpacing.lg),
              _buildQuickActions(),
              SizedBox(height: AppSpacing.lg),
              _buildOverviewSection(),
              SizedBox(height: AppSpacing.lg),
              _buildRecentTransactions(),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildGreeting() {
    final hour = DateTime.now().hour;
    String greeting = 'Good Morning';
    if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    if (hour >= 17) greeting = 'Good Evening';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '$greeting, John! 👋',
          style: AppTextStyles.h2,
        ),
        SizedBox(height: AppSpacing.xs),
        Text(
          'Member ID: FRSC-2024-001',
          style: AppTextStyles.bodySmall.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildWalletCard() {
    return Container(
      padding: EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primaryGreen, AppColors.darkGreen],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryGreen.withOpacity(0.3),
            blurRadius: 10,
            offset: Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '💰 Wallet Balance',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: Colors.white70,
                ),
              ),
              IconButton(
                icon: Icon(
                  _showBalance ? Icons.visibility : Icons.visibility_off,
                  color: Colors.white,
                ),
                onPressed: () {
                  setState(() => _showBalance = !_showBalance);
                },
              ),
            ],
          ),
          SizedBox(height: AppSpacing.sm),
          Text(
            _showBalance ? '₦ 250,000.00' : '₦ ••••••',
            style: AppTextStyles.h1.copyWith(
              color: AppColors.primaryGold,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: AppSpacing.md),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => AddFundsScreen()),
              );
            },
            icon: Icon(Icons.add),
            label: Text('Add Funds'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGold,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      QuickAction(
        icon: Icons.payment,
        label: 'Pay',
        color: AppColors.accentBlue,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => ContributionsScreen()),
        ),
      ),
      QuickAction(
        icon: Icons.account_balance,
        label: 'Loan',
        color: AppColors.accentOrange,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => LoansScreen()),
        ),
      ),
      QuickAction(
        icon: Icons.home,
        label: 'Buy',
        color: AppColors.primaryGreen,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => PropertiesScreen()),
        ),
      ),
      QuickAction(
        icon: Icons.bar_chart,
        label: 'Report',
        color: AppColors.primaryGold,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => ReportsScreen()),
        ),
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Quick Actions', style: AppTextStyles.h3),
        SizedBox(height: AppSpacing.md),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: actions.map((action) {
            return _buildQuickActionButton(action);
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildQuickActionButton(QuickAction action) {
    return InkWell(
      onTap: action.onTap,
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: action.color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: Icon(
              action.icon,
              color: action.color,
              size: 30,
            ),
          ),
          SizedBox(height: AppSpacing.xs),
          Text(
            action.label,
            style: AppTextStyles.bodySmall,
          ),
        ],
      ),
    );
  }

  Widget _buildOverviewSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Overview', style: AppTextStyles.h3),
        SizedBox(height: AppSpacing.md),
        _buildOverviewCard(
          icon: Icons.trending_up,
          title: 'Contributions',
          amount: '₦ 1,500,000',
          color: AppColors.success,
        ),
        SizedBox(height: AppSpacing.sm),
        _buildOverviewCard(
          icon: Icons.business_center,
          title: 'Investments',
          amount: '₦ 3,200,000',
          color: AppColors.accentBlue,
        ),
        SizedBox(height: AppSpacing.sm),
        _buildOverviewCard(
          icon: Icons.account_balance,
          title: 'Active Loans',
          amount: '₦ 500,000',
          color: AppColors.warning,
        ),
        SizedBox(height: AppSpacing.sm),
        _buildOverviewCard(
          icon: Icons.home_work,
          title: 'Properties',
          amount: '2 Properties',
          color: AppColors.primaryGreen,
        ),
      ],
    );
  }

  Widget _buildOverviewCard({
    required IconData icon,
    required String title,
    required String amount,
    required Color color,
  }) {
    return Container(
      padding: EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            child: Icon(icon, color: color),
          ),
          SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTextStyles.bodyMedium),
                Text(
                  amount,
                  style: AppTextStyles.h3.copyWith(color: color),
                ),
              ],
            ),
          ),
          Icon(Icons.chevron_right, color: AppColors.textSecondary),
        ],
      ),
    );
  }

  Widget _buildRecentTransactions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Recent Transactions', style: AppTextStyles.h3),
            TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => TransactionHistoryScreen()),
                );
              },
              child: Text('View All'),
            ),
          ],
        ),
        SizedBox(height: AppSpacing.md),
        _buildTransactionItem(
          icon: Icons.payment,
          title: 'Contribution',
          amount: '₦ 50,000',
          date: 'Today',
          isCredit: false,
        ),
        _buildTransactionItem(
          icon: Icons.account_balance,
          title: 'Loan Repayment',
          amount: '₦ 25,000',
          date: 'Yesterday',
          isCredit: false,
        ),
        _buildTransactionItem(
          icon: Icons.add_circle,
          title: 'Wallet Top-up',
          amount: '₦ 100,000',
          date: '2 days ago',
          isCredit: true,
        ),
      ],
    );
  }

  Widget _buildTransactionItem({
    required IconData icon,
    required String title,
    required String amount,
    required String date,
    required bool isCredit,
  }) {
    return Container(
      margin: EdgeInsets.only(bottom: AppSpacing.sm),
      padding: EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: isCredit
                  ? AppColors.success.withOpacity(0.1)
                  : AppColors.error.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            child: Icon(
              icon,
              color: isCredit ? AppColors.success : AppColors.error,
            ),
          ),
          SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTextStyles.bodyMedium),
                Text(
                  date,
                  style: AppTextStyles.caption,
                ),
              ],
            ),
          ),
          Text(
            '${isCredit ? '+' : '-'} $amount',
            style: AppTextStyles.bodyMedium.copyWith(
              color: isCredit ? AppColors.success : AppColors.error,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNav() {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      selectedItemColor: AppColors.primaryGold,
      unselectedItemColor: AppColors.textSecondary,
      currentIndex: 0,
      items: [
        BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Home',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.account_balance_wallet),
          label: 'Wallet',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.bar_chart),
          label: 'Reports',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.mail),
          label: 'Mail',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person),
          label: 'Profile',
        ),
      ],
      onTap: (index) {
        // Handle navigation
      },
    );
  }

  Widget _buildDrawer() {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.primaryGreen, AppColors.darkGreen],
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: AppColors.primaryGold,
                  child: Text(
                    'JD',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
                SizedBox(height: AppSpacing.sm),
                Text(
                  'John Doe',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'FRSC-2024-001',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          _buildDrawerItem(Icons.dashboard, 'Dashboard', () {
            Navigator.pushReplacementNamed(context, '/dashboard');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.payment, 'Contributions', () {
            Navigator.pushReplacementNamed(context, '/contributions');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.account_balance, 'Loans', () {
            Navigator.pushReplacementNamed(context, '/loans');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.business_center, 'Investments', () {
            Navigator.pushReplacementNamed(context, '/investments');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.home_work, 'Properties', () {
            Navigator.pushReplacementNamed(context, '/properties');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.account_balance_wallet, 'Wallet', () {
            Navigator.pushReplacementNamed(context, '/wallet');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.mail, 'Mail Service', () {
            Navigator.pushReplacementNamed(context, '/mail');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.bar_chart, 'Reports', () {
            Navigator.pushReplacementNamed(context, '/reports');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.receipt, 'Statutory Charges', () {
            Navigator.pushReplacementNamed(context, '/statutory_charges');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.apartment, 'Property Management', () {
            Navigator.pushReplacementNamed(context, '/property_management');
            Navigator.pop(context);
          }),
          Divider(),
          _buildDrawerItem(Icons.settings, 'Settings', () {
            Navigator.pushReplacementNamed(context, '/settings');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.help, 'Help & Support', () {
            Navigator.pushReplacementNamed(context, '/help');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.logout, 'Logout', () {
            // Implement logout logic
            Navigator.pushReplacementNamed(context, '/login');
            Navigator.pop(context);
          }),
        ],
      ),
    );
  }

  Widget _buildDrawerItem(IconData icon, String title, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primaryGreen),
      title: Text(title),
      onTap: onTap,
    );
  }

  Future<void> _refreshData() async {
    // Implement data refresh
    await Future.delayed(Duration(seconds: 2));
  }
}

class QuickAction {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  QuickAction({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });
}

// Dummy classes for compilation
class NotificationsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(appBar: AppBar(title: Text('Notifications')), body: Center(child: Text('Notifications Screen')));
  }
}

class ProfileScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(appBar: AppBar(title: Text('Profile')), body: Center(child: Text('Profile Screen')));
  }
}

class AddFundsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(appBar: AppBar(title: Text('Add Funds')), body: Center(child: Text('Add Funds Screen')));
  }
}

class ContributionsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(appBar: AppBar(title: Text('Contributions')), body: Center(child: Text('Contributions Screen')));
  }
}

class LoansScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(appBar: AppBar(title: Text('Loans')), body: Center(child: Text('Loans Screen')));
  }
}

class PropertiesScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(appBar: AppBar(title: Text('Properties')), body: Center(child: Text('Properties Screen')));
  }
}

class ReportsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(appBar: AppBar(title: Text('Reports')), body: Center(child: Text('Reports Screen')));
  }
}

class TransactionHistoryScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(appBar: AppBar(title: Text('Transaction History')), body: Center(child: Text('Transaction History Screen')));
  }
}

// Placeholder for Navigation Routes
// In a real app, these would be defined in your main MaterialApp
// For example:
// initialRoute: '/splash',
// routes: {
//   '/splash': (context) => SplashScreen(),
//   '/login': (context) => LoginScreen(),
//   '/dashboard': (context) => DashboardScreen(),
//   '/contributions': (context) => ContributionsScreen(),
//   '/loans': (context) => LoansScreen(),
//   '/investments': (context) => InvestmentsScreen(),
//   '/properties': (context) => PropertiesScreen(),
//   '/wallet': (context) => WalletScreen(),
//   '/mail': (context) => MailScreen(),
//   '/reports': (context) => ReportsScreen(),
//   '/statutory_charges': (context) => StatutoryChargesScreen(),
//   '/property_management': (context) => PropertyManagementScreen(),
//   '/settings': (context) => SettingsScreen(),
//   '/help': (context) => HelpScreen(),
// },

\`\`\`

### 2.2 Dashboard Screen - UPDATED

**Non-Member Upgrade Alert:**

For non-members, an alert banner is displayed at the top of the dashboard encouraging them to upgrade.

**Design:**
\`\`\`
┌─────────────────────────────┐
│  ⚠️ Upgrade to Member       │
│  Enjoy lower interest rates │
│  and exclusive benefits!    │
│  [Upgrade Now]              │
└─────────────────────────────┘
│                             │
│  Dashboard Content...       │
\`\`\`

**Implementation:**
\`\`\`dart
class DashboardScreen extends StatefulWidget { // Changed from StatelessWidget to StatefulWidget to manage _showBalance
  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _showBalance = true; // Moved state to here
  final bool isNonMember = true; // Simulating non-member status for demonstration. In a real app, this would come from user authentication state.

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.primaryGreen,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.menu, color: Colors.white),
          onPressed: () => Scaffold.of(context).openDrawer(),
        ),
        title: Text(
          'FRSC HMS',
          style: TextStyle(color: Colors.white),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.notifications_outlined, color: Colors.white),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => NotificationsScreen()),
              );
            },
          ),
          IconButton(
            icon: Icon(Icons.account_circle_outlined, color: Colors.white),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => ProfileScreen()),
              );
            },
          ),
        ],
      ),
      drawer: _buildDrawer(),
      body: RefreshIndicator(
        onRefresh: _refreshData,
        child: SingleChildScrollView(
          padding: EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (isNonMember) _buildUpgradeAlert(context),
              
              _buildGreeting(),
              SizedBox(height: AppSpacing.lg),
              _buildWalletCard(), // Wallet card will use the _showBalance state
              SizedBox(height: AppSpacing.lg),
              _buildQuickActions(),
              SizedBox(height: AppSpacing.lg),
              _buildOverviewSection(),
              SizedBox(height: AppSpacing.lg),
              _buildRecentTransactions(),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  // Widget for the upgrade alert banner
  Widget _buildUpgradeAlert(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(bottom: AppSpacing.md), // Add margin below the alert
      padding: EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primaryGold, AppColors.primaryGold.withOpacity(0.8)],
        ),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Row(
        children: [
          Icon(Icons.star, color: Colors.white, size: 32),
          SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Upgrade to Member',
                  style: AppTextStyles.h3.copyWith(color: Colors.white),
                ),
                Text(
                  'Enjoy lower interest rates and exclusive benefits!',
                  style: AppTextStyles.bodySmall.copyWith(color: Colors.white),
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () {
              // Navigate to the upgrade screen or subscription screen
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => UpgradeScreen()), // Assuming UpgradeScreen exists
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: AppColors.primaryGold,
            ),
            child: Text('Upgrade'),
          ),
        ],
      ),
    );
  }

  // The rest of the DashboardScreen methods (_buildGreeting, _buildWalletCard, etc.) remain the same.
  // The _buildWalletCard method will now correctly use the _showBalance state managed by this StatefulWidget.

  Widget _buildGreeting() {
    final hour = DateTime.now().hour;
    String greeting = 'Good Morning';
    if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    if (hour >= 17) greeting = 'Good Evening';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '$greeting, John! 👋',
          style: AppTextStyles.h2,
        ),
        SizedBox(height: AppSpacing.xs),
        Text(
          'Member ID: FRSC-2024-001',
          style: AppTextStyles.bodySmall.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildWalletCard() {
    return Container(
      padding: EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primaryGreen, AppColors.darkGreen],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryGreen.withOpacity(0.3),
            blurRadius: 10,
            offset: Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '💰 Wallet Balance',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: Colors.white70,
                ),
              ),
              IconButton(
                icon: Icon(
                  _showBalance ? Icons.visibility : Icons.visibility_off,
                  color: Colors.white,
                ),
                onPressed: () {
                  setState(() => _showBalance = !_showBalance); // Use setState to update
                },
              ),
            ],
          ),
          SizedBox(height: AppSpacing.sm),
          Text(
            _showBalance ? '₦ 250,000.00' : '₦ ••••••', // Use _showBalance state
            style: AppTextStyles.h1.copyWith(
              color: AppColors.primaryGold,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: AppSpacing.md),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => AddFundsScreen()),
              );
            },
            icon: Icon(Icons.add),
            label: Text('Add Funds'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGold,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      QuickAction(
        icon: Icons.payment,
        label: 'Pay',
        color: AppColors.accentBlue,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => ContributionsScreen()),
        ),
      ),
      QuickAction(
        icon: Icons.account_balance,
        label: 'Loan',
        color: AppColors.accentOrange,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => LoansScreen()),
        ),
      ),
      QuickAction(
        icon: Icons.home,
        label: 'Buy',
        color: AppColors.primaryGreen,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => PropertiesScreen()),
        ),
      ),
      QuickAction(
        icon: Icons.bar_chart,
        label: 'Report',
        color: AppColors.primaryGold,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => ReportsScreen()),
        ),
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Quick Actions', style: AppTextStyles.h3),
        SizedBox(height: AppSpacing.md),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: actions.map((action) {
            return _buildQuickActionButton(action);
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildQuickActionButton(QuickAction action) {
    return InkWell(
      onTap: action.onTap,
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: action.color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: Icon(
              action.icon,
              color: action.color,
              size: 30,
            ),
          ),
          SizedBox(height: AppSpacing.xs),
          Text(
            action.label,
            style: AppTextStyles.bodySmall,
          ),
        ],
      ),
    );
  }

  Widget _buildOverviewSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Overview', style: AppTextStyles.h3),
        SizedBox(height: AppSpacing.md),
        _buildOverviewCard(
          icon: Icons.trending_up,
          title: 'Contributions',
          amount: '₦ 1,500,000',
          color: AppColors.success,
        ),
        SizedBox(height: AppSpacing.sm),
        _buildOverviewCard(
          icon: Icons.business_center,
          title: 'Investments',
          amount: '₦ 3,200,000',
          color: AppColors.accentBlue,
        ),
        SizedBox(height: AppSpacing.sm),
        _buildOverviewCard(
          icon: Icons.account_balance,
          title: 'Active Loans',
          amount: '₦ 500,000',
          color: AppColors.warning,
        ),
        SizedBox(height: AppSpacing.sm),
        _buildOverviewCard(
          icon: Icons.home_work,
          title: 'Properties',
          amount: '2 Properties',
          color: AppColors.primaryGreen,
        ),
      ],
    );
  }

  Widget _buildOverviewCard({
    required IconData icon,
    required String title,
    required String amount,
    required Color color,
  }) {
    return Container(
      padding: EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            child: Icon(icon, color: color),
          ),
          SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTextStyles.bodyMedium),
                Text(
                  amount,
                  style: AppTextStyles.h3.copyWith(color: color),
                ),
              ],
            ),
          ),
          Icon(Icons.chevron_right, color: AppColors.textSecondary),
        ],
      ),
    );
  }

  Widget _buildRecentTransactions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Recent Transactions', style: AppTextStyles.h3),
            TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => TransactionHistoryScreen()),
                );
              },
              child: Text('View All'),
            ),
          ],
        ),
        SizedBox(height: AppSpacing.md),
        _buildTransactionItem(
          icon: Icons.payment,
          title: 'Contribution',
          amount: '₦ 50,000',
          date: 'Today',
          isCredit: false,
        ),
        _buildTransactionItem(
          icon: Icons.account_balance,
          title: 'Loan Repayment',
          amount: '₦ 25,000',
          date: 'Yesterday',
          isCredit: false,
        ),
        _buildTransactionItem(
          icon: Icons.add_circle,
          title: 'Wallet Top-up',
          amount: '₦ 100,000',
          date: '2 days ago',
          isCredit: true,
        ),
      ],
    );
  }

  Widget _buildTransactionItem({
    required IconData icon,
    required String title,
    required String amount,
    required String date,
    required bool isCredit,
  }) {
    return Container(
      margin: EdgeInsets.only(bottom: AppSpacing.sm),
      padding: EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: isCredit
                  ? AppColors.success.withOpacity(0.1)
                  : AppColors.error.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            child: Icon(
              icon,
              color: isCredit ? AppColors.success : AppColors.error,
            ),
          ),
          SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTextStyles.bodyMedium),
                Text(
                  date,
                  style: AppTextStyles.caption,
                ),
              ],
            ),
          ),
          Text(
            '${isCredit ? '+' : '-'} $amount',
            style: AppTextStyles.bodyMedium.copyWith(
              color: isCredit ? AppColors.success : AppColors.error,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNav() {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      selectedItemColor: AppColors.primaryGold,
      unselectedItemColor: AppColors.textSecondary,
      currentIndex: 0,
      items: [
        BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Home',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.account_balance_wallet),
          label: 'Wallet',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.bar_chart),
          label: 'Reports',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.mail),
          label: 'Mail',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person),
          label: 'Profile',
        ),
      ],
      onTap: (index) {
        // Handle navigation
      },
    );
  }

  Widget _buildDrawer() {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.primaryGreen, AppColors.darkGreen],
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: AppColors.primaryGold,
                  child: Text(
                    'JD',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
                SizedBox(height: AppSpacing.sm),
                Text(
                  'John Doe',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'FRSC-2024-001',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          _buildDrawerItem(Icons.dashboard, 'Dashboard', () {
            Navigator.pushReplacementNamed(context, '/dashboard');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.payment, 'Contributions', () {
            Navigator.pushReplacementNamed(context, '/contributions');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.account_balance, 'Loans', () {
            Navigator.pushReplacementNamed(context, '/loans');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.business_center, 'Investments', () {
            Navigator.pushReplacementNamed(context, '/investments');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.home_work, 'Properties', () {
            Navigator.pushReplacementNamed(context, '/properties');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.account_balance_wallet, 'Wallet', () {
            Navigator.pushReplacementNamed(context, '/wallet');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.mail, 'Mail Service', () {
            Navigator.pushReplacementNamed(context, '/mail');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.bar_chart, 'Reports', () {
            Navigator.pushReplacementNamed(context, '/reports');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.receipt, 'Statutory Charges', () {
            Navigator.pushReplacementNamed(context, '/statutory_charges');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.apartment, 'Property Management', () {
            Navigator.pushReplacementNamed(context, '/property_management');
            Navigator.pop(context);
          }),
          Divider(),
          _buildDrawerItem(Icons.settings, 'Settings', () {
            Navigator.pushReplacementNamed(context, '/settings');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.help, 'Help & Support', () {
            Navigator.pushReplacementNamed(context, '/help');
            Navigator.pop(context);
          }),
          _buildDrawerItem(Icons.logout, 'Logout', () {
            // Implement logout logic
            Navigator.pushReplacementNamed(context, '/login');
            Navigator.pop(context);
          }),
        ],
      ),
    );
  }

  Widget _buildDrawerItem(IconData icon, String title, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primaryGreen),
      title: Text(title),
      onTap: onTap,
    );
  }

  Future<void> _refreshData() async {
    // Implement data refresh
    await Future.delayed(Duration(seconds: 2));
  }
}

// Dummy class for UpgradeScreen
class UpgradeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Upgrade Membership'),
        backgroundColor: AppColors.primaryGreen,
      ),
      body: Center(child: Text('Upgrade Screen Placeholder')),
    );
  }
}
\`\`\`

---

## 3. Contributions Module

*(Content for this module would follow the same detailed pattern as Authentication and Dashboard, including screen inventory, design mockups, and implementation code for each of the 6 screens.)*

---

## 4. Loans Module

### 4.1 Loans Overview
*(Screen inventory, design, and implementation for browsing available loan plans)*

### 4.2 Loan Plans (Browse)
*(Screen inventory, design, and implementation for detailed view of each loan plan)*

### 4.3 Loan Plan Details
*(Screen inventory, design, and implementation for details of a specific loan plan)*

### 4.4 Apply for Loan - SIMPLIFIED

**Design:**
\`\`\`
┌─────────────────────────────┐
│  ← Apply for Loan           │
├─────────────────────────────┤
│                             │
│  Personal Loan              │
│  Interest: 5% (Member)      │
│  Max Tenure: 25 months      │
│                             │
│  ┌─────────────────────┐   │
│  │ Loan Amount         │   │
│  │ ₦ [________]        │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │ Last Net Pay        │   │
│  │ ₦ [________]        │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │ Monthly Repayment   │   │
│  │ ₦ 125,000           │   │
│  │ (Auto-calculated)   │   │
│  └─────────────────────┘   │
│                             │
│  Loan Details:              │
│  • Total Interest: ₦50,000  │
│  • Total Repayment: ₦1.55M  │
│  • Tenure: 25 months        │
│                             │
│  ┌─────────────────────┐   │
│  │   Submit Application│   │
│  └─────────────────────┘   │
│                             │
└─────────────────────────────┘
\`\`\`

**Implementation:**
\`\`\`dart
// Dummy LoanPlan class for demonstration
class LoanPlan {
  final String id;
  final String name;
  final double interestRate;
  final int maxTenure;

  LoanPlan({
    required this.id,
    required this.name,
    required this.interestRate,
    required this.maxTenure,
  });
}

class LoanApplicationScreen extends StatefulWidget {
  final LoanPlan loanPlan;
  
  LoanApplicationScreen({required this.loanPlan});
  
  @override
  _LoanApplicationScreenState createState() => _LoanApplicationScreenState();
}

class _LoanApplicationScreenState extends State<LoanApplicationScreen> {
  final _amountController = TextEditingController();
  final _netPayController = TextEditingController();
  double _monthlyRepayment = 0;
  double _totalInterest = 0;
  double _totalRepayment = 0;
  bool _isSubmitting = false;

  void _calculateRepayment() {
    final amount = double.tryParse(_amountController.text) ?? 0;
    final netPay = double.tryParse(_netPayController.text) ?? 0;
    
    if (amount > 0 && netPay > 0) {
      final interestRate = widget.loanPlan.interestRate / 100;
      final tenure = widget.loanPlan.maxTenure;
      
      _totalInterest = amount * interestRate;
      _totalRepayment = amount + _totalInterest;
      _monthlyRepayment = _totalRepayment / tenure;
      
      // Check if monthly repayment exceeds loan-to-net-pay percentage
      final maxRepaymentPercentage = 0.40; // 40% of net pay
      final maxRepayment = netPay * maxRepaymentPercentage;
      
      setState(() {}); // Update UI to show calculated values
      
      if (_monthlyRepayment > maxRepayment) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Monthly repayment (₦ ${_monthlyRepayment.toStringAsFixed(2)}) exceeds 40% of your net pay (₦ ${netPay.toStringAsFixed(2)}).'),
            backgroundColor: AppColors.warning,
          ),
        );
      }
    } else {
      setState(() {
        _monthlyRepayment = 0;
        _totalInterest = 0;
        _totalRepayment = 0;
      });
    }
  }

  Future<void> _submitApplication() async {
    if (_isSubmitting) return;

    if (_amountController.text.isEmpty || _netPayController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enter loan amount and net pay.')),
      );
      return;
    }

    final loanAmount = double.parse(_amountController.text);
    if (loanAmount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Loan amount must be greater than zero.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      // Simulate API call to submit loan application
      await Future.delayed(Duration(seconds: 2)); 
      
      // You would typically use a service like LoanService.applyForLoan() here
      // await LoanService.applyForLoan(
      //   loanPlanId: widget.loanPlan.id,
      //   amount: loanAmount,
      //   netPay: double.parse(_netPayController.text),
      // );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Loan application submitted successfully!')),
      );
      
      // Navigate back or to a success screen
      Navigator.pop(context); 
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to submit application. Please try again.')),
      );
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Apply for Loan'),
        backgroundColor: AppColors.primaryGreen,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Loan Plan Info
            Container(
              padding: EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.primaryGreen.withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.loanPlan.name, style: AppTextStyles.h3),
                  SizedBox(height: AppSpacing.xs),
                  Text('Interest: ${widget.loanPlan.interestRate}%'),
                  Text('Max Tenure: ${widget.loanPlan.maxTenure} months'),
                ],
              ),
            ),
            SizedBox(height: AppSpacing.lg),
            
            TextFormField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Loan Amount',
                prefixText: '₦ ',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
              ),
              onChanged: (_) => _calculateRepayment(),
              validator: (value) {
                if (value == null || value.isEmpty) return 'Enter loan amount';
                if (double.tryParse(value) == null || double.parse(value) <= 0) return 'Invalid amount';
                return null;
              },
            ),
            SizedBox(height: AppSpacing.md),
            
            TextFormField(
              controller: _netPayController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Last Net Pay',
                prefixText: '₦ ',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
              ),
              onChanged: (_) => _calculateRepayment(),
              validator: (value) {
                if (value == null || value.isEmpty) return 'Enter net pay';
                if (double.tryParse(value) == null || double.parse(value) <= 0) return 'Invalid amount';
                return null;
              },
            ),
            SizedBox(height: AppSpacing.lg),
            
            Container(
              padding: EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.accentBlue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppRadius.md),
                border: Border.all(color: AppColors.accentBlue),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Calculated Monthly Repayment', style: AppTextStyles.caption),
                  SizedBox(height: AppSpacing.xs),
                  Text(
                    '₦ ${_monthlyRepayment.toStringAsFixed(2)}',
                    style: AppTextStyles.h2.copyWith(color: AppColors.accentBlue),
                  ),
                ],
              ),
            ),
            SizedBox(height: AppSpacing.md),
            
            // Loan Details Summary
            Container(
              padding: EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Loan Details:', style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.bold,
                  )),
                  SizedBox(height: AppSpacing.sm),
                  _buildDetailRow('Total Interest', '₦ ${_totalInterest.toStringAsFixed(2)}'),
                  _buildDetailRow('Total Repayment', '₦ ${_totalRepayment.toStringAsFixed(2)}'),
                  _buildDetailRow('Tenure', '${widget.loanPlan.maxTenure} months'),
                ],
              ),
            ),
            SizedBox(height: AppSpacing.xl),
            
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submitApplication,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGold,
                padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
              ),
              child: _isSubmitting
                  ? CircularProgressIndicator(color: Colors.white)
                  : Text('Submit Application', style: AppTextStyles.button.copyWith(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: AppSpacing.xs),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('• $label', style: AppTextStyles.bodySmall),
          Text(value, style: AppTextStyles.bodySmall.copyWith(
            fontWeight: FontWeight.bold,
          )),
        ],
      ),
    );
  }
}

// Dummy LoanService for demonstration
class LoanService {
  static Future<void> applyForLoan({required String loanPlanId, required double amount, required double netPay}) async {
    // Simulate API call
  }
}
\`\`\`

### 4.5 My Loans - WITH TERMINATE LOAN

**Design:**
\`\`\`
┌─────────────────────────────┐
│  ← My Loans                 │
├─────────────────────────────┤
│                             │
│  Active Loans (1)           │
│                             │
│  ┌─────────────────────┐   │
│  │ Personal Loan       │   │
│  │ ₦ 500,000           │   │
│  │                     │   │
│  │ Paid: ₦ 200,000     │   │
│  │ Balance: ₦ 300,000  │   │
│  │                     │   │
│  │ Next Payment:       │   │
│  │ Feb 20, 2024        │   │
│  │                     │   │
│  │ [Make Payment]      │   │
│  │ [Terminate Loan]    │   │
│  └─────────────────────┘   │
│                             │
└─────────────────────────────┘
\`\`\`

**Implementation:**
\`\`\`dart
// Dummy Loan class for demonstration
class Loan {
  final String id;
  final String planName;
  final double totalRepayment;
  final double amountPaid;
  final DateTime nextPaymentDate;
  final double monthlyRepayment;
  final double interestRate; // Add interest rate to Loan class

  Loan({
    required this.id,
    required this.planName,
    required this.totalRepayment,
    required this.amountPaid,
    required this.nextPaymentDate,
    required this.monthlyRepayment,
    required this.interestRate,
  });

  double get balance => totalRepayment - amountPaid;
  
  // Dummy method to calculate months remaining to maturity
  int calculateMonthsRemaining() {
    final now = DateTime.now();
    // This is a simplified calculation. A real implementation would consider payment history.
    int monthsDifference = 0;
    DateTime tempDate = nextPaymentDate;
    while(tempDate.isAfter(now) && monthsDifference < 36) { // Limit to avoid infinite loop
      monthsDifference++;
      tempDate = DateTime(tempDate.year, tempDate.month + 1, tempDate.day);
    }
    return monthsDifference;
  }
}

// Dummy LoanService for demonstration
class LoanService {
  static Future<List<Loan>> getLoans() async {
    // Simulate API call
    await Future.delayed(Duration(seconds: 1));
    return [
      Loan(
        id: 'L1',
        planName: 'Personal Loan',
        totalRepayment: 1500000.00, // 1.5M
        amountPaid: 200000.00,
        nextPaymentDate: DateTime(2024, 3, 20), // Example date
        monthlyRepayment: 125000.00, // Example calculation
        interestRate: 5.0, // Example interest rate
      ),
      // Add more dummy loans if needed
    ];
  }
  
  static Future<void> terminateLoan(String loanId, double terminationAmount) async {
    // Simulate API call to terminate loan
    await Future.delayed(Duration(seconds: 2));
    print('Loan $loanId terminated with amount $terminationAmount');
  }

  static Future<void> makePayment(String loanId, double amount) async {
    // Simulate API call for payment
    await Future.delayed(Duration(seconds: 1));
    print('Payment of $amount made for loan $loanId');
  }
}

// This would be a screen widget, e.g., MyLoansScreen
class MyLoansScreen extends StatefulWidget {
  @override
  _MyLoansScreenState createState() => _MyLoansScreenState();
}

class _MyLoansScreenState extends State<MyLoansScreen> {
  List<Loan> _loans = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchLoans();
  }

  Future<void> _fetchLoans() async {
    setState(() => _isLoading = true);
    try {
      _loans = await LoanService.getLoans();
    } catch (e) {
      // Handle error
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error fetching loans: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _refreshLoans() async {
    await _fetchLoans();
  }

  Widget _buildLoanCard(Loan loan) {
    final monthsRemaining = loan.calculateMonthsRemaining();
    final canTerminate = monthsRemaining >= 2;
    
    return Container(
      margin: EdgeInsets.only(bottom: AppSpacing.md),
      padding: EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(loan.planName, style: AppTextStyles.h3),
          Text('₦ ${loan.amountPaid.toStringAsFixed(2)} / ₦ ${loan.totalRepayment.toStringAsFixed(2)}', style: AppTextStyles.h3), // Display total amount and amount paid
          SizedBox(height: AppSpacing.md),
          _buildProgressBar(loan.amountPaid / loan.totalRepayment),
          SizedBox(height: AppSpacing.sm),
          Text('Paid: ₦ ${loan.amountPaid.toStringAsFixed(2)}'),
          Text('Balance: ₦ ${loan.balance.toStringAsFixed(2)}'),
          SizedBox(height: AppSpacing.md),
          Text('Next Payment: ${DateFormat('MMM dd, yyyy').format(loan.nextPaymentDate)}'),
          SizedBox(height: AppSpacing.md),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () => _makePayment(loan),
                  child: Text('Make Payment'),
                ),
              ),
              if (canTerminate) ...[
                SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _showTerminateLoanDialog(loan),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                    ),
                    child: Text('Terminate Loan'),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProgressBar(double progress) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.full),
      child: LinearProgressIndicator(
        value: progress,
        minHeight: 8,
        backgroundColor: AppColors.divider,
        valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryGold),
      ),
    );
  }

  Future<void> _makePayment(Loan loan) async {
    // Implement navigation to payment screen or dialog
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Navigating to payment for ${loan.planName}')),
    );
    // Example: Navigator.push(context, MaterialPageRoute(builder: (_) => PaymentScreen(loanId: loan.id)));
    await LoanService.makePayment(loan.id, loan.balance); // Simulate immediate payment
    await _refreshLoans();
  }

  void _showTerminateLoanDialog(Loan loan) {
    final oneMonthInterest = loan.monthlyRepayment * (loan.interestRate / 100);
    final terminationAmount = loan.balance + oneMonthInterest;
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Terminate Loan'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('You can terminate this loan at least 2 months before maturity.'),
            SizedBox(height: AppSpacing.md),
            Text('Termination Details:', style: TextStyle(fontWeight: FontWeight.bold)),
            SizedBox(height: AppSpacing.sm),
            Text('Current Balance: ₦ ${loan.balance.toStringAsFixed(2)}'),
            Text('Estimated 1 Month Interest Charge: ₦ ${oneMonthInterest.toStringAsFixed(2)}'),
            Divider(),
            Text(
              'Total Estimated to Pay: ₦ ${terminationAmount.toStringAsFixed(2)}',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            SizedBox(height: AppSpacing.sm),
            Text(
              'Remaining interest will be waived.',
              style: TextStyle(color: AppColors.success, fontSize: 12),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await _terminateLoan(loan, terminationAmount);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
            ),
            child: Text('Terminate'),
          ),
        ],
      ),
    );
  }

  Future<void> _terminateLoan(Loan loan, double amount) async {
    try {
      await LoanService.terminateLoan(loan.id, amount);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Loan terminated successfully')),
      );
      await _refreshLoans(); // Refresh the list after termination
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to terminate loan. Please try again.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('My Loans'),
        backgroundColor: AppColors.primaryGreen,
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _loans.isEmpty
              ? Center(child: Text('No active loans found.'))
              : RefreshIndicator(
                  onRefresh: _refreshLoans,
                  child: ListView.builder(
                    padding: EdgeInsets.all(AppSpacing.md),
                    itemCount: _loans.length,
                    itemBuilder: (context, index) {
                      return _buildLoanCard(_loans[index]);
                    },
                  ),
                ),
    );
  }
}
\`\`\`

### 4.6 Loan Details
*(Screen inventory, design, and implementation for viewing detailed loan information, repayment schedule, etc.)*

### 4.7 Make Repayment
*(Screen inventory, design, and implementation for making loan payments)*

### 4.8 Loan Calculator
*(Screen inventory, design, and implementation for a standalone loan calculator tool)*

---

## 5. Investments Module

*(Content for this module would follow the same detailed pattern as previous modules, including screen inventory, design mockups, and implementation code for each of the 9 screens.)*

---

## 6. Properties Module

*(Content for this module would follow the same detailed pattern as previous modules, including screen inventory, design mockups, and implementation code for each of the 7 screens.)*

---

## 7. Wallet Module

*(Content for this module would follow the same detailed pattern as previous modules, including screen inventory, design mockups, and implementation code for each of the 5 screens.)*

---

## 8. Mail Service Module

*(Content for this module would follow the same detailed pattern as previous modules, including screen inventory, design mockups, and implementation code for each of the 6 screens.)*

---

## 9. Reports Module

*(Content for this module would follow the same detailed pattern as previous modules, including screen inventory, design mockups, and implementation code for each of the 6 screens.)*

---

## 10. Statutory Charges Module

*(Content for this module would follow the same detailed pattern as previous modules, including screen inventory, design mockups, and implementation code for each of the 3 screens.)*

---

## 11. Property Management Module

*(Content for this module would follow the same detailed pattern as previous modules, including screen inventory, design mockups, and implementation code for each of the 4 screens.)*

---

## 12. Profile & Settings Module

*(Content for this module would follow the same detailed pattern as previous modules, including screen inventory, design mockups, and implementation code for each of the 5 screens.)*

---

## 13. Advanced Features

*(This section would elaborate on the implementation details of the advanced features listed in the Summary, such as offline mode, push notifications, etc.)*
5 screens.)*

---

## 13. Advanced Features

*(This section would elaborate on the implementation details of the advanced features listed in the Summary, such as offline mode, push notifications, etc.)*
 features listed in the Summary, such as offline mode, push notifications, etc.)*
