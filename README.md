# Travel Lounge — Mobile Application

> **Native iOS & Android mobile concierge application** for Travel Lounge Mauritius, built with React Native and Expo SDK 52.

---

## 🌟 Key Features

- **Cross-Platform Native Experience**: Built on **Expo SDK 52** and **React Native Paper** with fluid navigation and responsive layouts.
- **Flight & Tourism Discovery**: Native browsing of curated flights, hotels in Mauritius & Rodrigues, catamaran excursions, and local activities.
- **Native AI Concierge (`AIConcierge.tsx`)**: In-app AI travel assistant modal for fast flight lookup and direct WhatsApp consultation.
- **Direct WhatsApp & Phone Integration**: Instant escalation to the Travel Lounge ticketing desk (`+230 5940 7701`).

---

## 📱 App Store & Configuration Metadata

- **iOS Bundle ID**: `com.travellounge.mu`
- **Apple Developer Team ID**: `383G9QQ5CP` (Travellounge / Medic Assistance International Ltd)
- **Apple App ID**: `6794678454`
- **Apple ID**: `devenpawaray@gmail.com`
- **Android Package**: `com.travellounge.mu`

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
├── src/
│   ├── screens/              # Screen components (Home, Flights, Hotels, Bookings)
│   ├── components/           # UI components, cards & AIConcierge
│   ├── navigation/           # React Navigation stack & tab navigators
│   ├── services/             # Supabase client & API integration
│   └── theme/                # Color palettes, typography & styles
├── app.json                  # Expo app manifest & configuration
└── eas.json                  # EAS build profiles (preview, production)
```

---

## 📚 Ecosystem Documentation
- Master Rules: [`.agents/AGENTS.md`](../.agents/AGENTS.md)
- Root Overview: [`README.md`](../README.md)
- Database Reference: [`DATABASE_AND_BACKUPS.md`](../DATABASE_AND_BACKUPS.md)
