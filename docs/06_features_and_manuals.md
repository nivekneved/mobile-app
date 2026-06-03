# 06 Feature Catalog & Administrative Guide

## Guest-Facing Features (Web App)

### 1. Universal Search & Listing
- Crawls across Name, Location, Region, Service Type, and Description.
- Provides dynamic listing pages with scroll-to-top pagination and filter sidebars.

### 2. Interactive Booking Wizard
- Dynamic pricing engine calculation based on date range, age tiers, and meal plan overlays.
- Displays line-item breakdowns before submission and blocks stop-sold dates.

---

## Administrative Features & Best Practices

### 1. Seasonal Price Manager
The **Price Manager** (`src/pages/PriceManager.jsx`) is the core catalog control screen.
- **Grid View**: Hydrates months and days with pricing matrices.
- **Stop-Sell Toggles**: Click active/closed status triggers to disable dates instantly.
- **Sync Month**: Propagates monthly base values to child days.

### 2. Dynamic CMS Control
Manage site branding and page copy dynamically.
- **Hero Slides**: Manage slides with video and image autoplay.
- **Our Story Configurator (`OurStoryVisuals.jsx`)**: Orchestrates the Who We Are and hero identity visuals on the about page.
- **FAQ / Review Moderation**: Real-time management of FAQs and customer testimonials.

---

## Screen Audit Checklist
- **Dashboard**: High-level telemetry of booking counts and customer analytics.
- **Bookings**: Manage bookings with inline editing of guests and total amounts.
- **Services**: Bulk imports catalog items via Excel/JSON schemas.
- **Settings**: Email server configurations (SMTP host/port) and visibility toggles.
