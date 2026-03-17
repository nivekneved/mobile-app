# AGENTS.md

## 2026-03-17 - Dynamic Room Type Support
### Changes Made:
- Fixed `app/services/[id].tsx` to correctly pass `room_types` JSON data to the `BookingModal`.
- Ensured specific room types (e.g., "Ocean View" for LUX* Grand Baie) are displayed instead of stale fallbacks.

### Verified:
- Mobile app correctly reflects dynamic room options from the database.
