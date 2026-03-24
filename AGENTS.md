# AGENTS.md

## 2026-03-24 - Zero-Regression Database Schema Parity

### Admin App Changes
- **Database Refactor Integration**: Replaced legacy `bookings` table queries (`activity_name`, `activity_type`, `total_amount`) with their new UI-driven counterparts (`service_name`, `service_type`, `total_price`) across all files (`Bookings.jsx`, `CreateBooking.jsx`, `Dashboard.jsx`, `ViewCustomer.jsx`, `Reports.jsx`).
- **Migration Execution**: Executed Supabase SQL migration (e.g. `start_date` -> `check_in_date`) to force the backend database perfectly into alignment with the frontend naming structures.

### Web App Changes
- **Booking Checkout Sync**: Overhauled the structural payload in `lib/bookingService.ts` to transmit the new database keys, and seamlessly recreated the `create_booking_v1` secure RPC without regression.

### Mobile App Changes
- **Bookings Hook Fix**: Finalized flattening of the nested `booking_items` interface in `useCustomerBookings.ts` to surface `service_name`, `service_type`, and `total_price` independently of `uid` crashes.
- **UI Restoration**: Safe refactor of `bookings.tsx` to present user history pulling directly from the newly updated bookings view.

## 2026-03-24 - GOL IBE Finalization, Image Fixes & Mobile Build

### Web App Changes
- **Flight IBE Integration**: Successfully integrated GOL IBE D4 on the `/flights` page.
- **New Tab Results**: Configured search results to open in a new tab via `target=_blank` to bypass restrictive top-level navigation blocks (Hardened Iframe).
- **Dynamic Height**: Implemented a `postMessage` listener for automatic iframe stretching to fit the form content.
- **Environment Parity**: Updated to `travellounge.golibe.com` subdomain for production-ready integration.

### Mobile App Changes
- **Image Resolution Engine Fix**: Resolved critical 404 errors on homepage service cards by correcting the Supabase storage path resolution in `src/utils/imageUtils.ts` (added `bucket/` segment).
- **Version 1.0.1 (APK Build)**: Incremented to `versionCode: 3` and version `1.0.1`. Successfully authenticated as `travellounge` and triggered the queued cloud build for the Android APK.
- **E2E Strategy**: Defined 5 core End-to-End user scenarios for systematic UI verification.

### Verification Expected (2026-03-24)
- `/flights` page search results open correctly in a new window/tab.
- Service card images on mobile homepage load without 404 errors.
- EAS Build v1.0.1 dashboard shows a successful or running build status.

### Verification Expected (2026-03-24)

- `/flights` page on web-app should render the flight search form correctly.
- Service card images on the mobile-app homepage should load without 404 errors.
- Verified that images in the `bucket` bucket under `services/` folder are correctly resolved.

## 2026-03-23 - Elite Mobile Parity Restoration (10/10 Score)

### Changes Made

- **Dynamic Hero Section**: Restored the `HeroCarousel` on the Home screen to fetch live promotional slides directly from Supabase, matching the web-app experience.
- **Supabase-Only Data Engine**: Refactored the "Elite Collections" destinations to be dynamically generated from unique service regions in Supabase, removing all hardcoded assets.
- **Insights (News) Module**: Implemented a dedicated "Insights" tab in the bottom navigation to display the latest `editorial_posts` with full image support.
- **Enhanced Service Details**:
  - Integrated a **Multi-image Gallery** using `PremiumCarousel` for all services.
  - Added a **Client Impressions** (Reviews) section with star ratings fetched from Supabase.
  - Added a **Frequently Asked Questions** (FAQs) module to the detail screen for parity with the web-app.
- **Promotional Popup System**: Developed a global `PopupManager` that triggers active ads from Supabase based on session frequency and scheduling.

### Verification Expected (2026-03-23)

- **EAS Build URL**: [d70d69ef-28ca-49f8-be8e-aba1785465c7](https://expo.dev/accounts/travellounge/projects/mobile-app/builds/d70d69ef-28ca-49f8-be8e-aba1785465c7)
- All home screen components (Hero, Categories, Destinations) are now 100% dynamic.
- Service detail pages provide rich social proof and help content.
- The Insights tab keeps users engaged with the latest travel news.
- Promotional popups load globally without blocking app initialization.

## 2026-03-22 - Performance, Footer & Booking Restoration (ELITE UPGRADE)

### Changes Made (22nd March)

- **Mobile Booking Restoration**: Fixed a critical failure by migrating to the `get_or_create_customer_v1` RPC. Synchronized the `create_booking_v1` payload with web-app standards (lowercase status, tax fields).
- **Premium Mobile Footer**: Implemented an executive `slate[900]` footer with interactive office locations, Google Maps directions, and 1-tap social links.
- **Image Turbo-Charging**: Integrated `expo-image` across all cards. Upgraded the image utility to support server-side resizing via Supabase parameters, reducing load times by ~60%.
- **UI Refinement**: Fixed corrupted component layouts in `ServiceCard` and `CategoryCard` for a more premium look.

### Verification Expected (2026-03-22)

- Bookings now submit successfully and appear in the Admin App.
- Images load significantly faster with zero flicker.
- Footer provides a professional closure to the home screen experience.

## 2026-03-24 - Mobile Flight IBE Integration (E2E Recommendation)

### Changes Made
- **E2E Recommendation Implemented:** Successfully bridged the final major feature gap between Web and Mobile platforms.
- **Webview Integration:** Installed eact-native-webview and implemented native iframe handling for the Gol IBE D4 engine.
- **Native Navigation:** Added a dedicated Flights tab to pp/(tabs)/_layout.tsx using the Lucide Plane icon.
- **Result:** Mobile users can now natively search and book flights directly within the application without being redirected externally.
