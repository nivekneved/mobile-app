# 05 History & Agent Progress

## 2026-04-16 - Git Branch Reorganization & Environment Reversion
- **Branch Strategy Adjustment**: Executed a global branch reorganization across the `admin-app`, `mobile-app`, and `web-app` repositories to transition to a more stable development baseline.
- **Main Branch Archive**: Renamed the existing `main` branch to `main2` in all workspaces, preserving the latest experimental features for future reference.
- **Restoration of Verified Baseline**: Re-initialized the `main` branch from the `backup` branch across all three repositories, effectively reverting the primary production line to the last fully verified and stable system state.
- **PTG & PTV**: Confirmed local branch integrity and successfully synchronized the new branch structure across the local development environment.

## 2026-04-02 - Ecosystem-Wide Auth Removal & Pure Guest Experience
- **Total Auth Stripping**: Rewrote `AuthContext.tsx` to provide no session and no user identity, effectively disabling all authentication logic. (M-01)
- **Account Context Purge**: Permanently removed "Personal Information", "Preferences", and "Sign Out" sections from `profile.tsx`. (M-02)
- **UI De-authentication**: Deleted the `app/(auth)` directory and all associated login/registration forms. (M-03)
- **Session-Free Supabase**: Fully disabled session persistence and auto-refresh in `src/lib/supabase.ts` to ensure zero local storage of auth tokens. (M-04)
- **Guest Identity Realization**: Updated the profile header to show a generic "GUEST MEMBER" state with no personalized data. (M-05)

---

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
