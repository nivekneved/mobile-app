# 03 Database Schema (PostgreSQL)

## Core Relational Tables
Travel Lounge has migrated to a high-integrity relational schema.

### 1. `services`
The authoritative catalog for Hotels, Tours, Activities, and Packages.
- **Columns**: `id`, `name`, `description`, `price` (base), `category_id`, `image_url`, `banner_url`.
- **Structural Upgrades**: Added `itinerary` (JSONB), `not_included` (JSONB), `included` (JSONB), and `cancellation_policy` to support complex travel products.
- **Special Flags**: `is_seasonal_deal` (mapped to **"Promotional Deal"**) and `is_coming_soon`.

### 2. `service_pricing` (The Pricing Grid)
Centralized table for all seasonal overrides, availability, and meal supplements.
- **Columns**: `id`, `service_id`, `variant_id`, `date_from`, `date_to`, `price` (Adult), `is_stop_sell`, `units_available`.
- **Occupancy Pricing**: Features the `occupancy_pricing` JSONB column for Single, Double, Triple, and Quad rates, specifically tailored for the Mauritian market.
- **Meal Supplements**: Integrated `meal_plan_pricing` (JSONB) to handle dynamic board basis upgrades.

### 3. `room_types` (Variants)
Defines specific configurations for a service (e.g., Superior Room, Deluxe Tour).
- **Columns**: `id`, `service_id`, `name`, `capacity_adults`, `capacity_children`, `image_url`, `meal_plan`, `description`.

### 4. `cms_content`
Stores page-level content and configuration.
- **Columns**: `id`, `page_slug`, `section`, `title`, `subtitle`, `content` (Rich Text), `image_url`.

### 5. `bookings` & `booking_items`
Relational tracking of reservations.
- **Columns**: `id`, `customer_id`, `total_amount`, `status`, `lead_data` (JSONB for transient form fields).

---

## Security & Access (RLS)
Row Level Security is strictly enforced:
- **Public**: Select access to services, prices, and CMS content.
- **Authenticated (Admin)**: Full CRUD access to all tables.
- **Customers**: View access to their own bookings and profile.

---

## API & RPC Logic
- **`create_booking_v1`**: Validates the payload and handles table insertion across legacy and modern order tables.
- **`get_or_create_customer_v1`**: Ensures guest profiles are unified across the ecosystem.

---

## Security
- **JWT Protection**: Secured endpoints for customer-specific actions.
- **Input Validation**: Front-end Zod schemas synchronized with database constraints.
