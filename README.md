# Travel Lounge: Elite Mobile Application

A High-Engagement Concierge Interface for the Travel Lounge ecosystem, built with Expo and React Native.

---

## 🏗️ Technical Stack

- **Framework**: Expo SDK 52 (React Native).
- **Styling**: Nativewind (Tailwind for Native).
- **Components**: React Native Paper, Premium Custom Carousels.
- **Backend**: Supabase (PostgreSQL, Real-time, Auth).

---

## 💎 Elite Standards (11/10 Goal)

- **Typography & Branding**: Standardized on **Outfit Black (900)** and **Slate-300** high-definition palette.
- **Visual Parity**: Shared asset directory and standardized UI components across all platforms.
- **Extreme Rounding**: 32px-40px rounding on all cards, buttons, and headers.
- **Conversion Focus**: 1-tap WhatsApp/Email concierge paths.

---

## 🛠️ Functional Capabilities

- **Universal Search**: Discover Hotels, Flights, and Activities.
- **Itinerary Management**: 100% dynamic data from Supabase.
- **Insights (News)**: Integrated editorial module for travel trends.

---

## 📁 Repository Structure

- **app/**: Expo Router based screens and navigation.
- **src/components/**: Elite modular UI components (ServiceCard, CategoryCard).
- **src/theme/**: Centralized design tokens (colors, typography).
- **docs/**: Project documentation and archives.
- **scripts/**: Utility and inspection tools.
- **tests/**: Unit and integration testing suites.

---

## 📖 Global Documentation

- [AGENTS.md](file:///c:/Users/deven/Desktop/mobile-app/AGENTS.md): Full development log and audit trail.
- [PROJECT_RULES.md](file:///c:/Users/deven/Desktop/mobile-app/PROJECT_RULES.md): Mandatory architectural and code standards.

---

## 🚀 Setup & Launch

1. **Clone the repository**.
2. **Environment Specs**: Configure `.env` with Supabase keys.
3. **Build APK**:
   ```bash
   npx eas build --profile preview --platform android
   ```
4. **Development**:
   ```bash
   npx expo start
   ```
