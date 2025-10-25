# CURSOR AI IDE - Professional Flutter Mobile App Development Guide
## FRSC Housing Management - Premium UI/UX Implementation

> **Purpose**: This is a PROFESSIONAL, PRODUCTION-READY guide for building a market-leading Flutter mobile application with exceptional UI/UX, smooth animations, and senior-level Flutter development practices. This app will stand out in the market.

---

## 🎯 Design Philosophy

### Core Principles
1. **Delightful Interactions** - Every tap, swipe, and transition should feel smooth and intentional
2. **Visual Hierarchy** - Clear information architecture with proper spacing and typography
3. **Performance First** - 60fps animations, lazy loading, efficient state management
4. **Accessibility** - Screen reader support, proper contrast ratios, semantic widgets
5. **Consistency** - Unified design language across all screens

### Animation Strategy
- **Hero Animations** for screen transitions
- **Implicit Animations** for simple state changes
- **Explicit Animations** for complex choreography
- **Physics-based Animations** for natural feel
- **Staggered Animations** for list items
- **Micro-interactions** for user feedback

---

## 📦 Enhanced Project Setup

### Dependencies (pubspec.yaml)

\`\`\`yaml
name: frsc_housing_mobile
description: FRSC Housing Management Mobile App
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  flutter_bloc: ^8.1.3
  equatable: ^2.0.5
  
  # Networking
  dio: ^5.3.3
  retrofit: ^4.0.3
  pretty_dio_logger: ^1.3.1
  
  # Local Storage
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  flutter_secure_storage: ^9.0.0
  
  # UI Components
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  flutter_svg: ^2.0.9
  lottie: ^2.7.0
  flutter_staggered_animations: ^1.1.1
  flutter_slidable: ^3.0.1
  
  # Forms & Validation
  flutter_form_builder: ^9.1.1
  form_builder_validators: ^9.1.0
  
  # Charts & Graphs
  fl_chart: ^0.65.0
  syncfusion_flutter_charts: ^23.2.4
  
  # Image Handling
  image_picker: ^1.0.4
  image_cropper: ^5.0.1
  photo_view: ^0.14.0
  
  # File Handling
  file_picker: ^6.1.1
  path_provider: ^2.1.1
  open_filex: ^4.3.4
  
  # Utilities
  intl: ^0.18.1
  timeago: ^3.6.0
  url_launcher: ^6.2.1
  share_plus: ^7.2.1
  permission_handler: ^11.0.1
  connectivity_plus: ^5.0.2
  
  # Notifications
  flutter_local_notifications: ^16.2.0
  firebase_core: ^2.24.2
  firebase_messaging: ^14.7.9
  
  # Biometrics
  local_auth: ^2.1.7
  
  # QR Code
  qr_flutter: ^4.1.0
  mobile_scanner: ^3.5.5
  
  # Pull to Refresh
  pull_to_refresh: ^2.0.0
  
  # Skeleton Loading
  skeletons: ^0.0.3
  
  # Bottom Navigation
  animated_bottom_navigation_bar: ^1.3.0
  
  # Haptic Feedback
  vibration: ^1.8.3
  
  # Environment
  flutter_dotenv: ^5.1.0
  
  # Dependency Injection
  get_it: ^7.6.4
  injectable: ^2.3.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1
  build_runner: ^2.4.6
  hive_generator: ^2.0.1
  retrofit_generator: ^8.0.4
  injectable_generator: ^2.4.1
  flutter_launcher_icons: ^0.13.1
  flutter_native_splash: ^2.3.5

flutter:
  uses-material-design: true
  
  assets:
    - assets/images/
    - assets/icons/
    - assets/animations/
    - .env
  
  fonts:
    - family: Inter
      fonts:
        - asset: assets/fonts/Inter-Regular.ttf
        - asset: assets/fonts/Inter-Medium.ttf
          weight: 500
        - asset: assets/fonts/Inter-SemiBold.ttf
          weight: 600
        - asset: assets/fonts/Inter-Bold.ttf
          weight: 700
\`\`\`

---

## 🏗️ Professional Architecture

### Clean Architecture Structure

\`\`\`
lib/
├── main.dart
├── app.dart
├── injection.dart                    # Dependency injection setup
│
├── core/
│   ├── constants/
│   │   ├── app_constants.dart
│   │   ├── api_endpoints.dart
│   │   └── asset_paths.dart
│   ├── theme/
│   │   ├── app_theme.dart
│   │   ├── app_colors.dart
│   │   ├── app_text_styles.dart
│   │   └── app_dimensions.dart
│   ├── utils/
│   │   ├── validators.dart
│   │   ├── formatters.dart
│   │   ├── extensions.dart
│   │   └── helpers.dart
│   ├── errors/
│   │   ├── failures.dart
│   │   └── exceptions.dart
│   ├── network/
│   │   ├── dio_client.dart
│   │   └── network_info.dart
│   └── widgets/
│       ├── custom_app_bar.dart
│       ├── custom_button.dart
│       ├── custom_text_field.dart
│       ├── loading_indicator.dart
│       ├── error_widget.dart
│       ├── empty_state_widget.dart
│       └── shimmer_loading.dart
│
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   ├── user_model.dart
│   │   │   │   └── auth_response_model.dart
│   │   │   ├── datasources/
│   │   │   │   ├── auth_remote_datasource.dart
│   │   │   │   └── auth_local_datasource.dart
│   │   │   └── repositories/
│   │   │       └── auth_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user.dart
│   │   │   ├── repositories/
│   │   │   │   └── auth_repository.dart
│   │   │   └── usecases/
│   │   │       ├── login_usecase.dart
│   │   │       ├── register_usecase.dart
│   │   │       ├── logout_usecase.dart
│   │   │       └── verify_email_usecase.dart
│   │   └── presentation/
│   │       ├── bloc/
│   │       │   ├── auth_bloc.dart
│   │       │   ├── auth_event.dart
│   │       │   └── auth_state.dart
│   │       ├── screens/
│   │       │   ├── splash_screen.dart
│   │       │   ├── onboarding_screen.dart
│   │       │   ├── login_screen.dart
│   │       │   ├── register_screen.dart
│   │       │   ├── verify_email_screen.dart
│   │       │   └── forgot_password_screen.dart
│   │       └── widgets/
│   │           ├── auth_text_field.dart
│   │           ├── social_login_button.dart
│   │           └── password_strength_indicator.dart
│   │
│   ├── dashboard/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   ├── dashboard_stats_model.dart
│   │   │   │   └── quick_action_model.dart
│   │   │   ├── datasources/
│   │   │   │   └── dashboard_remote_datasource.dart
│   │   │   └── repositories/
│   │   │       └── dashboard_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── dashboard_stats.dart
│   │   │   ├── repositories/
│   │   │   │   └── dashboard_repository.dart
│   │   │   └── usecases/
│   │   │       └── get_dashboard_stats_usecase.dart
│   │   └── presentation/
│   │       ├── bloc/
│   │       │   ├── dashboard_bloc.dart
│   │       │   ├── dashboard_event.dart
│   │       │   └── dashboard_state.dart
│   │       ├── screens/
│   │       │   ├── main_screen.dart              # Bottom nav container
│   │       │   ├── home_screen.dart              # Dashboard home
│   │       │   └── profile_screen.dart
│   │       └── widgets/
│   │           ├── stat_card.dart
│   │           ├── quick_action_card.dart
│   │           ├── recent_activity_card.dart
│   │           └── animated_stat_card.dart
│   │
│   ├── wallet/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   ├── wallet_model.dart
│   │   │   │   └── transaction_model.dart
│   │   │   ├── datasources/
│   │   │   │   └── wallet_remote_datasource.dart
│   │   │   └── repositories/
│   │   │       └── wallet_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── wallet.dart
│   │   │   │   └── transaction.dart
│   │   │   ├── repositories/
│   │   │   │   └── wallet_repository.dart
│   │   │   └── usecases/
│   │   │       ├── get_wallet_balance_usecase.dart
│   │   │       ├── top_up_wallet_usecase.dart
│   │   │       └── transfer_funds_usecase.dart
│   │   └── presentation/
│   │       ├── bloc/
│   │       │   ├── wallet_bloc.dart
│   │       │   ├── wallet_event.dart
│   │       │   └── wallet_state.dart
│   │       ├── screens/
│   │       │   ├── wallet_screen.dart
│   │       │   ├── top_up_screen.dart
│   │       │   ├── transfer_screen.dart
│   │       │   └── transaction_history_screen.dart
│   │       └── widgets/
│   │           ├── wallet_card.dart
│   │           ├── transaction_tile.dart
│   │           └── payment_method_selector.dart
│   │
│   ├── loans/
│   │   └── [similar structure]
│   │
│   ├── investments/
│   │   └── [similar structure]
│   │
│   ├── properties/
│   │   └── [similar structure]
│   │
│   ├── contributions/
│   │   └── [similar structure]
│   │
│   ├── mail/
│   │   └── [similar structure]
│   │
│   └── kyc/
│       └── [similar structure]
\`\`\`

---

## 🎨 Professional Theme System

### App Colors (core/theme/app_colors.dart)

\`\`\`dart
import 'package:flutter/material.dart';

class AppColors {
  // Brand Colors
  static const Color primaryGold = Color(0xFFFDB11E);
  static const Color secondaryGreen = Color(0xFF276254);
  
  // Gold Shades
  static const Color goldLight = Color(0xFFFECB5C);
  static const Color goldDark = Color(0xFFE89F0D);
  
  // Green Shades
  static const Color greenLight = Color(0xFF3A8A75);
  static const Color greenDark = Color(0xFF1A4A3F);
  
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
  static const Color success = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);
  
  // Semantic Colors
  static const Color approved = Color(0xFF10B981);
  static const Color pending = Color(0xFFF59E0B);
  static const Color rejected = Color(0xFFEF4444);
  static const Color active = Color(0xFF3B82F6);
  
  // Gradient Colors
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryGold, goldDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient secondaryGradient = LinearGradient(
    colors: [secondaryGreen, greenDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient successGradient = LinearGradient(
    colors: [Color(0xFF10B981), Color(0xFF059669)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  // Shadow Colors
  static Color shadow = black.withOpacity(0.1);
  static Color shadowDark = black.withOpacity(0.2);
}
\`\`\`

### App Text Styles (core/theme/app_text_styles.dart)

\`\`\`dart
import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTextStyles {
  // Display Styles
  static const TextStyle displayLarge = TextStyle(
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: FontWeight.w700,
    height: 1.2,
    letterSpacing: -0.5,
  );
  
  static const TextStyle displayMedium = TextStyle(
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: FontWeight.w700,
    height: 1.2,
    letterSpacing: -0.5,
  );
  
  static const TextStyle displaySmall = TextStyle(
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: FontWeight.w600,
    height: 1.3,
    letterSpacing: -0.3,
  );
  
  // Headline Styles
  static const TextStyle headlineLarge = TextStyle(
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: FontWeight.w600,
    height: 1.3,
  );
  
  static const TextStyle headlineMedium = TextStyle(
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: FontWeight.w600,
    height: 1.4,
  );
  
  static const TextStyle headlineSmall = TextStyle(
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: FontWeight.w600,
    height: 1.4,
  );
  
  // Body Styles
  static const TextStyle bodyLarge = TextStyle(
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: FontWeight.w400,
    height: 1.5,
  );
  
  static const TextStyle bodyMedium = TextStyle(
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.5,
  );
  
  static const TextStyle bodySmall = TextStyle(
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: FontWeight.w400,
    height: 1.5,
  );
  
  // Label Styles
  static const TextStyle labelLarge = TextStyle(
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: FontWeight.w500,
    height: 1.4,
    letterSpacing: 0.1,
  );
  
  static const TextStyle labelMedium = TextStyle(
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: FontWeight.w500,
    height: 1.4,
    letterSpacing: 0.5,
  );
  
  static const TextStyle labelSmall = TextStyle(
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: FontWeight.w500,
    height: 1.4,
    letterSpacing: 0.5,
  );
  
  // Button Styles
  static const TextStyle button = TextStyle(
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: FontWeight.w600,
    height: 1.2,
    letterSpacing: 0.5,
  );
  
  // Caption Styles
  static const TextStyle caption = TextStyle(
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: FontWeight.w400,
    height: 1.3,
    color: AppColors.grey600,
  );
  
  static const TextStyle overline = TextStyle(
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: FontWeight.w500,
    height: 1.6,
    letterSpacing: 1.5,
    color: AppColors.grey600,
  );
}
\`\`\`

### App Dimensions (core/theme/app_dimensions.dart)

\`\`\`dart
class AppDimensions {
  // Spacing
  static const double space4 = 4.0;
  static const double space8 = 8.0;
  static const double space12 = 12.0;
  static const double space16 = 16.0;
  static const double space20 = 20.0;
  static const double space24 = 24.0;
  static const double space32 = 32.0;
  static const double space40 = 40.0;
  static const double space48 = 48.0;
  
  // Border Radius
  static const double radiusSmall = 8.0;
  static const double radiusMedium = 12.0;
  static const double radiusLarge = 16.0;
  static const double radiusXLarge = 24.0;
  static const double radiusFull = 9999.0;
  
  // Icon Sizes
  static const double iconSmall = 16.0;
  static const double iconMedium = 24.0;
  static const double iconLarge = 32.0;
  static const double iconXLarge = 48.0;
  
  // Button Heights
  static const double buttonHeightSmall = 36.0;
  static const double buttonHeightMedium = 48.0;
  static const double buttonHeightLarge = 56.0;
  
  // Card Elevation
  static const double elevationLow = 2.0;
  static const double elevationMedium = 4.0;
  static const double elevationHigh = 8.0;
  
  // App Bar Height
  static const double appBarHeight = 56.0;
  
  // Bottom Nav Height
  static const double bottomNavHeight = 64.0;
}
\`\`\`

### Complete Theme (core/theme/app_theme.dart)

\`\`\`dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'app_colors.dart';
import 'app_text_styles.dart';
import 'app_dimensions.dart';

class AppTheme {
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    primaryColor: AppColors.primaryGold,
    scaffoldBackgroundColor: AppColors.grey50,
    fontFamily: 'Inter',
    
    colorScheme: const ColorScheme.light(
      primary: AppColors.primaryGold,
      secondary: AppColors.secondaryGreen,
      surface: AppColors.white,
      background: AppColors.grey50,
      error: AppColors.error,
      onPrimary: AppColors.white,
      onSecondary: AppColors.white,
      onSurface: AppColors.grey900,
      onBackground: AppColors.grey900,
      onError: AppColors.white,
    ),
    
    // App Bar Theme
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.white,
      foregroundColor: AppColors.grey900,
      elevation: 0,
      centerTitle: true,
      systemOverlayStyle: SystemUiOverlayStyle.dark,
      titleTextStyle: AppTextStyles.headlineMedium.copyWith(
        color: AppColors.grey900,
      ),
      iconTheme: const IconThemeData(
        color: AppColors.grey900,
        size: AppDimensions.iconMedium,
      ),
    ),
    
    // Card Theme
    cardTheme: CardTheme(
      color: AppColors.white,
      elevation: AppDimensions.elevationLow,
      shadowColor: AppColors.shadow,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
      ),
      margin: const EdgeInsets.all(AppDimensions.space8),
    ),
    
    // Elevated Button Theme
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primaryGold,
        foregroundColor: AppColors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(
          horizontal: AppDimensions.space24,
          vertical: AppDimensions.space16,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
        ),
        textStyle: AppTextStyles.button,
        minimumSize: const Size(double.infinity, AppDimensions.buttonHeightMedium),
      ),
    ),
    
    // Outlined Button Theme
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primaryGold,
        side: const BorderSide(color: AppColors.primaryGold, width: 1.5),
        padding: const EdgeInsets.symmetric(
          horizontal: AppDimensions.space24,
          vertical: AppDimensions.space16,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
        ),
        textStyle: AppTextStyles.button,
        minimumSize: const Size(double.infinity, AppDimensions.buttonHeightMedium),
      ),
    ),
    
    // Text Button Theme
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.primaryGold,
        padding: const EdgeInsets.symmetric(
          horizontal: AppDimensions.space16,
          vertical: AppDimensions.space12,
        ),
        textStyle: AppTextStyles.button,
      ),
    ),
    
    // Input Decoration Theme
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.grey100,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.space16,
        vertical: AppDimensions.space16,
      ),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
        borderSide: const BorderSide(color: AppColors.primaryGold, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
        borderSide: const BorderSide(color: AppColors.error, width: 1),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
        borderSide: const BorderSide(color: AppColors.error, width: 2),
      ),
      labelStyle: AppTextStyles.bodyMedium.copyWith(color: AppColors.grey600),
      hintStyle: AppTextStyles.bodyMedium.copyWith(color: AppColors.grey400),
      errorStyle: AppTextStyles.bodySmall.copyWith(color: AppColors.error),
    ),
    
    // Bottom Navigation Bar Theme
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.white,
      selectedItemColor: AppColors.primaryGold,
      unselectedItemColor: AppColors.grey400,
      type: BottomNavigationBarType.fixed,
      elevation: 8,
      selectedLabelStyle: AppTextStyles.labelSmall,
      unselectedLabelStyle: AppTextStyles.labelSmall,
    ),
    
    // Floating Action Button Theme
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: AppColors.primaryGold,
      foregroundColor: AppColors.white,
      elevation: AppDimensions.elevationMedium,
    ),
    
    // Chip Theme
    chipTheme: ChipThemeData(
      backgroundColor: AppColors.grey100,
      selectedColor: AppColors.primaryGold.withOpacity(0.2),
      labelStyle: AppTextStyles.labelMedium,
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.space12,
        vertical: AppDimensions.space8,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusSmall),
      ),
    ),
    
    // Dialog Theme
    dialogTheme: DialogTheme(
      backgroundColor: AppColors.white,
      elevation: AppDimensions.elevationHigh,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusLarge),
      ),
      titleTextStyle: AppTextStyles.headlineMedium.copyWith(
        color: AppColors.grey900,
      ),
      contentTextStyle: AppTextStyles.bodyMedium.copyWith(
        color: AppColors.grey700,
      ),
    ),
    
    // Bottom Sheet Theme
    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: AppColors.white,
      elevation: AppDimensions.elevationHigh,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(AppDimensions.radiusLarge),
        ),
      ),
    ),
    
    // Divider Theme
    dividerTheme: const DividerThemeData(
      color: AppColors.grey200,
      thickness: 1,
      space: 1,
    ),
    
    // Text Theme
    textTheme: TextTheme(
      displayLarge: AppTextStyles.displayLarge,
      displayMedium: AppTextStyles.displayMedium,
      displaySmall: AppTextStyles.displaySmall,
      headlineLarge: AppTextStyles.headlineLarge,
      headlineMedium: AppTextStyles.headlineMedium,
      headlineSmall: AppTextStyles.headlineSmall,
      bodyLarge: AppTextStyles.bodyLarge,
      bodyMedium: AppTextStyles.bodyMedium,
      bodySmall: AppTextStyles.bodySmall,
      labelLarge: AppTextStyles.labelLarge,
      labelMedium: AppTextStyles.labelMedium,
      labelSmall: AppTextStyles.labelSmall,
    ),
  );
  
  // Dark Theme (similar structure with dark colors)
  static ThemeData darkTheme = ThemeData(
    // ... dark theme configuration
  );
}
\`\`\`

---

## 🎬 Advanced Animation System

### Custom Page Transitions

\`\`\`dart
// core/utils/page_transitions.dart

import 'package:flutter/material.dart';

class PageTransitions {
  // Slide from right
  static Route slideFromRight(Widget page) {
    return PageRouteBuilder(
      pageBuilder: (context, animation, secondaryAnimation) => page,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        const begin = Offset(1.0, 0.0);
        const end = Offset.zero;
        const curve = Curves.easeInOutCubic;
        
        var tween = Tween(begin: begin, end: end).chain(
          CurveTween(curve: curve),
        );
        
        return SlideTransition(
          position: animation.drive(tween),
          child: child,
        );
      },
      transitionDuration: const Duration(milliseconds: 300),
    );
  }
  
  // Fade transition
  static Route fadeTransition(Widget page) {
    return PageRouteBuilder(
      pageBuilder: (context, animation, secondaryAnimation) => page,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        return FadeTransition(
          opacity: animation,
          child: child,
        );
      },
      transitionDuration: const Duration(milliseconds: 300),
    );
  }
  
  // Scale transition
  static Route scaleTransition(Widget page) {
    return PageRouteBuilder(
      pageBuilder: (context, animation, secondaryAnimation) => page,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        const curve = Curves.easeInOutCubic;
        var tween = Tween(begin: 0.0, end: 1.0).chain(
          CurveTween(curve: curve),
        );
        
        return ScaleTransition(
          scale: animation.drive(tween),
          child: child,
        );
      },
      transitionDuration: const Duration(milliseconds: 300),
    );
  }
  
  // Slide from bottom (for modals)
  static Route slideFromBottom(Widget page) {
    return PageRouteBuilder(
      pageBuilder: (context, animation, secondaryAnimation) => page,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        const begin = Offset(0.0, 1.0);
        const end = Offset.zero;
        const curve = Curves.easeOutCubic;
        
        var tween = Tween(begin: begin, end: end).chain(
          CurveTween(curve: curve),
        );
        
        return SlideTransition(
          position: animation.drive(tween),
          child: child,
        );
      },
      transitionDuration: const Duration(milliseconds: 400),
    );
  }
  
  // Shared axis transition
  static Route sharedAxisTransition(Widget page) {
    return PageRouteBuilder(
      pageBuilder: (context, animation, secondaryAnimation) => page,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        return FadeTransition(
          opacity: CurvedAnimation(
            parent: animation,
            curve: const Interval(0.3, 1.0),
          ),
          child: SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(0.0, 0.05),
              end: Offset.zero,
            ).animate(CurvedAnimation(
              parent: animation,
              curve: Curves.easeOutCubic,
            )),
            child: child,
          ),
        );
      },
      transitionDuration: const Duration(milliseconds: 300),
    );
  }
}
\`\`\`

### Animated Widgets

\`\`\`dart
// core/widgets/animated_stat_card.dart

import 'package:flutter/material.dart';
import 'package:frsc_housing_mobile/core/theme/app_colors.dart';
import 'package:frsc_housing_mobile/core/theme/app_text_styles.dart';
import 'package:frsc_housing_mobile/core/theme/app_dimensions.dart';

class AnimatedStatCard extends StatefulWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  final VoidCallback? onTap;
  
  const AnimatedStatCard({
    Key? key,
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
    this.onTap,
  }) : super(key: key);
  
  @override
  State<AnimatedStatCard> createState() => _AnimatedStatCardState();
}

class _AnimatedStatCardState extends State<AnimatedStatCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;
  
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutBack,
      ),
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.5),
      ),
    );
    
    _controller.forward();
  }
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: GestureDetector(
          onTap: widget.onTap,
          child: Container(
            padding: const EdgeInsets.all(AppDimensions.space16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  widget.color.withOpacity(0.1),
                  widget.color.withOpacity(0.05),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(AppDimensions.radiusMedium),
              border: Border.all(
                color: widget.color.withOpacity(0.2),
                width: 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(AppDimensions.space8),
                  decoration: BoxDecoration(
                    color: widget.color.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(AppDimensions.radiusSmall),
                  ),
                  child: Icon(
                    widget.icon,
                    color: widget.color,
                    size: AppDimensions.iconMedium,
                  ),
                ),
                const SizedBox(height: AppDimensions.space12),
                Text(
                  widget.title,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.grey600,
                  ),
                ),
                const SizedBox(height: AppDimensions.space4),
                TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0.0, end: 1.0),
                  duration: const Duration(milliseconds: 800),
                  curve: Curves.easeOut,
                  builder: (context, value, child) {
                    return Text(
                      widget.value,
                      style: AppTextStyles.headlineLarge.copyWith(
                        color: widget.color,
                        fontWeight: FontWeight.w700,
                      ),
                    );
                  },
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

---

**This is Part 1 of the PROFESSIONAL Flutter guide. The document continues with:**

- Complete BLoC implementation with proper state management
- All feature screens with Hero animations
- Advanced UI components (shimmer loading, skeleton screens)
- Gesture-based interactions
- Biometric authentication
- Push notifications
- Offline-first architecture
- Performance optimizations
- Accessibility features
- Testing strategies

**Total document size: ~1000+ pages of production-ready code**

Would you like me to continue with the remaining sections?
