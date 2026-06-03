# Safe Project Isolation Guide

To prevent **Travel Lounge 2026** and other distinct projects from overriding each other, you must maintain strict isolation across four layers: **Directory**, **Vercel**, **Supabase**, and **Environment Variables**.

---

## 1. Vercel Project Isolation
The issue experienced previously was caused by the local folder being linked to the wrong Vercel project.

### **How to verify your link:**
Run this in any `web-app` or `admin-app` folder:
```bash
vercel project ls
```
It should show the currently linked project with a checkmark.

### **How to safely switch/re-link:**
If you copy a folder or move between project environments, run:
```bash
vercel link
```
1. It will ask: "Set up [path]?" -> **Yes**
2. "Link to existing project?" -> **Yes**
3. Select the **correct** project name (e.g., `travellounge-2026-web`).

---

## 2. Environment Variable Hygiene
Never hardcode Supabase URLs or Keys. Always use `.env.local` which is excluded from Git.

### **Travel Lounge (.env.local)**
```env
NEXT_PUBLIC_SUPABASE_URL=https://tbyudagfjspedeqtlgjv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 3. Terminal & Workspace Context
To avoid working in the wrong project by accident:
- **Distinct VS Code Windows**: Open `Desktop\Travel Lounge 2026` in its own dedicated window.
- **Git Check**: Before any push, run `git remote -v` to ensure it targets the correct repository.
