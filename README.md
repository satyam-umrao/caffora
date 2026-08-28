# ☕ Caffora — Smart Café Discovery & Booking App

<div align="center">

![Expo](https://img.shields.io/badge/Expo-v54.0.0-blue?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-v12-FFCA28?logo=firebase&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/NativeWind-v4-38B2AC?logo=tailwindcss&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active%20Development-success)

<p align="center">
  <b>Discover aesthetic coffee spots, explore curated menus, reserve tables, and connect with your favorite cafés in real-time.</b>
</p>

[Features](#-key-features) •
[Tech Stack](#-tech-stack) •
[Project Structure](#-project-structure) •
[Getting Started](#-getting-started) •
[Environment Variables](#-environment-variables) •
[Git Workflow](#-team-git-workflow) •
[Scripts](#-available-scripts)

</div>

---

## 📖 Overview

**Caffora** is a modern, cross-platform mobile application designed for coffee lovers, remote workers, and food enthusiasts. It lets users discover top-rated specialty cafés, filter spots by ambiance and amenities (such as Wi-Fi speed, pet friendliness, and quiet work environments), reserve tables seamlessly, and engage with the community through genuine ratings and reviews.

---

## ✨ Key Features

- ☕ **Curated Café Exploration**
  - Browse featured and trending cafés with high-resolution image carousels.
  - Detailed café profiles including operating hours, pricing, atmosphere tags, and address.
  - Comprehensive amenity lists (High-Speed Wi-Fi, Outdoor Seating, Power Outlets, Pet Friendly, etc.).

- 🔍 **Advanced Search & Filtering**
  - Search by café name, location, or beverage specialties.
  - Granular multi-factor filters: category, price tiers, distance, atmosphere, and amenities.

- 📅 **Table & Seat Reservations**
  - Real-time booking system with customizable date, time slot, and guest count.
  - Instant confirmation screens and persistent booking history management.

- ⭐ **Reviews & Rating System**
  - View verified user feedback and average star ratings.
  - Submit reviews with custom ratings and detailed comments.

- 🚀 **Deep Linking & Quick Actions**
  - **1-Tap Navigation**: Open turn-by-turn directions directly in Google Maps or Apple Maps.
  - **WhatsApp Direct**: Instant WhatsApp chat with café management for inquiries.
  - **Phone Dialer**: Quick-dial café phone numbers with a single tap.
  - **Web Browser**: In-app browser preview for café websites and online menus.

- ❤️ **Saved / Wishlist**
  - Save favorite cafés for offline reference and rapid access.

- 🔐 **Authentication & Profile Management**
  - Firebase-powered authentication (Email & Password).
  - Secure onboarding, password recovery, profile editing, and session management.

---

## 🛠 Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Expo](https://expo.dev/) (SDK 54) | React Native framework & tooling |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict static type checking |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) (v6) | File-based navigation with tabs & modals |
| **Styling** | [NativeWind](https://www.nativewind.dev/) (v4) / Tailwind CSS | Utility-first mobile styling |
| **Backend & DB** | [Firebase](https://firebase.google.com/) (v12) | Auth, Firestore (NoSQL), Cloud Storage |
| **State & Data** | [TanStack Query](https://tanstack.com/query) & [Zustand](https://zustand-demo.pmnd.rs/) | Server caching & global state management |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Type-safe form handling & schema validation |
| **Icons & UI** | [Lucide React Native](https://lucide.dev/) & [Expo Vector Icons](https://icons.expo.fyi/) | Modern SVG icons |

---

## 📂 Project Structure

```text
Caffora/
├── app/                          # Expo Router file-based screens
│   ├── (auth)/                   # Authentication routes (login, signup, onboarding, etc.)
│   ├── (tabs)/                   # Main bottom tab routes (home, search, saved, profile)
│   ├── booking/                  # Booking flow & reservation history
│   ├── cafe/[id].tsx             # Dynamic café detail screen
│   ├── modal/                    # Interactive modals (booking details, review composer)
│   ├── profile/                  # User profile, privacy, settings, and support
│   ├── reviews/                  # Café reviews screen
│   ├── search/                   # Search results screen
│   ├── _layout.tsx               # Root layout & providers
│   └── filters.tsx               # Advanced filter modal screen
├── assets/                       # Images, icons, and splash screens
├── scripts/                      # Admin & database migration utilities
│   └── seed-cafes.js             # Firebase Firestore café seeder script
├── src/
│   ├── services/
│   │   ├── deepLinks/            # Maps, Phone, WhatsApp, and Web deep links
│   │   └── firebase/             # Firebase Auth, Firestore, Storage & Config
│   └── types/                    # TypeScript interfaces (Cafes, Bookings, Reviews, etc.)
├── .env.example                  # Environment variables template
├── app.json                      # Expo application manifest
├── eas.json                      # Expo Application Services build configuration
├── google-services.json          # Android Firebase configuration
├── package.json                  # Dependencies and npm scripts
└── tailwind.config.js            # Tailwind CSS / NativeWind styling config
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Make sure you have the following installed on your development machine:
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/client) app on your physical device (iOS/Android) or configured [Android Studio](https://developer.android.com/studio) / [Xcode](https://developer.apple.com/xcode/) emulators.

---

### 📥 1. Clone the Repository

```bash
git clone https://github.com/satyam-umrao/caffora.git
cd caffora
```

---

### 📦 2. Install Dependencies

```bash
npm install
```

---

### ⚙️ 3. Environment Configuration

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Open `.env` and fill in your Firebase project credentials:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

---

### 🔥 4. Firebase Setup

1. Create a project at the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password provider).
3. Enable **Cloud Firestore Database** in test or production mode with appropriate security rules.
4. Add a **Web App** to your Firebase project and copy the config values to your `.env` file.
5. Add an **Android App** with package name `com.caffora.app`, download `google-services.json`, and place it in the project root.

---

### 🌱 5. (Optional) Seed Sample Café Data

To populate your Firestore database with sample café listings:

1. Download your Firebase Admin SDK service account private key from **Firebase Console > Project Settings > Service accounts > Generate new private key**.
2. Save the downloaded JSON file as `scripts/serviceAccountKey.json`.
3. Run the seed script:
   ```bash
   node scripts/seed-cafes.js
   ```

---

### 📱 6. Run the Application

Start the Expo development server:

```bash
npm start
# or
npx expo start
```

- **Android Device/Emulator:** Press `a` in the terminal or run `npm run android`.
- **iOS Simulator:** Press `i` in the terminal or run `npm run ios`.
- **Web Browser:** Press `w` in the terminal or run `npm run web`.
- **Expo Go App:** Scan the displayed QR code using the Expo Go app (Android) or Camera app (iOS).

---

## 🔑 Environment Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key | `AIzaSy...` |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `caffora-app.firebaseapp.com` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | `caffora-app` |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`| Firebase Cloud Storage Bucket | `caffora-app.firebasestorage.app` |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging Sender ID | `996089968235` |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Firebase Web Application ID | `1:996089968235:web:1e37505...` |

---

## 🤝 Team Git Workflow

Follow this standard workflow to keep branches synchronized and avoid conflicts:

### ☀️ Daily Development Cycle

```bash
# 1. Switch to the development branch and pull latest changes
git switch work
git pull origin work

# 2. Make your edits and check status
git status

# 3. Stage and commit your changes with clear messages
git add .
git commit -m "feat(booking): add date-time slot selection"

# 4. Push to remote work branch
git push origin work
```

### ⚠️ Rules for Contributors
- ❌ **Do not push directly to `main`**: All features must go through `work` or a Pull Request.
- ❌ **Do not force push (`git push --force`)**: Protect shared branch history.
- 🔒 **Never commit `.env` or service account keys**: Keep credentials private.

---

## 📜 Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **Start Expo** | `npm start` | Launches Expo development server with Metro bundler |
| **Run Android** | `npm run android` | Builds and runs on Android emulator or connected device |
| **Run iOS** | `npm run ios` | Builds and runs on iOS simulator |
| **Run Web** | `npm run web` | Starts local web server in the browser |
| **Lint Code** | `npm run lint` | Runs ESLint across TypeScript and TSX files |
| **Seed Data** | `node scripts/seed-cafes.js` | Populates Firestore with mock café data |

---

## 📄 License

This project is licensed under the MIT License — feel free to modify and build upon it.

<div align="center">
  <sub>Built with ❤️ by the <b>Caffora Team</b></sub>
</div>

