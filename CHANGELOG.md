# Changelog — Mobile Native App (`mobile-app`)

All notable changes to the Travel Lounge Mobile App (iOS & Android) are documented in this file.
Format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased] - 2026-10-06

### Changed
- Verified ecosystem phone routing consistency (`+230 5256 9840` for Flights AI Concierge, `+230 5256 9838` for Leisure, `+230 5940 7711` for Ticketing).

---

## [1.2.0] - 2026-10-01

### Compliance & App Store
- **Apple Store Guidelines Compliance (App ID: 6794678454)**:
  - Account Deletion button in `profile.tsx` strictly following Apple Guideline 5.1.1(v).
  - Ensured zero in-app purchases (IAP) and zero 3rd-party ad trackers.
  - No payment gateways in-app; all transactions route via concierge or direct invoice dispatch.

### Performance
- **Batched Query Optimization**:
  - Replaced N+1 query loops on `service_pricing` and `room_types` with batch `.in('service_id', serviceIds)` lookups and Map hash indexing.
- **Offline & Cache Hardening**:
  - Cached catalog metadata for immediate cold-start render.
