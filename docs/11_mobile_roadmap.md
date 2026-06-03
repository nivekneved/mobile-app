# 11 Mobile Parity Audit & Roadmap

## Feature Gap Matrix
A comparative audit of features present in the guest web app versus the mobile application:

| Feature | Web Status | Mobile Status | Parity Priority |
| :--- | :--- | :--- | :--- |
| **AI Concierge** | Full Integration | **MISSING** | High |
| **Interactive Map** | SVG Map | **MISSING** | Medium |
| **Flights Module** | Custom themed page | **PLAIN WEBVIEW** | High |
| **Booking Addons** | Multi-step wizard | **MISSING** | High |

---

## Roadmap

### Phase 1: Native Branding & Consistency
1. Sync mobile labels to the CMS Settings context.
2. Refine `ServiceCard` to include ratings and meal plans.

### Phase 2: Functional Parity
1. Implement the booking addons selection in `BookingModal.tsx`.
2. Build custom headers around GOL WebView.

### Phase 3: "Wow" Features
1. Port the AI Concierge chat to native React Native.
2. Develop custom Mauritius SVG regional selector.
