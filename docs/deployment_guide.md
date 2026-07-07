# Mobile App Deployment Guide: Google Play Store & iOS App Store

The easiest way to build and submit the **Travel Lounge** mobile application to both stores is using **EAS (Expo Application Services)**. EAS handles the compilation, app signing certificates, and store submission automatically in the cloud.

---

## 🛠️ Step 1: Pre-requisites

Before starting, ensure you have:
1. **Apple Developer Account** (with Admin/Account Holder access).
2. **Google Play Console Account** (fully set up developer account).
3. Open your terminal in the `apps/mobile-app` directory.

---

## 🤖 Route A: The Easiest Path (Fully Automated Cloud Builds)

This method builds the apps in the cloud and submits them directly to the stores.

### 1. Build and Submit for Android
Run the following command:
```bash
npx eas build --platform android --profile production --auto-submit
```
* **What happens:**
  1. EAS logs into your Expo account.
  2. It asks if you want to generate a new Keystore (press **Y/Yes** to let EAS manage it).
  3. For **Auto-Submit**, EAS will request your **Google Play Service Account key JSON file**. If you don't have one, EAS will show a link guiding you on how to create one in Google Cloud Console.
  4. The build compiles in the cloud. Once finished, Expo automatically uploads the `.aab` file to your Google Play Console's **Internal Testing** track.

### 2. Build and Submit for iOS
Run the following command:
```bash
npx eas build --platform ios --profile production --auto-submit
```
* **What happens:**
  1. EAS prompts you to log into your Apple Developer Portal.
  2. EAS handles all provisioning profiles, identifiers (`com.travellounge.mu`), and signing certificates.
  3. The build compiles in the cloud. Once finished, EAS uploads the `.ipa` file directly to Apple App Store Connect.
  4. You will receive an email from Apple once the build finishes processing, making it available on **TestFlight**.

---

## 📦 Route B: Manual Upload Path (Build Only)

If you prefer to download the files and upload them manually to the consoles yourself:

### 1. Run the Production Builds
Run this command to build both platforms concurrently without auto-submitting:
```bash
npx eas build --platform all --profile production
```
* Once completed, EAS will print download links for:
  * **Android:** A production `.aab` file.
  * **iOS:** A signed `.ipa` file.

### 2. Manually Upload to Stores
* **Android:** Log into [Google Play Console](https://play.google.com/console/), create a new release on your preferred track (Production or Testing), and drag-and-drop the downloaded `.aab` file.
* **iOS:** 
  * On a Mac, install the **Transporter** app from the Mac App Store, log in with your Apple ID, and drop the `.ipa` file to upload.
  * Alternatively, run `npx eas submit --platform ios` and pass the path to the downloaded `.ipa` file.

---

## ❓ FAQs & Troubleshooting

### Q1: What is Google Play Console's "Internal Testing" track?
* **A:** Internal Testing is the fastest track for distributing early builds of your app to a controlled list of up to 100 testers.
* **Why use it?** It completely bypasses Google's manual app review process (which can take 1 to 7+ days). Your builds are available on testers' devices almost instantly (within 10-15 minutes of upload).
* **Promotion:** Once tested and verified, the exact same build can be promoted to Closed Testing or Production with a single click.

### Q2: Besides Gmail, what other email domains can be used for Play Store testing?
* **Google Workspace Custom Domains:** Any professional email address managed under a Google Workspace organization (e.g., `@travellounge.mu`) works natively.
* **Any Custom Email Linked to a Google Account:** Testers can link their existing non-Gmail addresses (like Outlook, Yahoo, etc.) to a Google account at [accounts.google.com/signup](https://accounts.google.com/signup) by selecting *"Use my current email address instead"*. Once linked, they can sign in to the Play Store and join the test.

### Q3: Error: "You've already submitted this version of the app" / Version Code Conflict
* **A:** Google Play Console requires every new app upload to have a strictly higher `versionCode` than the last one uploaded.
* **How to fix:**
  1. Open [app.json](file:///c:/Users/deven/Desktop/Travel%20Lounge%202026/apps/mobile-app/app.json).
  2. Increment `expo.android.versionCode` (e.g., from `5` to `6`).
  3. Optionally, bump `expo.version` (user-facing version, e.g., from `"1.0.2"` to `"1.0.3"`).
  4. Run `eas build` again.

