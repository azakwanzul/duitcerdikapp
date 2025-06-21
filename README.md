duitcerdikapp


# DuitCerdik - Smart Personal Finance Tracker

DuitCerdik is a privacy-first, dark-mode-only personal finance companion designed for global youth. It provides behavior-driven financial insights, budgeting tools, lifestyle simulations, and goal tracking—all built for scalability and accessibility.

---

## Key Features

* **Fully Dark Mode** – Designed for long-term use with reduced eye strain.
* **Inclusive & Global** – Supports multiple languages, currencies, and region-specific spending habits.
* **Smart Dashboard** – Visual summaries, goal trackers, and daily budgeting cues.
* **Behavioral Nudges** – Personalized insights and savings challenges.
* **Simulator** – Try "what-if" scenarios to plan different lifestyles.
* **No Light Mode. No Data Shared. All Local.**

---

## Tech Stack

* **Frontend**: React + TypeScript + Tailwind CSS
* **State Management**: Redux or Zustand
* **Storage**: LocalStorage (with optional Firebase/Supabase upgrade)
* **Optional Backend**: Supabase for auth, sync, and remote storage

---

## Development Guide

### 1. Clone the Project

```bash
git clone https://github.com/your-username/duitcerdik-app.git
cd duitcerdik-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

### 5. Folder Structure

```
/duitcerdik-app
 ┣ /public          # Static assets
 ┣ /src
 ┃ ┣ /components    # UI components
 ┃ ┣ /pages         # Route-level pages
 ┃ ┣ /utils         # Helper functions
 ┃ ┣ /data          # JSON data and constants
 ┃ ┣ /store         # State management (Zustand/Redux)
 ┃ ┗ App.tsx        # Main app entry
```

---

## Publishing Guide

### iOS - Apple App Store

1. **Prerequisites**

   * Enroll in [Apple Developer Program](https://developer.apple.com/programs/)
   * Use macOS with Xcode installed
   * Install [Expo](https://docs.expo.dev) or configure native build via React Native

2. **Steps**

   * Set `bundleIdentifier` in `app.json`
   * Run `eas build -p ios`
   * Submit via `eas submit -p ios`
   * Review status in App Store Connect

3. **Tips**

   * Use TestFlight for beta testing
   * Add privacy disclosures (no data collection, offline-first)

---

### Android - Google Play Store

1. **Prerequisites**

   * Register a [Google Play Developer Account](https://play.google.com/console/about/)
   * Configure Android manifest, version codes, etc.

2. **Steps**

   * Build APK or AAB: `eas build -p android`
   * Test APK on physical/emulator devices
   * Upload to Google Play Console > Create Release

3. **Tips**

   * Set target audience to 13–34 age group
   * Include detailed screenshots, video demo (optional)
   * Use tags like: “Budget Planner”, “Youth Finance”, “Dark Mode Finance”

---

## Project Vision

DuitCerdik started as a Malaysian-centric student finance tracker and is now transforming into a global-first budgeting platform. Inspired by apps like Spendee, Emma, and Copilot, it adds a human and behavioral design layer to financial tracking.

**Ideal Users**:

* College and early-career individuals
* Budget-conscious travelers, gig workers
* Youth exploring long-term financial health

---

## Future Plans

* Biometric Login
* Bank API Sync (via Plaid, TrueLayer, etc.)
* AI Insights & Chatbot Coaching
* Language & Region Localization

---

## Contributors

Made with love by Adam Zakwan and contributors.

Want to join the team? [Email us](mailto:azakwanzul@gmail.com)

---

## License

MIT License – Free to use, modify, and distribute.

> This README is part of the global revamp effort to position DuitCerdik for international scalability and cross-platform deployment.

