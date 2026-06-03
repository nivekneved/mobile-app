# 01 Overview & Ecosystem

## Project Mission
The **Travel Lounge Ecosystem** is a premium, high-performance travel management platform. It consists of a triple-application suite (Web, Admin, Mobile) designed to provide a "3-Click" conversion experience for guests and 100% operational visibility for administrators. All UI elements adhere to **Boutique Elite Standards**, characterized by high-fidelity aesthetics, vibrant **Red-600** branding, and smooth micro-animations.

---

## Core Pillars of the Platform
- **3-Click Conversion UX**: Minimized friction in the booking flow, prioritizing quick-select duration pills and identity-first portal entry.
- **Universal Elite Search**: Multi-module discovery for Hotels, Flights, Activities, and Cruises.
- **Interactive Booking Wizard**: A seamless reservation experience with real-time tax and pricing validation.
- **Boutique Calendar System**: A high-fidelity, centered-modal calendar that prevents layout shifts and provides clear inventory status (Available vs Stop-Sell).
- **High-Fidelity Email Ecosystem**: Professional, detailed reservation summaries and administrative alerts powered by a custom Supabase-driven email engine.
- **Global CMS Synchronization**: Real-time content propagation from the Admin Portal across all guest-facing surfaces.

---

## Technical Stack
- **Backend/Database**: Supabase (PostgreSQL, Real-time, Auth, Storage).
- **Guest Web Application**: Next.js 15+ (App Router) + React 19 with Tailwind CSS and Framer Motion.
- **Operations Admin Portal**: Vite + React 19 with Ant Design (Ant-D) and Tailwind CSS.
- **Concierge Mobile Application**: Expo SDK 52 (React Native) with Nativewind and React Native Paper.

---

## Triple-App Suite Breakdown

### 1. Guest Web Application (Next.js)
Optimized for SEO, user experience, and guest conversion. Includes dynamic calendar picking, booking wizards, and global promotional surfaces.

### 2. Operations Admin Portal (Vite + React)
Optimized for speed and high-density administrative operations, catalog uploads, and grid-based pricing managers. It serves as the single source of truth for the ecosystem configurations.

### 3. Concierge Mobile Application (Expo / React Native)
A high-engagement concierge interface. It allows users to browse luxury services, track itineraries, and connect with 1-tap support. The app aims for an "Elite 11/10" standard of visual excellence.

---

## Global Alignment
The ecosystem unifies these three authoritative layers into a single database namespace, ensuring that content, site settings, and availability updates propagate instantly across all user-facing platforms.
