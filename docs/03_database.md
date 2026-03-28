# 03 Database & API Model

## Data Orchestration
The Mobile App is 100% dynamic, sourcing all inventory and content from Supabase.

### 1. Unified Discovery
Fetches from `services`, `categories`, and `hero_slides` to build the immersive homepage experience.

### 2. Concierge Data
Uses the `editorial_posts` table for the "Insights" module and `reviews` for social proof on service details.

### 3. Secure Transactions
- **Customer Identity**: Resolves via `get_or_create_customer_v1` RPC to maintain cross-platform user profiles.
- **Booking Submission**: Transmits payloads to the `create_booking_v1` RPC, ensuring compliance with tax fields and status naming conventions.

---

## Supabase Integration Patterns
- **Real-time Updates**: Subscribes to `site_settings` for dynamic footer and branding toggles.
- **Image Resizing**: Appends transformation parameters (e.g., `?width=600&height=400&resize=contain`) to Supabase storage URLs to minimize mobile bandwidth usage.

---

## Security
- **JWT Verification**: Ensures all sensitive requests carry a valid user token.
- **RLS Policies**: Adheres to strict Row Level Security to prevent unauthorized access to customer booking histories.
