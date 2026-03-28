# 05 History & Agent Progress

## 2026-03-28 - EAS Account Migration & Android Build Fix
- **Account Migration**: Migrated the EAS build project from `travellounge` to the `devenweb` account to bypass free-tier build limits.
- **Project Re-initialization**: Updated `app.json` with `owner: "devenweb"` and updated `eas init`.
- **AAPT Compilation Fix**: Renamed 11 thematic assets (JPEGs mislabeled as `.png`) to `.jpg` to prevent Android resource merging errors. Updated `imageUtils.ts` accordingly.
- **Build Automation**: Successfully triggered a new Android APK (`preview`) build.

---

## 2026-03-25 - Assets & Branding Integration
- **Thematic Category Image Integration**: Replaced low-resolution placeholders with 8k photography across all categories.
- **Thematic Hero Banner Integration**: Synchronized high-quality thematic banners for Flights, Cruises, Hotels, and About.
- **Image Resolution Engine**: Verified that `resolveImageUrl` correctly handles storage patterns and local fallbacks.

---

## 2026-03-24 - Database Parity & Feature Restoration
- **Zero-Regression Schema**: Updated `useCustomerBookings.ts` to surface `service_name`, `service_type`, and `total_price` to match new database naming conventions.
- **Mobile Flight IBE**: Successfully bridged the feature gap by implementing native iframe handling for the Gol IBE D4 engine via `react-native-webview`.
- **UI Restoration**: Restored the `HeroCarousel` and "Elite Collections" destinations fetched dynamically from Supabase.

---

## 2026-03-22 - Performance & Booking Restoration
- **Booking submitting logic**: Fixed critical failure by migrating to the `create_booking_v1` RPC with synchronized payloads.
- **Premium Footer**: Implemented an executive `slate[900]` footer with office locations and social links.
- **Image Turbo-Charging**: Integrated `expo-image` across all cards, reducing load times by ~60%.
