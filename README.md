# Travel Lounge — Mobile Application

> **Native iOS & Android mobile concierge application** for Travel Lounge Mauritius, built with React Native and Expo SDK 52.

---

## 🌟 Key Features

- **Cross-Platform Native Experience**: Built on **Expo SDK 52** and **React Native Paper** with fluid navigation and responsive layouts for both iPhone and iPadOS tablets.
- **Flight & Tourism Discovery**: Native browsing of curated flights, hotels in Mauritius & Rodrigues, catamaran excursions, and local activities.
- **Native AI Concierge (`AIConcierge.tsx`)**: In-app AI travel assistant modal with flight lookup and direct WhatsApp Voice & Chat desk integration.
- **Responsive Booking Engine (`BookingModal.tsx`)**: Full iPadOS-optimized booking and inquiry workflow with interactive iOS modal date pickers and instant validation alerts.
- **In-App Account & Data Deletion (`profile.tsx`)**: Apple Guideline 5.1.1(v) compliant in-app data wiping and session termination.
- **Direct WhatsApp & Phone Integration**: Instant escalation to the Travel Lounge ticketing desk (`+230 5940 7701`).

---

## 📱 App Store & Configuration Metadata

- **App Version / Build**: `1.3.2` (iOS Build `5`, Android VersionCode `19`)
- **iOS Device Family**: iPhone (`supportsTablet: false` - standard 1x/2x iPad emulation)
- **iOS Bundle ID**: `com.travel-lounge.mu`
- **Apple Developer Team ID**: `383G9QQ5CP` (Travellounge / Medic Assistance International Ltd)
- **Apple App ID**: `6794678454`
- **Apple ID**: `devenpawaray@gmail.com`
- **Android Package**: `com.travellounge.mu`
- **Privacy Policy URL**: `https://travellounge.mu/privacy`
- **Support URL**: `https://travellounge.mu`

---

## 🛡️ Business Model & App Store Compliance Declarations

1. **No Online Payments**: The app operates purely as a discovery, concierge, and inquiry dispatch engine. No direct in-app payment transactions or credit card gateways are executed inside the mobile app.
2. **No In-App Purchases (IAP)**: 100% free app without digital subscriptions, locked features, or paid consumables (exempt from Apple IAP).
3. **No Advertisements (No Ads)**: Zero third-party advertising SDKs, ad banners, popups, or user-tracking frameworks (IDFA / ATT not required).
4. **Apple Privacy Manifest**: Declares `NSPrivacyTracking: false`, collected lead contact data (Name, Email, Phone) linked strictly for App Functionality, and `NSPrivacyAccessedAPICategoryUserDefaults` (`CA92.1`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- Expo CLI (`npm install -g expo-cli` or `npx expo`)
- EAS CLI (`npm install -g eas-cli`)

### Installation & Local Development
```bash
cd mobile-app
npm install
npx expo start
```
Scan the QR code with Expo Go (Android) or the Camera app (iOS).

### Type Checking & Build Verification
```bash
npx tsc --noEmit
```

### Production EAS Builds
```bash
# Android APK / AAB
npx eas build --profile preview --platform android
npx eas build --profile production --platform android

# iOS App Store Build
npx eas build --profile production --platform ios
```

---

## 🔑 Environment Configuration (`.env`)

```env
EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
EXPO_PUBLIC_API_URL=https://www.travellounge.mu
```

---

## 📂 Key Directory Layout

```
mobile-app/
├── app/                      # Expo Router tabs and modal screens
│   ├── (tabs)/               # Tab screens (Home, Explore, Flights, Wishlist, Profile)
│   ├── services/[id].tsx     # Package detail view & inquiry submission
│   ├── tailormade.tsx        # Custom itinerary request form
│   └── _layout.tsx           # Root navigation & theme provider
├── src/
│   ├── components/           # UI components, modals (BookingModal, FilterModal, AIConcierge)
│   ├── context/              # Auth, Wishlist, Settings providers
│   ├── lib/                  # Supabase client & i18n
│   ├── theme/                # Color palettes & typography tokens
│   └── utils/                # Navigation & image resolution helpers
├── app.json                  # Expo app manifest & Apple Privacy Manifest
└── eas.json                  # EAS build profiles (preview, production)
```

---

## 📚 Ecosystem Documentation
- Master Rules: [`.agents/AGENTS.md`](../.agents/AGENTS.md)
- Root Overview: [`README.md`](../README.md)
- Database Reference: [`DATABASE_AND_BACKUPS.md`](../DATABASE_AND_BACKUPS.md)
