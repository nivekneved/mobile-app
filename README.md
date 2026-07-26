# Travel Lounge: Elite Mobile Application

A High-Engagement Concierge Interface for the Travel Lounge ecosystem, built with Expo and React Native.

---

## 📖 Standardized Documentation

| # | Doc | Purpose |
|---|---|---|
| 01 | [Overview & Ecosystem](./docs/01_overview.md) | Vision and the "Elite" tech stack |
| 02 | [Architecture & Flow](./docs/02_architecture.md) | Repository structure and screen routes |
| 03 | [Database & Data Model](./docs/03_database.md) | Supabase tables, RPCs, and mobile usage |
| 04 | [Development Guide](./docs/04_development.md) | Local setup, EAS build, and troubleshooting |
| 05 | [Development Progress Log](./docs/05_history.md) | Historical milestones and audit trail |
| 06 | [Features & Manuals](./docs/06_features_and_manuals.md) | Feature catalog & admin best practices |
| 07 | [Security & RLS](./docs/07_security_and_rls.md) | RLS policies and remediation guide |
| 08 | [Pricing & Inventory](./docs/08_pricing_and_inventory.md) | Pricing engine overview |
| 09 | [Sales Kit](./docs/09_sales_kit.md) | Mobile value propositions for stakeholders |
| 10 | [Brand & UI/UX](./docs/10_brand_and_uiux.md) | Brand identity and design standards |
| 11 | [Mobile Roadmap](./docs/11_mobile_roadmap.md) | Mobile parity audit & future roadmap |
| 11b | [Mobile Parity Audit](./docs/11_mobile_parity_audit.md) | Comprehensive parity analysis (96%) |

---

## 🚀 Quick Start
1. **Dependencies**: `npm install`
2. **Launch**: `npx expo start`
3. **Build APK**: `npx eas build --profile preview --platform android`

**Environment** — create `.env` in root:
```env
EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
EXPO_PUBLIC_API_URL=https://<web-app>.vercel.app
```

---

## 💎 Elite Alignment
For ecosystem-wide context, refer to:
- [Web Application](../web-app/README.md)
- [Admin Portal](../admin-app/README.md)
