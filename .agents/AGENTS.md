# Travel Lounge Ecosystem — Master System Rules & Architecture

> **Master System Truth**: Authoritative guide for developers, AI assistants, deployment runners, and disaster recovery operators across the Travel Lounge ecosystem.

---

## 1. Master System Credentials & Integration Keys

All production secrets and private API keys live in the gitignored `access` file.

### 🗄️ Supabase Database & Storage
* **Project Reference ID**: See `access`
* **API URL & Anon Key**: See `access` / `.env`
* **Default Storage Bucket**: `bucket`

---

### 🍏 Apple Developer & iOS App Store
* **Apple App ID**: `6794678454`
* **Bundle Identifier**: `com.travellounge.mu`
* **Live App Store URL**: [https://apps.apple.com/app/travellounge-mauritius/id6794678454](https://apps.apple.com/app/travellounge-mauritius/id6794678454)
* **Short ID Deep-Link**: [https://apps.apple.com/app/id6794678454](https://apps.apple.com/app/id6794678454)
* **Developer Account & Team ID**: See `access`

---

### 🤖 Google Play Store & Android
* **Package Name**: `com.travellounge.mu`
* **Live Google Play Store URL**: [https://play.google.com/store/apps/details?id=com.travellounge.mu](https://play.google.com/store/apps/details?id=com.travellounge.mu)
* **Universal Smart Detection Router**: `https://travellounge.mu/app`

---

### 💬 WhatsApp AI Flight Concierge & Autonomous Gateway
* **Flight AI Concierge & Primary Ticketing Desk**: `+230 5256 9840` (`23052569840`)
* **Live Autonomous Cloud Gateway (Render 24/7)**: [https://whatsapp-flight-addon.onrender.com](https://whatsapp-flight-addon.onrender.com)
* **Keep-Alive Ping Endpoint (UptimeRobot)**: `https://whatsapp-flight-addon.onrender.com/ping`
* **Gateway Technology**: Self-Hosted Baileys Multi-Device Web Gateway (Zero-Quota, Unlimited Messaging, Instant Live GolIBE GDS Fares)
* **Session Lifecycle**: Strict auto-reset on new search requests; zero stale data reuse across prior inquiries
* **Leisure & Tours Desk**: `+230 5256 9838` (`23052569838`)
* **Head Office Telephone**: `+230 212 4070`
* **Head Office Email**: `reservation@travellounge.mu` / `inquiry@travellounge.mu`
* **Meta WABA ID, Phone ID & Verify Token**: See `access`

---

### 📞 Twilio WhatsApp Fallback Gateway
* **Twilio SID & Auth**: See `access`
* **Webhook Target URL**: `https://whatsapp-flight-addon.vercel.app/api/webhook`

---

### ✈️ Flight GDS Engine & AI Models
* **GolIBE Flight Engine Base URL**: `https://travellounge.golibe.com`
* **GolAPI Direct JSON GDS Endpoint**: `https://golapi.golibe.com/json.php` (Requestor: `travellounge.golibe.com`, Action: `SearchFlightsExtendedRequest_2`)
* **GolIBE Results Deep Link Format**:
  ```
  https://travellounge.golibe.com/results?from={ORIGIN}&to={DEST}&flightClass=ECO&departureDate={YYYY-MM-DD}&returnDate={YYYY-MM-DD}&ADT={PAX}
  ```
* **OpenAI Intent Parsing Model**: `gpt-4o-mini`
* **OpenAI Voice Note Transcription Model**: `whisper-1`

---

## 2. Core Business Rules & Operating Logic

1. **Lead Price Calculation Standard**:
   * For **Hotels**: Default lead price represents double occupancy sharing (`occ["2"]` or `price`).
   * For **Tours / Activities / Packages**: Lead price represents single adult package base rate.
   * Lead pricing checks `is_stop_sell = false` and active date boundaries (`lte('date_from', today).gte('date_to', today)`).
2. **Flight AI Concierge & Live GDS Price Policy (Zero-Estimate Standard)**:
   * **Rule**: **NEVER DISPLAY STATIC PRICE ESTIMATES OR BENCHMARK MULTIPLIERS FOR FLIGHTS**.
   * All flight searches and quote generation across `AIConcierge.tsx` and `/api/flights/live` must query the live GDS engine (`golapi.golibe.com`) in real-time.
   * Every quote card displays verified live GDS market fares, exact airlines, flight times, stops, luggage allowances, and direct GolIBE deep links.
3. **Dynamic Brand Engine Rules (`useBrand.ts`)**:
   * If URL or category context is **Leisure / Tours / Excursions**, the interface displays the Leisure brand identity and routes WhatsApp chats to `+230 5256 9838`.
   * Default / Corporate flight bookings route WhatsApp chats to `+230 5940 7701`.
   * For Rodrigues packages, append brand query parameters (`?brand=normal`) to maintain theme consistency.
4. **Marketing & Mass Emailing Status**:
   * **Status**: Re-enabled as a configurable modular ecosystem addon (`mass_email`).
   * **Rule**: Governed via Addon Manager (`/addons`); can be activated or deactivated at any time. When activated, Mass Emailing appears in the Admin sidebar navigation and `/mass-emailing` is accessible.
5. **Mobile App Store Compliance Rules**:
   * **No In-App Payments**: Pure discovery & concierge dispatch engine; no credit card processing in the mobile app.
   * **No In-App Purchases (IAP)**: 100% free app without paywalls or subscriptions.
   * **No 3rd Party Ads**: Zero tracking frameworks; IDFA/ATT not required.
   * **Account Deletion**: Apple Guideline 5.1.1(v) compliant in-app data deletion button located in `profile.tsx`.

---

## 3. The 19 Modular Commercial Addons & Operating Rules

All addons operate on a **Term Subscription Architecture** (365-day boundary with live countdown, days-remaining warnings, and 1-click renewal via MCB Juice EMVCo QR or official license key):

| # | Addon ID | Name | Category | License Price | Market Alt. | Deactivation Behavior |
| :-: | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | `golibe_engine` | GolIBE Flight & GDS Engine | Flights | **Rs 15,000 / yr** | Rs 22,500 / yr | Flights nav link & `/flights` vanish; deep checkout links disabled. |
| 2 | `whatsapp_bot` | WhatsApp AI Flight Concierge | AI & Automation | **Rs 40,000 setup + Rs 3,000 / yr** | Rs 49,500 | Floating AI bubble & quick pills hidden; chats fallback to `+230 5940 7701`. Dynamic `serviceFeePercentage` markup applied. |
| 3 | `payments_gateway` | Payments & Multi-Currency Gateway | Finance | **Rs 5,000 1-time setup** | Rs 7,500 | Instant checkout switches to agent WhatsApp quote dispatch & offline invoices. |
| 4 | `mass_email` | Mass Emailing Broadcaster | Marketing | **Rs 4,500 / yr** | Rs 6,000 / yr | Governed via `/addons`. When deactivated, Mass Emailing nav link vanishes from sidebar. |
| 5 | `itinerary_pdf_generator` | Branded Itinerary PDF Generator | Sales | **Rs 4,500 / yr** | Rs 6,000 / yr | Proposal download and PDF export buttons in booking details are hidden. |
| 6 | `loyalty_club_rewards` | VIP Club & Loyalty Rewards Pass | Retention | **Rs 4,000 / yr** | Rs 5,300 / yr | Loyalty points badges and tier cards are hidden from customer accounts. |
| 7 | `tv_screen_showcase` | Salon Prêt-à-Partir TV Engine | Event Display | **Rs 3,500 / yr** | Rs 5,000 / yr | Admin TV display settings and presentation launchers are disabled. |
| 8 | `promotional_deals_hub` | Promotional Deals Hub | Flash Sales | **Rs 3,500 / yr** | Rs 5,000 / yr | Section strictly hidden if no active `is_seasonal_deal` items; zero-fallback standard. Route `/promotional-deals` hidden from header. |
| 9 | `custom_pages_builder` | Dynamic Custom Pages Builder | Content & CMS | **Rs 3,000 / yr** | Rs 9,000 / yr | Custom Pages tab in `/cms` vanishes; published pages remain safe in database. |
| 10 | `travel_news_blog` | Travel News & Editorial Blog | Content & SEO | **Rs 3,000 / yr** | Rs 8,500 / yr | News Editor nav in Admin vanishes; homepage news carousel is hidden. |
| 11 | `knowledge_base_faq` | Dynamic Knowledge Base & FAQ | Support | **Rs 2,000 / yr** | Rs 7,200 / yr | FAQs nav item in Admin vanishes; public `/faq` route redirects to homepage; accordions suppressed. |
| 12 | `mobile_universal_links` | Universal Smart Router (`/app`) | Mobile | **Rs 3,000 / yr** | Rs 4,000 / yr | Mobile app download promo banners on mobile web are suppressed. |
| 13 | `reviews_social_proof` | Customer Reviews & Social Proof | Trust | **Rs 3,000 / yr** | Rs 4,000 / yr | Reviews nav item in Admin sidebar vanishes; verified review shields and Google ratings hidden. |
| 14 | `hero_promo_ticker` | Hero Banner Promo Ribbon | Conversion | **Rs 2,500 / yr** | Rs 3,500 / yr | Glassmorphism promo ribbon above/below search bar vanishes completely. |
| 15 | `marketing_popups` | Marketing Popups & Announcement Modals | Conversion | **Rs 2,500 / yr** | Rs 3,500 / yr | Admin popup ads menu vanishes; popup arrival modals stop triggering. |
| 16 | `multi_currency_switcher` | Multi-Currency Switcher & Forex | Finance | **Rs 2,500 / yr** | Rs 2,950 / yr | Currency selector dropdown in header & drawer hidden; catalog renders in MUR. |
| 17 | `mauritius_marine_weather` | Marine Weather Widget | Weather | **Rs 2,500 / yr** | Rs 2,800 / yr | Real-time sea condition and swell forecast widgets on marine pages are hidden. |
| 18 | `multi_language_translator` | Multi-Language Translation Studio | Localization | **Rs 3,500 / yr** | Rs 14,000 / yr | Translation Studio tab in `/cms` vanishes; public frontend renders in base English. |
| 19 | `financial_reports` | Financial Reports & Analytics Suite | Analytics | **Rs 3,500 / yr** | Rs 12,000 / yr | Reports nav item in Admin sidebar vanishes; direct route displays 1-click upgrade state. |
| **TOTAL** | **Full 19-Addon Suite** | | | **Rs 71,500 / yr** | **Rs 134,750 / yr** | **Save Rs 63,250 / yr (~46.9% Overall Savings across the suite)** |

---

## 4. Engineering & Performance Architecture

1. **Zero-Data-Loss Maintenance Policy**:
   * **Rule**: **NEVER DELETE ANY ROWS FROM DATABASE TABLES** during optimizations, maintenance, or cleanup. All database optimizations must be non-destructive.
2. **Mobile Query Batching Standard**:
   * Always batch child queries (`service_pricing`, `room_types`) with `.in('service_id', serviceIds)` and map them via `Map<string, any[]>` hash index. Never use N+1 `serviceIds.map(id => query(id))` loops.
3. **Web Caching & ISR Standard**:
   * Public static catalog pages use 5-minute Incremental Static Regeneration (`export const revalidate = 300`).
   * Static settings (`SettingsContext`) and CMS content blocks (`usePageContent`) use a 5-minute in-memory cache to prevent re-querying Supabase on internal page clicks.
4. **Admin Code-Splitting & Vite Manual Chunks**:
   * Granular route code-splitting with `React.lazy` and `Suspense`.
   * Vite `manualChunks` vendor splitting isolates React, Lucide, and Supabase libraries, guaranteeing sub-second response times across the 294k rate matrix.
5. **Supabase Storage Governance**:
   * Run `node scripts/prune_orphaned_storage.js` to purge unreferenced images while preserving all active database rows and static HTML references.
   * Pre-compress client uploads > 1MB (`maxWidth: 1600, quality: 0.7`) to keep storage below 1 GB.

---

## 5. Security & Anti-Spam Architecture

1. **Role-Based Access Control (RBAC)**:
   * Sensitive Administrative controls (`/team`, Team & Access management, System Controls, destructive settings) are strictly restricted to accounts with `role === 'super_admin'`. Standard administrators are denied access and redirected.
2. **Fail-Safe Session Hydration**:
   * Admin portal `AuthContext` implements synchronous local cache hydration with graceful network fallback, eliminating authentication race conditions and blank-screen flashes upon page refresh.
3. **Content Security Policy (CSP)**:
   * Next.js web application enforces strict CSP headers with explicit `frame-src` and `script-src` whitelist for Google Maps embeds and trusted travel partner widgets.
4. **Honeypot Bot Defense**:
   * All public customer forms (newsletter, inquiry, contact) contain a hidden `honeypot` field. If filled, the system silently traps the bot with a simulated success response.
5. **Heuristic Email Validation**:
   * Table `inquiries` and form handlers enforce regex `^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`.
   * Rejects suspicious patterns (triple-dots `...`, excessive sub-dots `> 4`, or repeated characters `\w\1{4,}`). Fallback email: `inquiry@travellounge.mu`.
6. **Row-Level Security (RLS)**:
   * Public role (`anon`) has read-only access to published active catalog tables; write operations require authenticated or service-role permissions.
7. **Mobile Credential Isolation**:
   * Native client builds strictly isolate API credentials; fallback hardcoded Supabase project URLs and tokens are eliminated from client utility bundles.

---

## 6. Event Showcase & TV Display Engine

* **Event**: Salon Prêt-à-Partir 2026 @ SVICC Pailles (28, 29 & 30 Aug 2026)
* **Primary Fullscreen TV Presentation**: [https://travellounge.mu/tv-svicc](https://travellounge.mu/tv-svicc)
* **Static Fallback HTML Links**:
  - `https://travellounge.mu/tv-svicc.html`
  - `https://travellounge.mu/svicc.html`
  - `https://travellounge.mu/TV-SVICC-TRAVEL-LOUNGE.html`
* **Hosted Video Asset**: [https://travellounge.mu/assets/videoTL.mp4](https://travellounge.mu/assets/videoTL.mp4)
* **Dynamic Builder Event Page**: [https://travellounge.mu/deven](https://travellounge.mu/deven)

---

## 7. Master Ecosystem Backup & Disaster Recovery Architecture

* **Backup Runner Command**: `node scripts/master_ecosystem_backup.js`
* **Latest Full Production Snapshot**: `backups/backup_2026_10_02_18_02_45`
* **Active Snapshot Retained**:
  - `backup_2026_10_02_18_02_45` (Latest Production)
  - `backup_2026_10_01_18_33_45` (Previous Baseline)
  - `backup_2026_09_25_20_37_53` (Baseline Release)
* **Git Repositories Protected (4 Repos)**:
  - `admin-app` (`admin-app-all-branches.bundle`)
  - `web-app` (`web-app-all-branches.bundle`)
  - `mobile-app` (`mobile-app-all-branches.bundle`)
  - `whatsapp-flight-addon` (`whatsapp-flight-addon-all-branches.bundle`)
* **Database Tables Backed Up**: 29 public tables (**323,868 total records**, including all 323,025 `service_pricing` records) via Keyset Pagination.
* **1-Click Restore Mechanisms**:
  - Windows Batch: `.\restore_all.bat` inside the snapshot directory
  - Node.js Script: `node restore_database.js`
  - PowerShell Script: `powershell -ExecutionPolicy Bypass -File restore_branches.ps1`
  - Shell Script: `bash restore_branches.sh`
  - Admin App UI: `/backup` ➔ **Easy 1-Click Database Restore** with live progress tracking
* **Latest Pointer Files**: `backups/database/latest_backup.json` & `backups/database/latest_data.sql`

---

## 8. Master Standard Operating Procedures (In Practice Workflow)

Execute every task following this chronological 5-phase lifecycle:

### Phase 1: Intake & Alignment
1. **Direct Communication**: Speak in simple, direct words in present tense. Keep explanations short. Provide clickable links for all referenced files and symbols.
2. **Diagnosis Before Code**: Always identify the exact root cause first. Never write theoretical essays or invent excuses; address the concrete issue.
3. **Approval & Alignment**: Ask approval before major changes. When the user says "yes" or "ok", execute immediately. If the user corrects course, stop instantly and re-align.
4. **Single Source of Truth**: Treat `.agents/AGENTS.md` and `access` as authoritative. Keep all documentation synchronized with actual code changes.

### Phase 2: Safety & Data Protection
5. **Zero Data Loss**: Never delete any rows from database tables. Run master backup (`node scripts/master_ecosystem_backup.js`) before any destructive or major schema operations.
6. **Credential Hygiene**: Keep master secrets and private keys strictly in the local `access` file. Ensure `access`, `access.*`, and `.env` remain completely gitignored across all repos.
7. **Anti-Spam & Input Defense**: Protect public customer forms with hidden honeypot traps and RFC email regex validation before database insertion.

### Phase 3: Engineering & Performance Standards
8. **Batched Queries (No N+1)**: Never write N+1 query loops. Batch child queries (`service_pricing`, `room_types`) with `.in('service_id', ids)` and Map hash indexing.
9. **Caching & ISR**: Enforce 5-minute ISR (`revalidate = 300`) on public static pages and 5-minute in-memory SWR caching for settings and CMS blocks.
10. **Storage Governance**: Pre-compress client image uploads > 1MB before uploading to Supabase. Prune orphaned storage files safely without touching database rows.
11. **Clean Code & Code-Splitting**: Keep code clean, readable, and maintainable. Use `React.lazy` and vendor chunk splitting to protect performance on high-volume tables.

### Phase 4: Business Rules & Compliance
12. **Brand & Phone Routing**: Route Leisure/Tour inquiries to `+230 5256 9838` and Corporate/Ticket inquiries to `+230 5940 7701`. Maintain consistent branding across all sub-apps.
13. **Zero-Estimate Live GDS**: Never display static flight price estimates. Query live GDS fares via GolIBE in real-time and apply configured service fee markup.
14. **App Store Compliance**: Ensure mobile app remains 100% free, zero IAP, zero 3rd-party ads, provides in-app account deletion, and uses direct one-tap mobile download links.
15. **Feature Flags & Gating**: Keep mass emailing and promotional deals pages hidden from public navigation until explicitly requested.

### Phase 5: Verification & Delivery
16. **Build & Responsive Testing**: Always run verification builds (`next build`, `tsc --noEmit`, etc.) and verify UI across mobile phones, tablets, TV displays, and desktop browsers before pushing.
17. **Complete Execution**: Finish tasks end-to-end so that the production ecosystem works in the real world with zero loose ends.

---

## 9. Multi-Agent Collaboration & Cross-Repository Coordination ("Use Each of Us Among Ourselves")

When multiple AI agents or pair programmers operate across the ecosystem repositories, all agents act as a unified, coordinated collective adhering to these cross-agent rules:

### 1. The 4 Specialist Ecosystem Roles & Scopes

| Agent Role | Repository | Technology Stack | Core Scope & Responsibilities |
| :--- | :--- | :--- | :--- |
| 🛡️ **Admin Portal Agent** | `admin-app` | React 18, Vite, TailwindCSS, Supabase | Backoffice CMS, rate matrix editor, 19 modular addon management, mass email campaign builder, staff RBAC permissions, and 1-click database restore UI (`/backup`). |
| 🌐 **Web Frontend Agent** | `web-app` | Next.js App Router, Turbopack, TypeScript | Public customer portal, live GolIBE GDS flight API (`/api/flights/live`), dynamic brand switching (`useBrand.ts`), SEO metadata, multi-currency switcher, and route redirects. |
| 📱 **Mobile Native Agent** | `mobile-app` | React Native, Expo, TypeScript | Native iOS & Android apps (`com.travellounge.mu`), App Store compliance (zero IAP, zero ads), Apple 5.1.1(v) account deletion in `profile.tsx`, and batch query optimization. |
| 💬 **WhatsApp Concierge Agent** | `whatsapp-flight-addon` | Node.js, Vercel Serverless, OpenAI | Meta WABA & Twilio webhooks, GPT-4o-mini flight intent extraction, Whisper-1 voice note transcription, live GDS card formatting, and hotline dispatch routing. |

---

### 2. Cross-Agent Hand-off & Collaboration Protocols

1. **Contract-First Synchronization**:
   * Whenever an agent updates a database table, API endpoint, or static asset in one repository, it must verify and update the downstream consumers across all affected repositories.
2. **Shared Asset Pipeline Standard**:
   * High-resolution visual assets (e.g. `public/assets/events/*`, logos, flyers) must be synchronized between `web-app` and `admin-app` so that mass email templates, preview builders, and public web pages reference identical, persistent URLs.
3. **Unified Brand & HOTLINE Routing Standard**:
   * All 4 agents enforce identical hotline routing:
     - **Flight AI Concierge & Ticketing**: `+230 5256 9840` (`23052569840`)
     - **Leisure, Tours & Excursions**: `+230 5256 9838` (`23052569838`)
     - **Corporate & Direct Ticketing**: `+230 5940 7701` (`23059407701`)
4. **Zero-Divergence Rule**:
   * No agent may invent standalone business rules, markup percentages, or static pricing estimates that conflict with the GDS live search or the 19 modular addons framework.
5. **Universal Rules Synchronization**:
   * Keep `.agents/AGENTS.md` synchronized across all 4 project roots (`admin-app/.agents/AGENTS.md`, `web-app/.agents/AGENTS.md`, `mobile-app/.agents/AGENTS.md`, `whatsapp-flight-addon/.agents/AGENTS.md`) using `node scripts/sync_agents.js`.

