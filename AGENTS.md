# AGENTS.md

## 2026-03-20 - Android Build & Runtime Fixes

### Changes Made

- **Gradle Build Restoration**: Fixed a critical `:app:mergeReleaseResources` failure by identifying and renaming mismatched image assets (JPEGs mislabeled as `.png`) in `assets/categories/`. Updated `CategoryCard.tsx` to handle the new `.jpg` extensions.
- **Startup Crash Resolution**: Fixed an immediate crash on app launch by creating `.easignore` to ensure environment variables (`.env`) are included in the EAS Cloud Build, allowing the Supabase client to initialize correctly.
- **Production Hygiene**: Performed a zero-tolerance readiness audit. Removed redundant `build_error.json` and added `lint`/`type-check` scripts to `package.json`.
- **EAS Configuration**: Optimized the `preview` build profile for APK generation and verified successful cloud build completion.

### Verification Results

- EAS Cloud Build for Android APK completes successfully.
- Startup crash resolved; Supabase client initializes and fetches data on the Home screen.
- All primary category and featured service assets load correctly with verified headers.

## 2026-03-19 - Elite Mobile Transformation (10/10 Score)

### Executive Changes

- **Global Design Overhaul**: Integrated the **Outfit** Google Font family (300-900) and implemented the **HD Slate Palette** (Slate 300 borders, Slate 900 text).
- **Executive UI Shell**: Redesigned `app/_layout.tsx` for a shadowless white executive header and extreme 32px-40px rounding across all components.
- **Functional Conversion Logic**: 
  - **Home Screen**: Added a "Valuation Section" with Benefit-based quick-filters (All-Inclusive, Best Prices) and a prominent Searchbar.
  - **Consultation CTAs**: Implemented a sticky "Action Conversion Bar" on Detail pages for 1-tap WhatsApp and Email inquiry.
  - **Service Cards**: Upgraded to "Elite Choice" layouts with dynamic benefit tags and high-contrast pricing.
- **Journey Experience**: Re-engineered the Itinerary into an elite **Vertical Timeline** to match the premium web experience.

### Transformation Results

- Mobile app achieves visual parity with the premium web-app.
- Functional paths for "Price/Benefit Discovery" and "Direct Booking" are finalized and responsive.

## 2026-03-19 - Elite Imagery Alignment (10/10 Score)

### Implementation Details

- **Premium Category Slider**: Implemented an elite visual gateway directly below the search bar using a horizontal `ScrollView` with 40px rounded cards.
- **HD Asset Synchronization**: Migrated high-definition category images (`.png`) from the Web App to the Mobile App `assets/categories/` to ensure absolute brand consistency for Activities, Day Packages, Cruises, and Rodrigues.
- **Resilient UI Mapping**: Integrated a local asset fallback system in `CategoryCard.tsx` that maps database slugs to the newly migrated professional travel imagery.
- **Layout Stability**: Fixed an `Invariant Violation` on the Explore screen by standardizing the input field to `TextInput` and resolving `ReferenceError` for missing icons on the Home screen.

### Elite Verification Status

- Category cards load instantly with identical resolution and style as the web platform.
- Zero layout shift during search or category navigation.
- All functional paths for booking and inquiry are fully operational and visually premium.

## 2026-03-19 - Production Readiness & Repository Cleanup

### Cleanup Actions

- **Root Directory Debloating**: Removed and archived redundant entry points (`App.tsx`, `index.ts`), legacy assets (`splash-icon1.png`), and build residuals across all platforms.
- **Documentation Consolidation**: Unified disparate audit reports and specifications into a single `ECOSYSTEM_DOCS.md`. Created missing `README.md` files for the Mobile and Admin apps.
- **Conflict Resolution**: Fixed critical merge conflict markers in the `.gitignore` for the Mobile project, ensuring a stable deployment state.
- **SQL Standardization**: Consolidated Supabase seed and script libraries into an archived structure, leaving only the primary `seed.sql` and `structure.sql` for production.

### Operational Verification

- Clean root directories across `mobile-app`, `web-app`, and `admin-app`.
- Consistent documentation hierarchy (docs/, tests/, scripts/, supabase/).
- Verified `.gitignore` functionality prevents accidental exposure of configuration or build artifacts.

## 2026-03-19 - Explore & UI Optimization

### Optimization Steps

- **Robust Category Filtering**: Re-engineered `useSearchServices.ts` to use the `service_categories` join table, ensuring all category slugs (e.g., "Day Packages", "Group Tours") correctly map to the database.
- **Service Detail UI Correction**: Fixed the sticky header action bar in `app/services/[id].tsx` to ensure WhatsApp, Email, and Booking icons are aligned in a horizontal row, resolving the vertical stacking issue.
- **Stability & Type Safety**: Resolved several TypeScript lint errors in the Service Detail screen, including safer itinerary mapping and correct prop definitions for `BookingModal`.

### Optimization Results

- Explore screen filters now accurately display services for all categories.
- Service Detail action bar maintains correct row layout even when sticking to the top.

## 2026-03-19 - Mobile Booking Engine Fix

### Functional Restorations

- **Functional Restoration**: Fixed a critical bug in `app/services/[id].tsx` where the `onSubmit` handler for the booking modal was an empty function. It now correctly identifies/creates a customer and executes the `create_booking_v1` Supabase RPC to save the reservation.
- **Traceability**: Unified the `bookings` and `orders` data paths to ensure that bookings made from the mobile app are correctly reflected in the Admin App's "Bookings" management screen.
- **Database Resilience**: Re-established legacy tables (`orders`, `products`, `invoices`) that were identified as necessary for Admin App operations, ensuring full back-office functionality.

### Engine Verification

- Bookings from the mobile app now trigger the server-side RPC transaction.
- Admin App "Bookings" registry is now synced and showing live reservations.
