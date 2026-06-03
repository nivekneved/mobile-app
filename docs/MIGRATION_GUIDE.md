# WordPress to New Web App Migration Guide

> [!NOTE]
> **Migration Status: COMPLETE** — The WordPress-to-TravelLounge migration was completed in early 2026.
> This document is kept for reference and historical context only.
> The migration scripts (`wordpress-migration.ts`, `woocommerce-migration.ts`) remain in `scripts/` as read-only references.

This guide explains how to migrate data from a WordPress website to the Travel Lounge web application.

## Prerequisites
1. Access to your WordPress website.
2. Environment variables configured for your Supabase connection.

## Running the Migration

### For WordPress Posts/Pages/Media:
```bash
npx ts-node scripts/wordpress-migration.ts
```

### For WooCommerce Products:
```bash
npx ts-node scripts/woocommerce-migration.ts
```
