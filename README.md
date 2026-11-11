# ☕ Caffora — Smart Café Discovery & Table Booking Platform

<div align="center">

![Expo](https://img.shields.io/badge/Expo-v57.0.0-blue?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.86.3-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-v12-FFCA28?logo=firebase&logoColor=black)
![NativeWind](https://img.shields.io/badge/NativeWind-v4-38B2AC?logo=tailwindcss&logoColor=white)
![EAS](https://img.shields.io/badge/EAS%20Build-Ready-blueviolet?logo=expo&logoColor=white)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

<p align="center">
  <b>Discover aesthetic coffee spots, explore curated menus, reserve tables in real-time, and manage café listings with a complete owner portal.</b>
</p>

[Key Features](#-key-features) •
[Café Owner Portal](#-café-owner-portal) •
[Tech Stack](#-tech-stack) •
[Project Structure](#-project-structure) •
[Getting Started](#-getting-started) •
[Building an APK](#-building-an-apk-eas-build) •
[Environment Variables](#-environment-variables) •
[Git Workflow](#-team-git-workflow)

</div>

---

## 📖 Overview

**Caffora** is a high-performance cross-platform mobile application designed for coffee lovers, remote workers, and café owners. Customers can discover top-rated specialty cafés, filter spots by ambiance, work amenities (Wi-Fi speed, power outlets, quiet zones), reserve tables with instant real-time feedback, and save favorites.

Café owners have access to a dedicated **Owner Portal** to manage listings, update operating hours, track table capacity, and accept or reject reservations in real-time.

---

## ✨ Key Features

### ☕ Customer Experience
- **Curated Café Discovery**
  - Modern borderless card design with square photo previews, promotional tag scrims (`BUY1 GET1`, `FEATURED`), and favorite buttons.
  - Dark forest green star rating badges, verified review counts, dynamic price tiers (`100rs~200rs`), categories, and addresses.
  - Featured café carousels and distance-based "Explore cafés" feeds.
- **Granular Search & Filters**
  - Instant search across café names, neighborhoods, cities, and coffee specialties.
  - Multi-attribute filter modal: Price range, minimum rating, atmosphere tags, and amenities (High-Speed Wi-Fi, Outdoor Seating, Pet Friendly, Quiet Work Zone, etc.).
- **Live Table Reservations**
  - Select date, time slot, and guest count with live capacity validation.
  - Add custom customer requests / dietary notes.
  - Complete reservation history with live status indicators (`Pending`, `Confirmed`, `Rejected`, `On Hold`, `Cancelled`).
- **In-App Real-Time Notifications**
  - Real-time Firestore notification center for customers and owners.
  - Instant alerts when bookings are submitted, confirmed, put on hold, or cancelled.
  - Live unread notification counter badges with mark-as-read controls.
- **One-Tap Quick Actions & Deep Links**
  - **Turn-by-Turn Navigation**: Open directions directly in Google Maps or Apple Maps.
  - **WhatsApp Direct**: Instant WhatsApp chat with café management.
  - **Phone Dialer**: One-tap phone calling.
  - **Web Browser**: In-app browser preview for menus and websites.
- **Warm Cream & Terracotta Design System**
  - Signature Caffora palette: Warm Cream (`#FAF7F3`) and Terracotta (`#B95E2E`).
  - Animated floating pill tab bar with smooth glass glider transitions.
  - Seamless Dark Mode support (`#120E0C` dark background) with automatic system preference detection.

---

### 🏪 Café Owner Portal
- **Role-Based Authentication**: Secure onboarding and routing distinguishing regular customers from verified café owners.
- **Owner Dashboard**: Overview of listed cafés, active bookings, and today's reservations.
- **Live Booking Management**:
  - Review incoming reservation requests with customer contact info and special requests.
  - Accept, reject, or put bookings on hold with automatic real-time notification dispatch to customers.
- **Listing & Café Management**:
  - Add new cafés with high-resolution image URLs, categories, description, pricing tiers, and contact details.
  - Edit existing listings, configure amenities, and update opening hours.
  - Instant manual Open/Closed listing toggle for sudden schedule adjustments.

---

## 🛠 Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Expo](https://expo.dev/) (SDK 57) | Modern React Native toolchain & runtime |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (v5.9) | Strict static type safety throughout codebase |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) (v57) | File-based navigation, typed routes, tabs & modals |
| **Styling** | [NativeWind](https://www.nativewind.dev/) (v4) / Tailwind CSS | Fast utility-first mobile styling |
| **Backend & DB** | [Firebase](https://firebase.google.com/) (v12) | Auth, Firestore (NoSQL), Cloud Storage |
| **Build & Deploy** | [EAS Build](https://expo.dev/eas) | Cloud and local Android APK / AAB compilation |
| **State & Cache** | [TanStack Query](https://tanstack.com/query) & [Zustand](https://zustand-demo.pmnd.rs/) | Server cache & client state management |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Validated, type-safe form inputs |
| **Icons & UI** | [Lucide React Native](https://lucide.dev/) & [Ionicons](https://icons.expo.fyi/) | Crisp multi-platform vector icons |

---

## 📂 Project Structure

```text
caffora/
├── app/                          # Expo Router routes & screens
│   ├── (auth)/                   # Authentication (login, customer & owner signup, verify email)
│   ├── (owner)/                  # Café Owner Portal (dashboard, my-cafes, add/edit cafe, bookings)
│   ├── (tabs)/                   # Main customer tabs (home, search, saved, profile)
│   │   ├── _layout.tsx           # Floating glassmorphic tab navigation bar
│   │   ├── index.tsx             # Home feed (hero, featured carousel, nearby cafes)
│   │   ├── search.tsx            # Live café search & category browse
│   │   ├── saved.tsx             # Wishlist / bookmarked cafés
│   │   └── profile.tsx           # Customer profile & account settings
│   ├── booking/                  # Table booking flow, confirmation & history
│   ├── cafe/[id].tsx             # Rich café detail screen
│   ├── modal/                    # Modal screens (booking details, review composer)
│   ├── profile/                  # Notifications center, edit profile, privacy, settings
│   ├── reviews/[cafeId].tsx      # Reviews & rating list screen
│   ├── search/search-results.tsx # Full-page search results
│   ├── _layout.tsx               # Root application layout, theme & notification listeners
│   └── filters.tsx               # Advanced multi-factor filter modal
├── assets/                       # App icons, splash screens, and images
├── scripts/                      # Database seeders & administration utilities
├── src/
│   ├── context/                  # ThemeContext (Light/Dark/System theme engine)
│   ├── services/
│   │   ├── deepLinks/            # Maps, WhatsApp, Dialer, and Browser link handlers
│   │   ├── firebase/             # Firebase Auth, Cafes, Bookings, Favorites, Users
│   │   └── notifications/        # Push & in-app notification dispatchers
│   └── types/                    # TypeScript data models (Cafe, Booking, User, Review)
├── .env.example                  # Environment variables template
├── app.json                      # Expo application manifest
├── eas.json                      # EAS Build profiles (preview APK, development, production)
├── google-services.json          # Android Firebase configuration
└── package.json                  # Dependencies and npm scripts
```

---

## 🚀 Getting Started

### 📋 Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/client) app installed on your physical device (iOS/Android) or an emulator.

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

Fill in your Firebase project credentials in `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

---

### 📱 4. Run the Development Server

```bash
npm start
# or
npx expo start
```

- **Android Device/Emulator:** Press `a` in the terminal.
- **iOS Simulator:** Press `i` in the terminal.
- **Physical Device:** Scan the QR code using the **Expo Go** app (Android) or Camera app (iOS).

---

## 📦 Building an APK (EAS Build)

The project includes an optimized [eas.json](file:///d:/vscode/caffora/eas.json) configured to generate standalone installable Android `.apk` files without publishing to the Google Play Store.

### Step 1: Link your project (one-time setup)
```bash
npx eas init
```
Select your Expo account and choose **Create new project** or link your existing project.

### Step 2: Build the APK in the cloud
```bash
npx eas build -p android --profile preview
```

### Step 3: Download & Install
When the build finishes, EAS will output:
- A direct download URL for the `.apk` file.
- A QR code to scan from your Android device to install the APK immediately.

*(To build locally on your PC using Android Studio, add the `--local` flag: `npx eas build -p android --profile preview --local`)*

---

## 🔑 Environment Variables

| Variable | Description |
| :--- | :--- |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Authentication domain |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firestore & Firebase Project ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`| Firebase Cloud Storage bucket URL |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM Messaging Sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Firebase Web App ID |

---

## 🤝 Team Git Workflow

```bash
# 1. Switch to work branch and pull latest changes
git switch work
git pull origin work

# 2. Stage and commit your changes
git add .
git commit -m "feat(cards): implement borderless cafe card design"

# 3. Push to remote work branch
git push origin work
```

### ⚠️ Rules for Contributors
- ❌ **Do not push directly to `main`**: All features must go through a PR or the `work` branch.
- 🔒 **Never commit `.env` or Firebase service account keys**: Keep secrets in `.env` (ignored by Git).

---

## 📜 Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **Start Expo** | `npm start` | Launches Expo Metro development server |
| **Run Android** | `npm run android` | Runs on Android emulator or connected device |
| **Run iOS** | `npm run ios` | Runs on iOS simulator |
| **Run Web** | `npm run web` | Starts web preview in browser |
| **Lint Code** | `npm run lint` | Runs ESLint across all TypeScript & TSX files |
| **Seed Data** | `node scripts/seed-cafes.js` | Populates Firestore with sample café listings |

---

## 📄 License

This project is licensed under the MIT License — feel free to modify and build upon it.

<div align="center">
  <sub>Built with ☕ and passion by the <b>Caffora Team</b></sub>
</div>
