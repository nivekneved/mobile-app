# 11 Mobile Parity Audit & Roadmap

## Feature Gap Matrix
A comparative audit of features present in the guest web app versus the mobile application:

| Feature | Web Status | Mobile Status | Parity Status |
| :--- | :--- | :--- | :--- |
| **AI Concierge** | Full Integration | **Native React Native Chat Thread** | **COMPLETE** |
| **Interactive Map** | SVG Map | **Native SVG Region Filter Map** | **COMPLETE** |
| **Flights Module** | Custom themed page | **WebView with Native Browser Headers** | **COMPLETE** |
| **Booking Addons** | Multi-step wizard | **Addons Selection & Occupancy Multipliers** | **COMPLETE** |
| **Pricing Engine** | `pricingEngine.ts` | **useServicePricing.ts (Aligned safety & parities)** | **COMPLETE** |

---

## Roadmap Outcomes

### Phase 1: Native Branding & Consistency (Completed)
- Standardized and synchronized mobile labels to pull dynamically from the remote CMS settings (`generalConfig?.ui_labels`).
- Upgraded the mobile `ServiceCard` layout to display ratings next to stars and compact meal plans.

### Phase 2: Functional Parity (Completed)
- Integrated dynamic booking add-ons and occupancy multipliers inside `BookingModal.tsx`.
- Constructed a native browser header (Back, Forward, and Reload controls) above the GOL WebView flight reservation engine.
- Enhanced search capabilities in `useSearchServices.ts` to crawl name, location, region, short_description, and description.

### Phase 3: "Wow" Features (Completed)
- Ported the AI Concierge assistant into a native conversation thread with pre-populated messages, typing delays, and handover transcripts to WhatsApp.
- Developed the Interactive Mauritius SVG regional selector map.
- Aligned `useServicePricing` hook with the web app's `pricingEngine.ts` rules, integrating the `isConfiguredOverride` skip-zero check, occupancy tier pricing, stop-sell gates, and lead price fallbacks.
