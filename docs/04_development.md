# 04 Development & DevOps Guide

## Local Setup
1. **System Requirements**: Ensure Node.js and Expo CLI are installed.
2. **Dependencies**:
   ```bash
   npm install
   ```
3. **Launch**:
   ```bash
   npx expo start
   ```

---

## Environment Configuration
Configure `.env` with the following variables for local development:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_API_URL`

---

## EAS Build & Deployment
- **Account**: Migrated to `devenweb` (devenpawaray@gmail.com).
- **Procedures**:
  - Re-link project: `eas init`
  - Update `app.json`: Ensure `owner: "devenweb"`.
- **Android APK Build**:
  ```bash
  npx eas build --profile preview --platform android
  ```

---

## Troubleshooting (Legacy Fixes)
- **AAPT Errors**: Avoid naming JPEGs with `.png` extensions. The build pipeline will fail during resource merging.
- **Asset Resolution**: Check `src/utils/imageUtils.ts` if images or icons are missing in production builds.
