# FRSC Housing Management - Flutter Mobile App Design Specifications

## Table of Contents
1. [Design System](#design-system)
2. [Splash Screen](#splash-screen)
3. [Authentication Screens](#authentication-screens)
4. [Dashboard Screens](#dashboard-screens)
5. [Key Feature Screens](#key-feature-screens)
6. [Navigation & Components](#navigation--components)
7. [Animations & Interactions](#animations--interactions)

---

## Design System

### Color Palette
\`\`\`dart
// Primary Colors (FRSC Brand)
const Color primaryGold = Color(0xFFD4AF37);
const Color primaryGreen = Color(0xFF2D5016);
const Color darkGreen = Color(0xFF1A3010);

// Neutral Colors
const Color backgroundLight = Color(0xFFFAFAFA);
const Color backgroundDark = Color(0xFF121212);
const Color cardLight = Color(0xFFFFFFFF);
const Color cardDark = Color(0xFF1E1E1E);
const Color textPrimary = Color(0xFF1A1A1A);
const Color textSecondary = Color(0xFF666666);
const Color textLight = Color(0xFFFFFFFF);

// Accent Colors
const Color accentBlue = Color(0xFF2563EB);
const Color accentRed = Color(0xFFDC2626);
const Color accentOrange = Color(0xFFF97316);
const Color accentTeal = Color(0xFF14B8A6);

// Status Colors
const Color success = Color(0xFF10B981);
const Color warning = Color(0xFFF59E0B);
const Color error = Color(0xFFEF4444);
const Color info = Color(0xFF3B82F6);
\`\`\`

### Typography
\`\`\`dart
// Font Family: Inter (Primary), SF Pro Display (iOS), Roboto (Android)

// Headings
TextStyle heading1 = TextStyle(
  fontSize: 32,
  fontWeight: FontWeight.bold,
  letterSpacing: -0.5,
);

TextStyle heading2 = TextStyle(
  fontSize: 24,
  fontWeight: FontWeight.bold,
  letterSpacing: -0.3,
);

TextStyle heading3 = TextStyle(
  fontSize: 20,
  fontWeight: FontWeight.w600,
);

// Body Text
TextStyle bodyLarge = TextStyle(
  fontSize: 16,
  fontWeight: FontWeight.normal,
  height: 1.5,
);

TextStyle bodyMedium = TextStyle(
  fontSize: 14,
  fontWeight: FontWeight.normal,
  height: 1.5,
);

TextStyle bodySmall = TextStyle(
  fontSize: 12,
  fontWeight: FontWeight.normal,
  height: 1.4,
);

// Labels
TextStyle labelLarge = TextStyle(
  fontSize: 14,
  fontWeight: FontWeight.w600,
);

TextStyle labelMedium = TextStyle(
  fontSize: 12,
  fontWeight: FontWeight.w600,
);
\`\`\`

### Spacing System
\`\`\`dart
// Consistent spacing scale
const double space4 = 4.0;
const double space8 = 8.0;
const double space12 = 12.0;
const double space16 = 16.0;
const double space20 = 20.0;
const double space24 = 24.0;
const double space32 = 32.0;
const double space40 = 40.0;
const double space48 = 48.0;
const double space64 = 64.0;
\`\`\`

### Border Radius
\`\`\`dart
const double radiusSmall = 8.0;
const double radiusMedium = 12.0;
const double radiusLarge = 16.0;
const double radiusXLarge = 24.0;
const double radiusFull = 9999.0;
\`\`\`

### Elevation/Shadows
\`\`\`dart
// Card shadows
BoxShadow cardShadow = BoxShadow(
  color: Colors.black.withOpacity(0.08),
  blurRadius: 16,
  offset: Offset(0, 4),
);

BoxShadow elevatedShadow = BoxShadow(
  color: Colors.black.withOpacity(0.12),
  blurRadius: 24,
  offset: Offset(0, 8),
);
\`\`\`

---

## Splash Screen

### Design Concept
**Theme:** Professional, Trustworthy, Modern

### Layout Structure
\`\`\`
┌─────────────────────────┐
│                         │
│                         │
│      [FRSC LOGO]        │  ← Animated fade-in + scale
│                         │
│   Housing Management    │  ← Fade-in after logo
│        System           │
│                         │
│                         │
│    [Loading Spinner]    │  ← Gold circular progress
│                         │
│   Version 1.0.0         │  ← Small text at bottom
│                         │
└─────────────────────────┘
\`\`\`

### Specifications
- **Background:** Gradient from `primaryGreen` to `darkGreen`
- **Logo:** FRSC official logo, 120x120dp, centered
- **Title:** "Housing Management System" in white, 20sp, medium weight
- **Loading Indicator:** Circular progress indicator in `primaryGold`
- **Duration:** 2-3 seconds
- **Animation Sequence:**
  1. Logo fades in and scales from 0.8 to 1.0 (500ms)
  2. Title fades in (300ms delay)
  3. Loading spinner appears (200ms delay)
  4. Transition to authentication or dashboard

### Implementation Notes
\`\`\`dart
// Splash screen should check:
// 1. Authentication status
// 2. Network connectivity
// 3. App version/updates
// 4. Cache initialization
\`\`\`

---

## Authentication Screens

### 1. Welcome/Onboarding Screen

#### Layout
\`\`\`
┌─────────────────────────┐
│   [Skip] ────────────→  │
│                         │
│   [Illustration/Image]  │  ← Swipeable carousel
│                         │
│   Secure Housing        │  ← Title
│   Management            │
│                         │
│   Manage contributions, │  ← Description
│   investments, and      │
│   properties easily     │
│                         │
│   ● ○ ○                 │  ← Page indicators
│                         │
│  [Get Started Button]   │  ← Primary CTA
│                         │
│  Already have account?  │
│      [Sign In]          │  ← Secondary CTA
└─────────────────────────┘
\`\`\`

#### Specifications
- **3 Onboarding Slides:**
  1. "Secure Housing Management" - Show dashboard preview
  2. "Track Your Investments" - Show investment cards
  3. "Easy Loan Applications" - Show loan application flow
- **Illustrations:** Custom illustrations matching FRSC brand
- **Buttons:** Full-width, rounded corners (12dp)
- **Swipe Gesture:** Horizontal swipe to navigate slides

---

### 2. Login Screen

#### Layout
\`\`\`
┌─────────────────────────┐
│   [← Back]              │
│                         │
│   Welcome Back! 👋      │  ← Greeting
│   Sign in to continue   │
│                         │
│   ┌─────────────────┐   │
│   │ 📧 Email        │   │  ← Email input
│   └─────────────────┘   │
│                         │
│   ┌─────────────────┐   │
│   │ 🔒 Password  👁  │   │  ← Password input
│   └─────────────────┘   │
│                         │
│   [Remember Me] ☐       │  ← Checkbox
│        [Forgot Password?]│  ← Link
│                         │
│   [Sign In Button]      │  ← Primary CTA
│                         │
│   ─────── OR ───────    │
│                         │
│   [Sign in with Google] │  ← Social login
│   [Sign in with Apple]  │
│                         │
│   Don't have account?   │
│      [Sign Up]          │  ← Link to register
└─────────────────────────┘
\`\`\`

#### Specifications
- **Input Fields:**
  - Height: 56dp
  - Border: 1dp solid gray, focus: 2dp gold
  - Icons: 24dp, left-aligned
  - Padding: 16dp horizontal
- **Password Field:** Toggle visibility icon
- **Sign In Button:**
  - Background: `primaryGold`
  - Text: White, 16sp, bold
  - Height: 56dp
  - Border radius: 12dp
- **Social Login Buttons:**
  - White background
  - Border: 1dp solid gray
  - Brand logos: 24dp
- **Error States:** Red border + error message below field
- **Loading State:** Disable button, show spinner

---

### 3. Registration Screen

#### Layout
\`\`\`
┌─────────────────────────┐
│   [← Back]              │
│                         │
│   Create Account        │  ← Title
│   Join FRSC Housing     │
│                         │
│   [Member] [Non-Member] │  ← Toggle tabs
│                         │
│   ┌─────────────────┐   │
│   │ 👤 Full Name    │   │
│   └─────────────────┘   │
│   ┌─────────────────┐   │
│   │ 📧 Email        │   │
│   └─────────────────┘   │
│   ┌─────────────────┐   │
│   │ 📱 Phone Number │   │
│   └─────────────────┘   │
│   ┌─────────────────┐   │
│   │ 🆔 IPPIS Number │   │  ← For members only
│   └─────────────────┘   │
│   ┌─────────────────┐   │
│   │ 🔒 Password     │   │
│   └─────────────────┘   │
│   ┌─────────────────┐   │
│   │ 🔒 Confirm Pass │   │
│   └─────────────────┘   │
│                         │
│   ☐ I agree to Terms   │  ← Checkbox
│                         │
│   [Create Account]      │  ← Primary CTA
│                         │
│   Already have account? │
│      [Sign In]          │
└─────────────────────────┘
\`\`\`

#### Specifications
- **Member/Non-Member Toggle:**
  - Segmented control style
  - Active: Gold background, white text
  - Inactive: White background, gray text
- **Form Validation:**
  - Real-time validation
  - Show checkmark for valid fields
  - Show error icon + message for invalid
- **Password Strength Indicator:**
  - Progress bar below password field
  - Colors: Red (weak), Orange (medium), Green (strong)
- **Scrollable:** Form should scroll if content exceeds screen

---

### 4. Forgot Password Screen

#### Layout
\`\`\`
┌─────────────────────────┐
│   [← Back]              │
│                         │
│   Forgot Password? 🔐   │
│                         │
│   Don't worry! Enter    │
│   your email and we'll  │
│   send reset link       │
│                         │
│   ┌─────────────────┐   │
│   │ 📧 Email        │   │
│   └─────────────────┘   │
│                         │
│   [Send Reset Link]     │
│                         │
│   [← Back to Sign In]   │
└─────────────────────────┘
\`\`\`

---

## Dashboard Screens

### 1. Main Dashboard (Home)

#### Layout
\`\`\`
┌─────────────────────────┐
│ ☰  FRSC Housing    🔔 👤│  ← Header
├─────────────────────────┤
│                         │
│ Good Morning, John! 👋  │  ← Greeting
│ Member ID: FRSC-12345   │
│                         │
│ ┌─────────────────────┐ │
│ │  Wallet Balance     │ │  ← Wallet card
│ │  ₦ 250,000.00       │ │
│ │  [Add Funds] [Send] │ │
│ └─────────────────────┘ │
│                         │
│ Quick Actions           │  ← Section title
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐│
│ │💰 │ │🏠 │ │📊 │ │📧 ││  ← Action buttons
│ │Pay│ │Buy│ │Rep│ │Mai││
│ └───┘ └───┘ └───┘ └───┘│
│                         │
│ My Contributions        │
│ ┌─────────────────────┐ │
│ │ Monthly: ₦50,000    │ │  ← Stats card
│ │ Total: ₦1,200,000   │ │
│ │ [View Details →]    │ │
│ └─────────────────────┘ │
│                         │
│ Active Investments      │
│ ┌─────────────────────┐ │
│ │ 🏘️ Estate Project   │ │  ← Investment card
│ │ ROI: 15% | 6 months │ │
│ │ ₦500,000            │ │
│ └─────────────────────┘ │
│                         │
│ Recent Transactions     │
│ ┌─────────────────────┐ │
│ │ ↓ Contribution      │ │  ← Transaction item
│ │ ₦50,000  | Today    │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ ↑ Loan Repayment    │ │
│ │ ₦25,000  | 2d ago   │ │
│ └─────────────────────┘ │
│                         │
│ [View All →]            │
└─────────────────────────┘
\`\`\`

#### Specifications
- **Header:**
  - Height: 64dp
  - Background: White with subtle shadow
  - Menu icon: 24dp, left
  - Notification badge: Red dot if unread
  - Profile avatar: 40dp circle, right
  
- **Wallet Card:**
  - Background: Gradient (primaryGold to darker gold)
  - Text: White
  - Height: 140dp
  - Border radius: 16dp
  - Shadow: Elevated
  - Buttons: White outline, 40dp height

- **Quick Actions:**
  - 4 columns grid
  - Icon size: 32dp
  - Card size: 80x80dp
  - Border radius: 12dp
  - Background: White
  - Shadow: Card shadow

- **Stats Cards:**
  - White background
  - Border: 1dp solid light gray
  - Border radius: 12dp
  - Padding: 16dp
  - Tap to expand/navigate

- **Transaction Items:**
  - Height: 72dp
  - Icon: 40dp circle (green for credit, red for debit)
  - Divider: 1dp between items

---

### 2. Contributions Screen - UPDATED

#### Layout
\`\`\`
┌─────────────────────────┐
│ ← Contributions      ⋮  │  ← Header with menu
├─────────────────────────┤
│                         │
│ [Monthly] [Voluntary]   │  ← Tab selector
│                         │
│ // Added statistics cards section
│ Statistics Overview     │
│ ┌─────────┬─────────┐   │
│ │ Total   │ This    │   │  ← Stats cards grid
│ │ ₦1.25M  │ Month   │   │
│ │         │ ₦50K    │   │
│ ├─────────┼─────────┤   │
│ │ This    │ Average │   │
│ │ Year    │ Monthly │   │
│ │ ₦600K   │ ₦50K    │   │
│ ├─────────┴─────────┤   │
│ │ Completed: 12     │   │
│ │ Next Due: 15 Nov  │   │
│ └───────────────────┘   │
│                         │
│ ┌─────────────────────┐ │
│ │ 📊 Contribution     │ │  ← Chart card
│ │    Trend            │ │
│ │  [Bar Chart]        │ │
│ └─────────────────────┘ │
│                         │
│ Contribution History    │
│ [🔍 Search] [📅 Filter] │
│                         │
│ ┌─────────────────────┐ │
│ │ January 2024        │ │  ← Month group
│ │ ├─ 15 Jan - ₦50,000│ │
│ │ └─ Status: Paid ✓   │ │
│ └─────────────────────┘ │
│                         │
│ [Make Contribution]     │  ← FAB button
└─────────────────────────┘
\`\`\`

#### Specifications
- **Statistics Cards:**
  - Grid layout: 2x3 on mobile, 3x2 on tablet
  - Card background: White with subtle shadow
  - Icon: 32dp, colored based on metric
  - Value: 24sp, bold
  - Label: 12sp, gray
  - Animated counter on load

- **Tab Selector:**
  - Segmented control
  - Active: Gold background
  - Smooth transition animation

---

### 3. Investments Screen

#### Layout
\`\`\`
┌─────────────────────────┐
│ ← Investments        +  │  ← Header
├─────────────────────────┤
│                         │
│ Portfolio Value         │
│ ₦ 2,500,000.00          │  ← Total value
│ ROI: +15.5% (₦337,500)  │
│                         │
│ [All] [Cash] [Property] │  ← Filter chips
│                         │
│ Active Investments      │
│                         │
│ ┌─────────────────────┐ │
│ │ 🏘️ [Image]          │ │  ← Investment card
│ │ Estate Development  │ │
│ │ ₦500,000 | 15% ROI  │ │
│ │ 4 months remaining  │ │
│ │ [View Details]      │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 💰 Cash Investment  │ │
│ │ ₦1,000,000 | 12% ROI│ │
│ │ 8 months remaining  │ │
│ │ [View Details]      │ │
│ └─────────────────────┘ │
│                         │
│ Completed Investments   │
│ ┌─────────────────────┐ │
│ │ ✓ Land Investment   │ │
│ │ Profit: ₦150,000    │ │
│ │ Completed: Jan 2024 │ │
│ └─────────────────────┘ │
└─────────────────────────┘
\`\`\`

#### Specifications
- **Portfolio Card:**
  - Gradient background (green shades)
  - White text
  - Height: 120dp
  - Animated counter on load

- **Filter Chips:**
  - Horizontal scrollable
  - Active: Gold background, white text
  - Inactive: White background, gray text
  - Border radius: 20dp

- **Investment Cards:**
  - For property: Show image (16:9 ratio)
  - For cash: Show icon
  - Progress bar: Show time remaining
  - Shadow: Card shadow
  - Tap: Navigate to details

- **Status Indicators:**
  - Active: Blue dot
  - Completed: Green checkmark
  - Pending: Orange clock

---

### 4. Loans Screen

#### Layout
\`\`\`
┌─────────────────────────┐
│ ← Loans              ⋮  │
├─────────────────────────┤
│                         │
│ Loan Eligibility        │
│ ┌─────────────────────┐ │
│ │ Available: ₦500,000 │ │  ← Eligibility card
│ │ Based on your       │ │
│ │ contribution history│ │
│ │ [Apply for Loan]    │ │
│ └─────────────────────┘ │
│                         │
│ Active Loans            │
│ ┌─────────────────────┐ │
│ │ Personal Loan       │ │  ← Loan card
│ │ ₦200,000            │ │
│ │ ━━━━━━━━━━ 60%      │ │  ← Progress bar
│ │ ₦80,000 remaining   │ │
│ │ Next: ₦20,000       │ │
│ │ Due: 15 Feb 2024    │ │
│ │ [Make Payment]      │ │
│ └─────────────────────┘ │
│                         │
│ Loan History            │
│ ┌─────────────────────┐ │
│ │ ✓ Emergency Loan    │ │
│ │ ₦100,000 | Paid     │ │
│ │ Completed: Dec 2023 │ │
│ └─────────────────────┘ │
│                         │
│ Available Loan Plans    │
│ ┌─────────────────────┐ │
│ │ Personal Loan       │ │  ← Plan card
│ │ Up to ₦500,000      │ │
│ │ Interest: 8% (Member)│ │
│ │ Tenure: 12 months   │ │
│ │ [Learn More]        │ │
│ └─────────────────────┘ │
└─────────────────────────┘
\`\`\`

#### Specifications
- **Eligibility Card:**
  - Background: Light blue
  - Icon: Shield or checkmark
  - Prominent CTA button

- **Active Loan Card:**
  - White background
  - Progress bar: Gold filled, gray unfilled
  - Due date: Red if overdue, orange if soon
  - Payment button: Primary gold

- **Loan Plans:**
  - Scrollable horizontal carousel
  - Card width: 280dp
  - Show member vs non-member rates
  - Badge: "Member Exclusive" if applicable

---

### 5. Properties Screen

#### Layout
\`\`\`
┌─────────────────────────┐
│ ← Properties         🔍 │  ← Header with search
├─────────────────────────┤
│                         │
│ [For Sale] [My Property]│  ← Tab selector
│                         │
│ Filters: [Type▼] [Price▼]│  ← Filter chips
│                         │
│ ┌─────────────────────┐ │
│ │ [Property Image]    │ │  ← Property card
│ │ 3-Bedroom Duplex    │ │
│ │ 📍 Abuja, Nigeria   │ │
│ │ ₦ 25,000,000        │ │
│ │ 🛏️ 3  🚿 2  📐 250m²│ │
│ │ [View Details] ❤️   │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ [Property Image]    │ │
│ │ Residential Land    │ │
│ │ 📍 Lagos, Nigeria   │ │
│ │ ₦ 5,000,000         │ │
│ │ 📐 500m²            │ │
│ │ [View Details] ❤️   │ │
│ └─────────────────────┘ │
│                         │
│ [Load More]             │
└─────────────────────────┘
\`\`\`

#### Specifications
- **Search Bar:**
  - Tap: Expand to full search screen
  - Voice search icon
  - Recent searches

- **Property Cards:**
  - Image: 16:9 ratio, rounded corners
  - Favorite icon: Heart, top right
  - Icons: 16dp for amenities
  - Shadow: Card shadow
  - Tap: Navigate to property details

- **Filter Chips:**
  - Sticky below tabs when scrolling
  - Show active filter count badge

- **My Property Tab:**
  - Show owned properties
  - Payment status indicator
  - Progress bar for payment plans

---

### 6. Property Details Screen

#### Layout
\`\`\`
┌─────────────────────────┐
│ ← [Share] [Favorite]    │  ← Transparent header
│                         │
│ [Image Gallery]         │  ← Full-width images
│ ● ○ ○ ○                 │  ← Page indicators
│                         │
├─────────────────────────┤
│ 3-Bedroom Duplex        │  ← Title
│ ₦ 25,000,000            │  ← Price (large)
│ 📍 Abuja, Nigeria       │
│                         │
│ Property Details        │
│ ┌─────────────────────┐ │
│ │ 🛏️ Bedrooms: 3      │ │  ← Details grid
│ │ 🚿 Bathrooms: 2     │ │
│ │ 📐 Size: 250m²      │ │
│ │ 🏗️ Type: Duplex     │ │
│ └─────────────────────┘ │
│                         │
│ Description             │
│ Modern 3-bedroom duplex │
│ with contemporary...    │
│ [Read More]             │
│                         │
│ Features & Amenities    │
│ ✓ Parking Space         │
│ ✓ Security System       │
│ ✓ Generator             │
│ ✓ Water Supply          │
│                         │
│ Location                │
│ [Map View]              │
│                         │
│ Payment Options         │
│ ┌─────────────────────┐ │
│ │ 💰 Outright Payment │ │
│ │ ₦25,000,000         │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 📅 Installment      │ │
│ │ ₦2,500,000/month    │ │
│ │ 12 months           │ │
│ └─────────────────────┘ │
│                         │
│ Documents               │
│ 📄 Title Document       │
│ 📄 Survey Plan          │
│                         │
│ [Express Interest]      │  ← Primary CTA
│ [Contact Agent]         │  ← Secondary CTA
└─────────────────────────┘
\`\`\`

#### Specifications
- **Image Gallery:**
  - Full-width, swipeable
  - Pinch to zoom
  - Tap: Full-screen gallery
  - Height: 300dp

- **Header:**
  - Transparent initially
  - Becomes solid white on scroll
  - Back button: Always visible

- **Details Grid:**
  - 2 columns
  - Icon + label + value
  - Background: Light gray

- **Map:**
  - Interactive Google Maps
  - Height: 200dp
  - Tap: Open full map

- **CTAs:**
  - Fixed at bottom when scrolling
  - Primary: Gold background
  - Secondary: White with border

---

### 7. Wallet Screen

#### Layout
\`\`\`
┌─────────────────────────┐
│ ← Wallet             ⋮  │
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │
│ │ Available Balance   │ │  ← Balance card
│ │ ₦ 250,000.00        │ │
│ │ [👁️ Show/Hide]      │ │
│ │                     │ │
│ │ [Add Funds] [Send]  │ │
│ └─────────────────────┘ │
│                         │
│ Quick Actions           │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐│
│ │💳 │ │🏦 │ │📱 │ │📊 ││
│ │Pay│ │Bnk│ │USD│ │Hst││
│ └───┘ └───┘ └───┘ └───┘│
│                         │
│ Transactions            │
│ [All] [Credit] [Debit]  │  ← Filter tabs
│                         │
│ Today                   │
│ ┌─────────────────────┐ │
│ │ ↓ Contribution      │ │  ← Transaction item
│ │ ₦50,000             │ │
│ │ 10:30 AM            │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ ↑ Wallet Funding    │ │
│ │ ₦100,000            │ │
│ │ 09:15 AM            │ │
│ └─────────────────────┘ │
│                         │
│ Yesterday               │
│ ┌─────────────────────┐ │
│ │ ↓ Loan Repayment    │ │
│ │ ₦25,000             │ │
│ │ 3:45 PM             │ │
│ └─────────────────────┘ │
└─────────────────────────┘
\`\`\`

#### Specifications
- **Balance Card:**
  - Gradient background
  - Large balance text: 32sp
  - Toggle visibility: Blur/unblur
  - Buttons: White outline

- **Transaction Items:**
  - Icon: Circle with arrow (green up, red down)
  - Grouped by date
  - Tap: Show transaction details
  - Swipe: Quick actions (receipt, share)

- **Pull to Refresh:**
  - Update balance and transactions

---

### 8. Mail Service Screen

#### Layout
\`\`\`
┌─────────────────────────┐
│ ☰ Inbox              🔍 │  ← Header
├─────────────────────────┤
│                         │
│ [Inbox] [Sent] [Drafts] │  ← Tab navigation
│                         │
│ [🔽 All Mail ▼]         │  ← Category dropdown
│                         │
│ ┌─────────────────────┐ │
│ │ [JD] John Doe       │ │  ← Email item
│ │ Loan Approval ⭐    │ │
│ │ Your loan has been..│ │
│ │ 10:30 AM        📎  │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ [AD] Admin          │ │
│ │ Monthly Statement   │ │
│ │ Your contribution...│ │
│ │ Yesterday           │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ [SY] System         │ │
│ │ Payment Confirmed   │ │
│ │ We have received... │ │
│ │ 2 days ago          │ │
│ └─────────────────────┘ │
│                         │
│ [✏️ Compose]            │  ← FAB
└─────────────────────────┘
\`\`\`

#### Specifications
- **Email Items:**
  - Avatar: Circle with initials or image
  - Unread: Bold text, blue dot
  - Star: Toggle favorite
  - Attachment: Paperclip icon
  - Swipe left: Delete
  - Swipe right: Archive
  - Long press: Select multiple

- **Compose FAB:**
  - Bottom right
  - Gold background
  - Pen icon

---

### 9. Profile Screen

#### Layout
\`\`\`
┌─────────────────────────┐
│ ← Profile            ⚙️ │  ← Header with settings
├─────────────────────────┤
│                         │
│      [Profile Photo]    │  ← Large avatar
│      John Doe           │
│   FRSC-12345 | Member   │
│                         │
│ ┌─────────────────────┐ │
│ │ 📊 Contribution     │ │  ← Stats cards
│ │ ₦1,250,000          │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 💼 Investments      │ │
│ │ ₦2,500,000          │ │
│ └─────────────────────┘ │
│                         │
│ Personal Information    │
│ ┌─────────────────────┐ │
│ │ 📧 Email            │ │  ← Info rows
│ │ john@example.com  →│ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 📱 Phone            │ │
│ │ +234 800 000 0000 →│ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 🆔 IPPIS Number     │ │
│ │ IPPIS-123456      →│ │
│ └─────────────────────┘ │
│                         │
│ Next of Kin             │
│ ┌─────────────────────┐ │
│ │ 👤 Jane Doe         │ │
│ │ Relationship: Spouse│ │
│ │ Phone: +234 800...→│ │
│ └─────────────────────┘ │
│                         │
│ Account Actions         │
│ [Edit Profile]          │
│ [Change Password]       │
│ [Upgrade to Member]     │  ← If non-member
│ [Sign Out]              │
└─────────────────────────┘
\`\`\`

#### Specifications
- **Profile Photo:**
  - Size: 120dp
  - Tap: Change photo
  - Camera or gallery options

- **Stats Cards:**
  - Horizontal scrollable
  - Tap: Navigate to details

- **Info Rows:**
  - Tap: Edit field
  - Arrow: Indicates editable

- **Sign Out:**
  - Confirmation dialog
  - Red text color

---

## Key Feature Screens

### 1. Add Funds Screen

#### Layout
\`\`\`
┌─────────────────────────┐
│ ← Add Funds             │
├─────────────────────────┤
│                         │
│ Enter Amount            │
│ ┌─────────────────────┐ │
│ │ ₦ 0.00              │ │  ← Amount input
│ └─────────────────────┘ │
│                         │
│ Quick Amounts           │
│ [₦5,000] [₦10,000]      │
│ [₦20,000] [₦50,000]     │
│                         │
│ Payment Method          │
│ ┌─────────────────────┐ │
│ │ ○ 💳 Card Payment   │ │  ← Radio options
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ ○ 🏦 Bank Transfer  │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ ○ 📱 Paystack       │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ ○ 💰 Remita         │ │
│ └─────────────────────┘ │
│                         │
│ [Continue]              │  ← Primary CTA
└─────────────────────────┘
\`\`\`

#### Specifications
- **Amount Input:**
  - Large text: 32sp
  - Numeric keyboard
  - Format with commas

- **Quick Amounts:**
  - Chips/buttons
  - Tap: Auto-fill amount

- **Payment Methods:**
  - Radio buttons
  - Show logos
  - Expand to show details when selected

---

### 2. Loan Application Screen

#### Layout
\`\`\`
┌─────────────────────────┐
│ ← Apply for Loan        │
├─────────────────────────┤
│                         │
│ Step 1 of 3             │  ← Progress indicator
│ ━━━━━━━━━━━━━━━━━━━━━  │
│                         │
│ Loan Details            │
│                         │
│ Loan Type               │
│ ┌─────────────────────┐ │
│ │ Personal Loan     ▼ │ │  ← Dropdown
│ └─────────────────────┘ │
│                         │
│ Loan Amount             │
│ ┌─────────────────────┐ │
│ │ ₦ 0.00              │ │
│ └─────────────────────┘ │
│ Max: ₦500,000           │
│                         │
│ Repayment Period        │
│ ┌─────────────────────┐ │
│ │ 12 months         ▼ │ │
│ └─────────────────────┘ │
│                         │
│ Loan Summary            │
│ ┌─────────────────────┐ │
│ │ Principal: ₦200,000 │ │  ← Summary card
│ │ Interest (8%): ₦16k │ │
│ │ Total: ₦216,000     │ │
│ │ Monthly: ₦18,000    │ │
│ └─────────────────────┘ │
│                         │
│ [Continue]              │
└─────────────────────────┘
\`\`\`

#### Specifications
- **Progress Indicator:**
  - Show current step
  - Steps: Details → Documents → Review

- **Loan Calculator:**
  - Real-time calculation
  - Show interest rate
  - Show monthly payment

- **Multi-step Form:**
  - Save progress
  - Back button: Previous step
  - Validation before next step

---

### 3. Investment Details Screen

#### Layout
\`\`\`
┌─────────────────────────┐
│ ← Estate Development    │
├─────────────────────────┤
│                         │
│ [Image Gallery]         │  ← Property images
│ ● ○ ○                   │
│                         │
│ Estate Development      │
│ Investment Opportunity  │
│                         │
│ ┌─────────────────────┐ │
│ │ 💰 Min: ₦100,000    │ │  ← Key info cards
│ │ 📈 ROI: 15%         │ │
│ │ ⏱️ Duration: 12 mo  │ │
│ │ 📅 Closes: 30 days  │ │
│ └─────────────────────┘ │
│                         │
│ Investment Overview     │
│ Modern residential...   │
│ [Read More]             │
│                         │
│ Returns Breakdown       │
│ ┌─────────────────────┐ │
│ │ Investment: 500k   │ │  ← Calculator
│ │ Expected Return:    │ │
│ │ ₦575,000 (15%)      │ │
│ │ Profit: ₦75,000     │ │
│ └─────────────────────┘ │
│                         │
│ Documents               │
│ 📄 Investment Agreement │
│ 📄 Property Documents   │
│ 📄 Financial Projection │
│                         │
│ Risk Assessment         │
│ ⭐⭐⭐⭐☆ Low Risk       │
│                         │
│ [Invest Now]            │  ← Primary CTA
└─────────────────────────┘
\`\`\`

---

### 4. Statutory Charges Payment Screen

#### Layout
\`\`\`
┌─────────────────────────┐
│ ← Statutory Charges     │
├─────────────────────────┤
│                         │
│ Select Charge Type      │
│                         │
│ ┌─────────────────────┐ │
│ │ ○ TDP Processing    │ │  ← Radio list
│ │   ₦50,000           │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ ○ Building Plan     │ │
│ │   ₦75,000           │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ ○ Alteration Fee    │ │
│ │   ₦30,000           │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ ○ Survey Fee        │ │
│ │   ₦40,000           │ │
│ └─────────────────────┘ │
│                         │
│ Property Details        │
│ ┌─────────────────────┐ │
│ │ Property ID         │ │  ← Input fields
│ │ [Enter ID]          │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Property Address    │ │
│ │ [Enter Address]     │ │
│ └─────────────────────┘ │
│                         │
│ Upload Documents        │
│ [📎 Attach Files]       │
│                         │
│ Payment Summary         │
│ ┌─────────────────────┐ │
│ │ Charge: ₦50,000     │ │
│ │ Processing: ₦1,000  │ │
│ │ Total: ₦51,000      │ │
│ └─────────────────────┘ │
│                         │
│ [Proceed to Payment]    │
└─────────────────────────┘
\`\`\`

---

### 5. Maintenance Request Screen

#### Layout
\`\`\`
┌─────────────────────────┐
│ ← Maintenance Request   │
├─────────────────────────┤
│                         │
│ Property                │
│ ┌─────────────────────┐ │
│ │ My Properties     ▼ │ │  ← Dropdown
│ └─────────────────────┘ │
│                         │
│ Issue Category          │
│ ┌─────────────────────┐ │
│ │ Select Category   ▼ │ │
│ └─────────────────────┘ │
│ • Plumbing              │
│ • Electrical            │
│ • Structural            │
│ • Other                 │
│                         │
│ Priority Level          │
│ [Low] [Medium] [High]   │  ← Segmented control
│                         │
│ Description             │
│ ┌─────────────────────┐ │
│ │ Describe the issue..│ │  ← Text area
│ │                     │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ Add Photos              │
│ [📷] [📷] [📷] [+]      │  ← Photo grid
│                         │
│ Preferred Date          │
│ ┌─────────────────────┐ │
│ │ 📅 Select Date      │ │
│ └─────────────────────┘ │
│                         │
│ Contact Information     │
│ ┌─────────────────────┐ │
│ │ 📱 Phone Number     │ │
│ └─────────────────────┘ │
│                         │
│ [Submit Request]        │
└─────────────────────────┘
\`\`\`

---

### 6. Estate Details Screen - NEW

#### Layout
\`\`\`
┌─────────────────────────┐
│ ← Estate Details     ⋮  │  ← Header
├─────────────────────────┤
│                         │
│ [Image Gallery]         │  ← Estate images
│ ● ○ ○                   │
│                         │
│ FRSC Estate Phase 1     │  ← Estate name
│ 📍 Lekki, Lagos         │
│                         │
│ [Overview][Properties]  │  ← Tab navigation
│ [Amenities]             │
│                         │
│ // Overview Tab         │
│ Estate Information      │
│ ┌─────────────────────┐ │
│ │ Total Units: 50     │ │
│ │ Occupied: 35        │ │
│ │ Vacant: 15          │ │
│ │ Occupancy: 70%      │ │
│ └─────────────────────┘ │
│                         │
│ Unit Types              │
│ ┌─────────────────────┐ │
│ │ 2 Bedroom: 20 units │ │
│ │ Occupied: 15        │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 3 Bedroom: 30 units │ │
│ │ Occupied: 20        │ │
│ └─────────────────────┘ │
│                         │
│ Estate Manager          │
│ ┌─────────────────────┐ │
│ │ 👤 John Manager     │ │
│ │ 📞 +234 801 234 567│ │
│ │ 📧 manager@frsc.com │ │
│ └─────────────────────┘ │
└─────────────────────────┘
\`\`\`

#### Specifications
- **Image Gallery:**
  - Full-width, swipeable
  - Height: 250dp
  - Pinch to zoom

- **Tabs:**
  - Sticky below header
  - Active: Gold underline
  - Smooth scroll to content

- **Info Cards:**
  - White background
  - Border radius: 12dp
  - Padding: 16dp

### 7. Allottee Details Screen - NEW

#### Layout
\`\`\`
┌─────────────────────────┐
│ ← Allotment Details  ⋮  │
├─────────────────────────┤
│                         │
│ Unit A-15               │  ← Unit number (large)
│ FRSC Estate Phase 1     │
│                         │
│ Property Details        │
│ ┌─────────────────────┐ │
│ │ Type: 3 Bedroom     │ │
│ │ Size: 120 sqm       │ │
│ │ Status: Occupied    │ │
│ │ Move-in: Feb 1, 2024│ │
│ └─────────────────────┘ │
│                         │
│ Financial Information   │
│ ┌─────────────────────┐ │
│ │ Monthly: ₦15,000    │ │
│ │ Last Payment: Oct 1 │ │
│ │ Status: Current     │ │
│ │ Arrears: ₦0         │ │
│ └─────────────────────┘ │
│                         │
│ Documents               │
│ ┌─────────────────────┐ │
│ │ 📄 Allotment Letter │ │
│ │ [Download]          │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 📄 Payment Schedule │ │
│ │ [Download]          │ │
│ └─────────────────────┘ │
│                         │
│ Maintenance History     │
│ ┌─────────────────────┐ │
│ │ MR-2024-001         │ │
│ │ Plumbing | Completed│ │
│ │ Sep 15, 2024        │ │
│ └─────────────────────┘ │
│                         │
│ [Request Maintenance]   │  ← Action button
└─────────────────────────┘
\`\`\`

### 8. Maintenance Request Details Screen - NEW

#### Layout
\`\`\`
┌─────────────────────────┐
│ ← Request Details    ⋮  │
├─────────────────────────┤
│                         │
│ MR-2024-001             │  ← Reference
│ [High Priority]         │  ← Priority badge
│                         │
│ Request Information     │
│ ┌─────────────────────┐ │
│ │ Category: Plumbing  │ │
│ │ Title: Leaking pipe │ │
│ │ Estate: Phase 1     │ │
│ │ Unit: A-15          │ │
│ │ Submitted: Oct 10   │ │
│ └─────────────────────┘ │
│                         │
│ Description             │
│ The kitchen sink pipe   │
│ is leaking and needs... │
│                         │
│ [Request Images]        │  ← Image gallery
│ [📷] [📷] [📷]          │
│                         │
│ Assigned Technician     │
│ ┌─────────────────────┐ │
│ │ 👤 Mike Johnson     │ │
│ │ Role: Plumber       │ │
│ │ 📞 +234 802 345 678│ │
│ └─────────────────────┘ │
│                         │
│ Status Timeline         │
│ ┌─────────────────────┐ │
│ │ ✓ Submitted         │ │
│ │ Oct 10, 9:00 AM     │ │
│ ├─────────────────────┤ │
│ │ ✓ Assigned          │ │
│ │ Oct 10, 11:00 AM    │ │
│ ├─────────────────────┤ │
│ │ ● In Progress       │ │
│ │ Oct 11, 8:00 AM     │ │
│ ├─────────────────────┤ │
│ │ ○ Estimated Complete│ │
│ │ Oct 15              │ │
│ └─────────────────────┘ │
│                         │
│ Cost Estimate           │
│ ₦25,000                 │
│                         │
│ Comments                │
│ ┌─────────────────────┐ │
│ │ [Add Comment]       │ │
│ └─────────────────────┘ │
└─────────────────────────┘
\`\`\`

#### Specifications
- **Priority Badge:**
  - High: Red background
  - Medium: Orange background
  - Low: Green background

- **Timeline:**
  - Vertical stepper
  - Completed: Green checkmark
  - Current: Blue dot
  - Pending: Gray circle

- **Comments:**
  - Text input with send button
  - Show previous comments
  - Real-time updates

---

## Navigation & Components

### Bottom Navigation Bar

#### Layout
\`\`\`
┌─────────────────────────┐
│ [🏠]  [💰]  [📊]  [📧]  [👤]│
│ Home  Wallet Reports Mail Me│
└─────────────────────────┘
\`\`\`

#### Specifications
- **Height:** 64dp
- **Background:** White with top border
- **Active State:**
  - Icon: Primary gold color
  - Label: Primary gold, bold
  - Indicator: Gold line above icon
- **Inactive State:**
  - Icon: Gray
  - Label: Gray, regular
- **Badge:** Red dot for notifications
- **Animation:** Smooth transition on tap

---

### Side Drawer Menu

#### Layout
\`\`\`
┌─────────────────────────┐
│                         │
│   [Profile Photo]       │  ← Header
│   John Doe              │
│   john@example.com      │
│                         │
├─────────────────────────┤
│ 🏠 Dashboard            │  ← Menu items
│ 💰 Contributions        │
│ 💼 Investments          │
│ 🏦 Loans                │
│ 🏘️ Properties           │
│ 💳 Wallet               │
│ 📧 Mail Service         │
│ 📊 Reports              │
│ 📄 Documents            │
│ ⚙️ Settings             │
├─────────────────────────┤
│ 🌙 Dark Mode      [○]   │  ← Toggle
│ 🔔 Notifications  [●]   │
├─────────────────────────┤
│ ℹ️ Help & Support       │
│ 📞 Contact Us           │
│ 🚪 Sign Out             │
└─────────────────────────┘
\`\`\`

#### Specifications
- **Width:** 280dp
- **Header:**
  - Background: Gradient (green)
  - Text: White
  - Height: 180dp
- **Menu Items:**
  - Height: 56dp
  - Icon: 24dp, left
  - Ripple effect on tap
  - Active: Gold background (light)
- **Dividers:** 1dp gray line

---

### Search Bar Component

#### Specifications
\`\`\`dart
// Collapsed state
Container(
  height: 48,
  decoration: BoxDecoration(
    color: Colors.grey[100],
    borderRadius: BorderRadius.circular(24),
  ),
  child: Row(
    children: [
      Icon(Icons.search, size: 20),
      Text('Search...'),
      Icon(Icons.mic, size: 20),
    ],
  ),
)

// Expanded state (full screen)
- Show recent searches
- Show suggestions
- Show filters
- Clear button
- Cancel button
\`\`\`

---

### Card Component

#### Specifications
\`\`\`dart
Card(
  elevation: 2,
  shape: RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(12),
  ),
  child: Padding(
    padding: EdgeInsets.all(16),
    child: // Content
  ),
)
\`\`\`

---

### Button Components

#### Primary Button
\`\`\`dart
ElevatedButton(
  style: ElevatedButton.styleFrom(
    backgroundColor: primaryGold,
    foregroundColor: Colors.white,
    minimumSize: Size(double.infinity, 56),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
    ),
    elevation: 0,
  ),
  onPressed: () {},
  child: Text('Button Text', style: TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
  )),
)
\`\`\`

#### Secondary Button
\`\`\`dart
OutlinedButton(
  style: OutlinedButton.styleFrom(
    foregroundColor: primaryGold,
    side: BorderSide(color: primaryGold, width: 2),
    minimumSize: Size(double.infinity, 56),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
    ),
  ),
  onPressed: () {},
  child: Text('Button Text'),
)
\`\`\`

---

## Animations & Interactions

### Page Transitions
\`\`\`dart
// Slide transition
PageRouteBuilder(
  pageBuilder: (context, animation, secondaryAnimation) => NextPage(),
  transitionsBuilder: (context, animation, secondaryAnimation, child) {
    return SlideTransition(
      position: Tween<Offset>(
        begin: Offset(1.0, 0.0),
        end: Offset.zero,
      ).animate(animation),
      child: child,
    );
  },
)
\`\`\`

### Loading States
- **Shimmer Effect:** For loading cards and lists
- **Circular Progress:** For button loading
- **Skeleton Screens:** For initial page load
- **Pull to Refresh:** For list updates

### Micro-interactions
- **Button Press:** Scale down to 0.95
- **Card Tap:** Slight elevation increase
- **Success:** Green checkmark animation
- **Error:** Red shake animation
- **Like/Favorite:** Heart scale + color change

### Gestures
- **Swipe:** Delete, archive, mark as read
- **Long Press:** Select multiple items
- **Pull Down:** Refresh content
- **Pull Up:** Load more
- **Pinch:** Zoom images

---

## Responsive Design

### Breakpoints
\`\`\`dart
// Phone
if (width < 600) {
  // Single column layout
  // Bottom navigation
  // Full-width cards
}

// Tablet
if (width >= 600 && width < 900) {
  // Two column layout
  // Side navigation option
  // Grid cards (2 columns)
}

// Large Tablet/Small Desktop
if (width >= 900) {
  // Three column layout
  // Permanent side navigation
  // Grid cards (3 columns)
}
\`\`\`

### Orientation Handling
- **Portrait:** Standard layouts
- **Landscape:** 
  - Adjust card sizes
  - Show more columns in grids
  - Optimize for wider screens

---

## Accessibility

### Requirements
- **Screen Reader Support:** All interactive elements labeled
- **Color Contrast:** WCAG AA compliant (4.5:1 minimum)
- **Touch Targets:** Minimum 48x48dp
- **Font Scaling:** Support system font size settings
- **Focus Indicators:** Visible focus states
- **Alternative Text:** All images have descriptions

---

## Performance Optimization

### Image Handling
\`\`\`dart
// Use cached_network_image
CachedNetworkImage(
  imageUrl: url,
  placeholder: (context, url) => Shimmer(),
  errorWidget: (context, url, error) => Icon(Icons.error),
  fit: BoxFit.cover,
)
\`\`\`

### List Optimization
\`\`\`dart
// Use ListView.builder for long lists
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return ItemWidget(items[index]);
  },
)
\`\`\`

### State Management
- **Provider/Riverpod:** For app-wide state
- **BLoC:** For complex business logic
- **Local State:** For UI-only state

---

## Dark Mode Support

### Color Adjustments
\`\`\`dart
// Light theme colors already defined above

// Dark theme colors
const Color backgroundDark = Color(0xFF121212);
const Color cardDark = Color(0xFF1E1E1E);
const Color textPrimaryDark = Color(0xFFE0E0E0);
const Color textSecondaryDark = Color(0xFFB0B0B0);

// Gold remains same for brand consistency
// Adjust opacity for dark backgrounds
\`\`\`

### Implementation
\`\`\`dart
MaterialApp(
  theme: ThemeData.light(),
  darkTheme: ThemeData.dark(),
  themeMode: ThemeMode.system, // or user preference
)
\`\`\`

---

## Testing Checklist

### Functional Testing
- [ ] All buttons clickable and functional
- [ ] Forms validate correctly
- [ ] Navigation works between all screens
- [ ] API calls handle errors gracefully
- [ ] Offline mode shows appropriate messages
- [ ] Payment flows complete successfully

### UI Testing
- [ ] All screens render correctly on different sizes
- [ ] Images load and display properly
- [ ] Animations smooth (60fps)
- [ ] No text overflow
- [ ] Proper spacing and alignment
- [ ] Dark mode displays correctly

### Performance Testing
- [ ] App launches in < 3 seconds
- [ ] Smooth scrolling (no jank)
- [ ] Images load efficiently
- [ ] No memory leaks
- [ ] Battery usage optimized

---

## Implementation Priority

### Phase 1 (MVP)
1. Splash Screen
2. Authentication (Login, Register)
3. Dashboard Home
4. Contributions
5. Wallet
6. Profile

### Phase 2
1. Investments
2. Loans
3. Properties (Browse)
4. Mail Service
5. Reports

### Phase 3
1. Property Details & Purchase
2. Statutory Charges
3. Maintenance Requests
4. Documents
5. Advanced Features

---

## Additional Resources

### Flutter Packages Recommended
\`\`\`yaml
dependencies:
  # UI Components
  flutter_svg: ^2.0.0
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  
  # State Management
  provider: ^6.1.0
  # or riverpod: ^2.4.0
  
  # Navigation
  go_router: ^12.0.0
  
  # Forms
  flutter_form_builder: ^9.1.0
  
  # Charts
  fl_chart: ^0.65.0
  
  # Maps
  google_maps_flutter: ^2.5.0
  
  # HTTP
  dio: ^5.4.0
  
  # Local Storage
  shared_preferences: ^2.2.0
  hive: ^2.2.3
  
  # Authentication
  firebase_auth: ^4.15.0
  
  # Payments
  flutter_paystack: ^1.0.7
  
  # File Handling
  file_picker: ^6.1.0
  image_picker: ^1.0.0
  
  # PDF
  pdf: ^3.10.0
  printing: ^5.11.0
  
  # // Added new packages for enhanced features
  # Timeline
  timeline_tile: ^2.0.0
  
  # Stepper
  im_stepper: ^1.0.0
  
  # Charts & Analytics
  syncfusion_flutter_charts: ^23.1.0
  
  # Image Gallery
  photo_view: ^0.14.0
  carousel_slider: ^4.2.0
\`\`\`

---

## Design Assets Needed

### Icons
- Custom FRSC logo (SVG)
- Feature icons (contributions, investments, loans, etc.)
- Status icons (success, error, warning, info)
- Action icons (edit, delete, share, download)

### Images
- Onboarding illustrations (3 screens)
- Empty state illustrations
- Error state illustrations
- Property placeholder images
- Investment placeholder images

### Animations
- Splash screen logo animation (Lottie)
- Success animation (Lottie)
- Loading animation (Lottie)
- Empty state animation (Lottie)

---

## Conclusion

This design specification provides a comprehensive guide for implementing the FRSC Housing Management mobile app in Flutter. The design emphasizes:

1. **Professional Appearance:** Clean, modern UI that builds trust
2. **Brand Consistency:** FRSC colors (gold and green) throughout
3. **User Experience:** Intuitive navigation and clear information hierarchy
4. **Performance:** Optimized for smooth operation
5. **Accessibility:** Inclusive design for all users
6. **Scalability:** Architecture supports future features

**Next Steps:**
1. Review and approve design specifications
2. Create high-fidelity mockups in Figma
3. Develop Flutter app following these specs
4. Conduct user testing
5. Iterate based on feedback
6. Launch MVP

For questions or clarifications, refer to the web application at the provided URL or contact the design team.
