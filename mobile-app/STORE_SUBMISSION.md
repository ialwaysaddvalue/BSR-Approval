# App Store & Google Play Store Submission Guide

This guide walks you through publishing the BSR Approval mobile app on both the Apple App Store and Google Play Store using Expo Application Services (EAS).

---

## Prerequisites

### Accounts You Need
| Platform | Account | Cost |
|---|---|---|
| Both | [Expo account](https://expo.dev/signup) | Free |
| iOS (App Store) | [Apple Developer Program](https://developer.apple.com/programs/) | $99/year |
| Android (Play Store) | [Google Play Console](https://play.google.com/console/signup) | $25 one-time |

### Tools to Install
```bash
# Node.js 18+ required — check version
node --version

# Install Expo CLI + EAS CLI globally
npm install -g expo-cli eas-cli

# Verify
eas --version
```

---

## Step 1 — Set Up Your Expo Project

```bash
# Log in to your Expo account
eas login

# Navigate to the mobile app directory
cd mobile-app

# Install all dependencies
npm install

# Link this project to your Expo account
eas init
```

`eas init` will generate a real `projectId` and update `app.json` automatically. If it doesn't, copy the ID from your [Expo dashboard](https://expo.dev) and paste it into `app.json` under `expo.extra.eas.projectId`.

---

## Step 2 — Create App Icons & Splash Screen

You need real PNG assets before building. Place them in `mobile-app/assets/`:

| File | Size | Description |
|---|---|---|
| `icon.png` | 1024×1024 | Amber background (#f59e0b), navy "B" (#0f172a) |
| `splash.png` | 1284×2778 | Navy background with centered logo |
| `adaptive-icon.png` | 1024×1024 | Same as icon but transparent background |
| `favicon.png` | 48×48 | Web favicon |

**Quick option — use Expo's free asset generator:**
Go to https://expo.io/tools and generate placeholder assets, then customise them.

**Designer option:** Use Figma, Canva, or Adobe Illustrator with the specs above.

---

## Step 3 — Configure App Identity

Edit `app.json` and set your unique bundle identifiers:

```json
{
  "expo": {
    "name": "BSR Approval",
    "slug": "bsr-approval",
    "ios": {
      "bundleIdentifier": "com.yourname.bsrapproval"
    },
    "android": {
      "package": "com.yourname.bsrapproval"
    }
  }
}
```

Rules:
- Must be globally unique (reverse domain format)
- Only letters, numbers, dots, underscores
- Cannot be changed after first submission

---

## Step 4 — Build for iOS (App Store)

### 4a — Provision iOS Certificates (first time only)

EAS can manage certificates automatically:
```bash
eas credentials
```
Choose **iOS → Production** and let EAS create the Distribution Certificate and Provisioning Profile. You'll need to log in with your Apple Developer account.

### 4b — Build the iOS binary

```bash
# Production IPA for App Store upload
eas build --platform ios --profile production
```

This uploads your code to Expo's cloud build servers (takes 5–15 min). When done, you get a downloadable `.ipa` file.

### 4c — Submit to App Store

```bash
eas submit --platform ios
```

EAS will ask for your Apple ID and app-specific password. It uploads the build to App Store Connect automatically.

**Or manually via Transporter:**
1. Download [Transporter](https://apps.apple.com/app/transporter/id1450874784) (free, Mac only)
2. Drag and drop the `.ipa` file
3. Click Deliver

---

## Step 5 — Set Up App Store Connect

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Click **My Apps → + → New App**
3. Fill in:
   - **Name**: BSR Approval (or your preferred name)
   - **Primary Language**: English
   - **Bundle ID**: select the one you set in `app.json`
   - **SKU**: any unique string, e.g. `bsr-approval-001`
4. Under **App Information**, fill in:
   - Category: **Business** or **Productivity**
   - Privacy Policy URL (required — host a simple one)
5. Under **Pricing**, set Free
6. Under **App Store**, add:
   - **Screenshots**: at least one for iPhone 6.5" and 5.5"
   - **Description**: your app description
   - **Keywords**: kdp, amazon, book research, bsr calculator, self publishing
   - **Support URL**
7. Under **Build**, select the build you submitted
8. Click **Submit for Review**

Apple's review typically takes 1–3 days for first submissions.

---

## Step 6 — Build for Android (Play Store)

### 6a — Build the Android binary

```bash
# Production AAB for Play Store
eas build --platform android --profile production
```

This produces a `.aab` (Android App Bundle) file. Download it when the build completes.

### 6b — Submit to Play Store

```bash
eas submit --platform android
```

Or submit manually (see Step 7).

---

## Step 7 — Set Up Google Play Console

1. Go to [play.google.com/console](https://play.google.com/console) and pay the $25 registration fee
2. Click **Create app**
3. Fill in:
   - **App name**: BSR Approval
   - **Default language**: English (US)
   - **App or game**: App
   - **Free or paid**: Free
4. Complete the **Dashboard** setup checklist:
   - **Store listing**: description, screenshots (phone + tablet), feature graphic (1024×500px), icon
   - **Content rating**: fill out the questionnaire (likely "Everyone")
   - **Target audience**: 18+ (business tool)
   - **App access**: All functionality available without special access
   - **Data safety**: declare what data the app collects (this app collects none)
5. Under **Production → Releases**:
   - Click **Create new release**
   - Upload the `.aab` file
   - Add release notes: "Initial release"
   - Click **Review release → Start rollout to Production**

Google's review typically takes 1–7 days for new developer accounts.

---

## Step 8 — Preview Build (Test Before Submitting)

Test on a real device before spending time on store submission:

```bash
# Build an APK you can install directly on Android
eas build --platform android --profile preview

# For iOS, build a development client
eas build --platform ios --profile development
```

Share the APK with testers via the EAS dashboard link or QR code.

---

## Step 9 — Over-the-Air Updates (After Launch)

Once your app is live, you can push JavaScript updates instantly without resubmitting to the stores:

```bash
eas update --channel production --message "Updated BSR formula"
```

This uses Expo's OTA update system — the app downloads the new JS bundle on next launch.

---

## Build Profiles Summary

Defined in `eas.json`:

| Profile | Platform | Output | Use For |
|---|---|---|---|
| `development` | Both | Dev client | Local testing with Expo Go |
| `preview` | Android | APK | Beta testers, direct install |
| `production` | iOS | IPA | App Store submission |
| `production` | Android | AAB | Play Store submission |

---

## Common Issues

**"Missing icon.png"** — Create the assets in `mobile-app/assets/` before running `eas build`.

**"Bundle identifier already in use"** — Change `bundleIdentifier` in `app.json` to something unique.

**Apple certificate errors** — Run `eas credentials` and let EAS manage them automatically.

**Build fails with TypeScript errors** — Run `npx tsc --noEmit` locally to catch type errors before building.

**App rejected for missing privacy policy** — Host a simple privacy policy page (the app collects no user data — state that clearly).

---

## App Store Metadata Suggestions

**Short description (30 chars):** KDP Research — BSR & Keywords

**Long description:**
> BSR Approval is a free KDP research toolkit for self-published authors. Calculate Amazon BSR-to-sales estimates, research profitable niches, find low-competition keywords, set monthly income goals, and explore market trends — all offline, no subscription needed.
>
> Features:
> • Profit Goal Calculator — enter your monthly income target and get ranked genre recommendations
> • BSR Calculator — converts any Best Seller Rank to estimated monthly sales and revenue
> • Keyword Research — find long-tail keywords using Amazon autocomplete data
> • Niche Finder — demand vs. competition scores for any topic
> • Market Overview — competition and revenue potential across 16 genres

**Keywords for ASO:** kdp, amazon kdp, bsr calculator, book research, self publishing, kindle, keyword research, niche finder, royalties, publisher rocket alternative
