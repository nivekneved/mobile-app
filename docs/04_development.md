# 04 Development Guide & Workspace Setup

## Getting Started

### 1. Clone the Project
The project contains three sub-applications inside the `apps/` directory:
- `apps/web-app` (Guest Next.js App)
- `apps/admin-app` (Vite Admin App)
- `apps/mobile-app` (Expo Mobile App)

### 2. Install Dependencies
Run `npm install` inside the respective application folders:
```bash
cd apps/web-app && npm install
cd ../admin-app && npm install
cd ../mobile-app && npm install
```

---

## Common Development Commands

### Web App (web-app/)
```bash
cd apps/web-app
npm run dev          # Start development server
npm run build        # Production compile build check
npm run lint         # Check lints
```

### Admin App (admin-app/)
```bash
cd apps/admin-app
npm run dev          # Start Vite dev server
npm run build        # Production build compile
npm run lint         # Check lints
```

### Mobile App (mobile-app/)
```bash
cd apps/mobile-app
npx expo start       # Start Expo bundler
npx expo prebuild    # Generate native code (iOS/Android)
```

---

## Environment Configuration (.env.local)

### web-app
```env
NEXT_PUBLIC_SUPABASE_URL=https://tbyudagfjspedeqtlgjv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### admin-app
```env
VITE_SUPABASE_URL=https://tbyudagfjspedeqtlgjv.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

---

## Code Quality Standards
- **Components**: PascalCase filenames (e.g., `BookingWizard.tsx`).
- **Utilities**: camelCase filenames.
- **Constants**: UPPER_SNAKE_CASE naming.
- **Comments**: Maintain inline code comments coverage $\ge 10\%$.
- **Database Modifiers**: Avoid direct database writes from the UI; route actions through checked services or Supabase transactions.
