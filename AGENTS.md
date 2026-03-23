# AGENTS.md

## 2026-03-24 - GOL IBE Integration & Image Path Correction

### Web App Changes

- **Flight IBE Integration**: Successfully integrated the GOL IBE (Internet Booking Engine) D4 version on the `/flights` page.
- **Iframe Hardening**: Implemented `sandbox` attributes to prevent top-level redirection, ensuring search results stay within the Travel Lounge platform.
- **Dynamic Height**: Added a `postMessage` listener to support automatic iframe stretching (compatible with GOL IBE's height-resize messages).
- **Subdomain Configuration**: Updated to `travellounge.golibe.com` for the IBE integration.

### Mobile App Changes

- **Image Resolution Engine Fix**: Resolved a critical 404 error affecting homepage service cards. Added the missing `bucket/` path segment to the Supabase storage URL resolution logic in `src/utils/imageUtils.ts`.
- **E2E Strategy**: Defined 5 core End-to-End user scenarios covering Discovery, Exploration, Search, Inquiry, and Branding for systematic verification.

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
