# Caffora — NativeWind v4 Setup Guide for Expo SDK 54

This guide installs NativeWind using the same setup as the Caffora project.

> **Important:** This guide is for **Expo SDK 54 + NativeWind 4.2.6 + Tailwind CSS 3.4.19**.
> Do not mix these instructions with NativeWind v5 instructions.

---

## 1. Open the project

Open the Expo project in a terminal.

Example:

```powershell
cd E:\android\cafe-app-mini-project\Caffora
```

---

## 2. Check the Expo version

Run:

```bash
npx expo --version
```

The project should be using **Expo SDK 54**.

You can also check the installed Expo package:

```bash
npm list expo
```

You should see an Expo `54.x` version.

---

## 3. Install NativeWind and required native packages

Run:

```bash
npx expo install nativewind@4.2.6 react-native-reanimated react-native-safe-area-context react-native-worklets
```

This installs:

- NativeWind 4.2.6
- Expo-compatible React Native Reanimated
- React Native Safe Area Context
- React Native Worklets

---

## 4. Install Tailwind and the Expo Babel preset

Run:

```bash
npm install --save-dev tailwindcss@3.4.19 prettier-plugin-tailwindcss@0.5.14 babel-preset-expo@54.0.12
```

### Why the exact Babel version matters

This project uses Expo SDK 54, so use:

```text
babel-preset-expo 54.0.12
```

Do **not** install the latest `babel-preset-expo` blindly.

A newer major version can cause errors such as:

```text
Cannot find module 'babel-preset-expo'
```

or:

```text
SyntaxError: private properties are not supported
```

---

## 5. Install Expo Linear Gradient

If the project uses the custom Caffora gradient/glass tab bar, run:

```bash
npx expo install expo-linear-gradient
```

This provides:

```tsx
import { LinearGradient } from "expo-linear-gradient";
```

---

## 6. Create `tailwind.config.js`

Create this file in the **project root**:

```text
Caffora/
├── app/
├── src/
├── tailwind.config.js
├── babel.config.js
├── metro.config.js
└── global.css
```

Put this inside `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],

  presets: [require("nativewind/preset")],

  theme: {
    extend: {},
  },

  plugins: [],
};
```

### Important

The `src` path is included because Caffora has files such as:

```text
src/components/
src/services/
```

The important UI path is:

```text
./src/**/*.{js,jsx,ts,tsx}
```

---

## 7. Create `global.css`

Create:

```text
Caffora/global.css
```

Put exactly:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 8. Create `babel.config.js`

Create or replace:

```text
Caffora/babel.config.js
```

with:

```js
module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxImportSource: "nativewind",
        },
      ],
      "nativewind/babel",
    ],
  };
};
```

### Important

Do not add random Babel plugins.

Do not use a Babel preset for Expo 57 or another Expo version.

For this Expo 54 project, use:

```text
babel-preset-expo@54.0.12
```

---

## 9. Create `metro.config.js`

Create or replace:

```text
Caffora/metro.config.js
```

with:

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
});
```

---

## 10. Import `global.css`

Open:

```text
app/_layout.tsx
```

Add this at the very top:

```tsx
import "../global.css";
```

Example:

```tsx
import "../global.css";

import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
```

If your existing `_layout.tsx` already contains navigation/auth logic, **do not replace the whole file**. Just add:

```tsx
import "../global.css";
```

at the top.

---

## 11. Test NativeWind

Open any screen such as:

```text
app/(tabs)/index.tsx
```

Temporarily test:

```tsx
import { Text, View } from "react-native";

export default function TestScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-orange-500">
      <Text className="text-3xl font-bold text-white">NativeWind Works 🎉</Text>
    </View>
  );
}
```

If the screen is orange and the text is white, NativeWind is working.

---

## 12. Check installed versions

Run:

```bash
npm list nativewind tailwindcss babel-preset-expo react-native-reanimated react-native-worklets
```

The important versions should be approximately:

```text
nativewind           4.2.6
tailwindcss          3.4.19
babel-preset-expo    54.0.12
react-native-reanimated  4.x
react-native-worklets    Expo-compatible version
```

The exact Reanimated/Worklets patch versions may be selected by Expo.

---

## 13. Run Expo Doctor

Run:

```bash
npx expo-doctor
```

You want all dependency checks to pass.

Ideally:

```text
18/18 checks passed. No issues detected!
```

The exact number of checks can vary between Expo CLI versions, but there should be no dependency mismatch errors.

---

## 14. Clear Metro cache

Stop Expo if it is running:

```text
Ctrl + C
```

Then run:

```bash
npx expo start --clear
```

This is important after changing Babel, Metro, Tailwind, or NativeWind configuration.

---

# Common errors and fixes

## Error: Cannot find module `babel-preset-expo`

Run:

```bash
npm install --save-dev babel-preset-expo@54.0.12
```

Then:

```bash
npx expo start --clear
```

---

## Error: Expo Doctor says Babel 57 but Expo is 54

If you see something like:

```text
expected ~54.0.10
found 57.0.6
```

remove the incorrect package:

```bash
npm uninstall babel-preset-expo
```

Then install the correct version:

```bash
npm install --save-dev babel-preset-expo@54.0.12
```

Then:

```bash
npx expo-doctor
```

---

## Error: Missing `react-native-worklets`

Run:

```bash
npx expo install react-native-worklets
```

Then:

```bash
npx expo-doctor
```

---

## Error: Cannot find `expo-linear-gradient`

Run:

```bash
npx expo install expo-linear-gradient
```

---

## Error: `private properties are not supported`

First check:

```bash
npx expo-doctor
```

If Babel has the wrong major version, fix it:

```bash
npm install --save-dev babel-preset-expo@54.0.12
```

Then clear the cache:

```bash
npx expo start --clear
```

Do not randomly downgrade Expo or install unrelated Babel plugins.

---

# Final project structure

After setup, the important files should look like:

```text
Caffora/
│
├── app/
│   ├── _layout.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── search.tsx
│       ├── saved.tsx
│       └── profile.tsx
│
├── src/
│   ├── components/
│   └── services/
│
├── global.css
├── tailwind.config.js
├── babel.config.js
├── metro.config.js
├── package.json
└── ...
```

---

# Complete command checklist

For a fresh Expo SDK 54 project, the main installation commands are:

```bash
npx expo install nativewind@4.2.6 react-native-reanimated react-native-safe-area-context react-native-worklets
```

```bash
npm install --save-dev tailwindcss@3.4.19 prettier-plugin-tailwindcss@0.5.14 babel-preset-expo@54.0.12
```

```bash
npx expo install expo-linear-gradient
```

Then create/configure:

```text
tailwind.config.js
babel.config.js
metro.config.js
global.css
```

Then add:

```tsx
import "../global.css";
```

to:

```text
app/_layout.tsx
```

Finally:

```bash
npx expo-doctor
```

and:

```bash
npx expo start --clear
```

---

# Important: Do not mix versions

For this Caffora setup, keep everyone on:

```text
Expo SDK          54
NativeWind        4.2.6
Tailwind CSS      3.4.19
Babel Expo        54.0.12
```

Do not blindly run:

```bash
npm install nativewind
npm install tailwindcss
npm install babel-preset-expo
```

because those commands can install newer major versions that do not match this Expo 54 setup.

---

# Quick verification

A friend is ready to start coding when all of these are true:

- [ ] Expo SDK 54 installed
- [ ] NativeWind 4.2.6 installed
- [ ] Tailwind CSS 3.4.19 installed
- [ ] `babel-preset-expo` 54.0.12 installed
- [ ] `react-native-reanimated` installed
- [ ] `react-native-worklets` installed
- [ ] `expo-linear-gradient` installed if using the Caffora gradient tab bar
- [ ] `tailwind.config.js` created
- [ ] `babel.config.js` configured
- [ ] `metro.config.js` configured
- [ ] `global.css` created
- [ ] `global.css` imported in `app/_layout.tsx`
- [ ] `npx expo-doctor` passes
- [ ] `npx expo start --clear` starts successfully
- [ ] A test `className` renders correctly

**Once these checks pass, the team can safely start building the Caffora screens with NativeWind.**
