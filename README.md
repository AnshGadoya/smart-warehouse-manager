# 📦 Smart Warehouse Manager

A modern, high-performance cross-platform mobile application built using **React Native** and **Expo SDK 54**. It is designed to optimize warehouse storage space, visualize rack occupancy in a real-time 2D grid, and streamline inventory tracking with integrated QR codes and native sharing capabilities.

---

### 📱 App Screenshots

Here is a preview of the application's premium user interface in action. *(To display your screenshots, save your images in a `screenshots/` folder in this directory as named below, or update the paths)*:

| 📊 Modern Dashboard | 🗂️ 2D Rack Grid | 🔍 Click-to-View QR Code |
| :---: | :---: | :---: |
| <img src="screenshots/dashboard.png" width="230" alt="Dashboard Screen"/> | <img src="screenshots/rack_view.png" width="230" alt="2D Rack View Screen"/> | <img src="screenshots/qr_view.png" width="230" alt="QR Code Modal Screen"/> |

| 📦 Inventory Operations | 🔧 Master Configuration | ⚙️ Theme Settings |
| :---: | :---: | :---: |
| <img src="screenshots/inventory.png" width="230" alt="Inventory Tab Screen"/> | <img src="screenshots/masters.png" width="230" alt="Masters Tab Screen"/> | <img src="screenshots/settings.png" width="230" alt="Settings Screen"/> |

---

## ✨ Features

- **📊 Live Analytics Dashboard**: Real-time overview of warehouse stats (total stores, locations, parts, and racks) alongside a smart capacity bar highlighting occupied vs empty configurations.
- **🗂️ 2D Rack Grid Navigator**: Dynamic 2-column list of storage racks grouped by level (TOP, MIDDLE, BOTTOM) and zone. Color-coded borders immediately reflect the fill state (Green = Empty, Orange = Partial, Red = Full).
- **🔍 QR Code Sharing System**: Clickable QR code displays that generate high-quality visual codes on the fly. Built-in sharing saves code images as PNGs and calls native sharing sheets (WhatsApp, Email, Slack, print).
- **📦 Smart Inventory Movements**: Real-time logic for storing items, relocations, searching items by rack or name, and removing units via scanning.
- **🌗 Dark Mode Integration**: Custom-built style guidelines allowing the app to transition seamlessly between clean Light Mode and eye-friendly Dark Mode.
- **📱 Fully Responsive Safe Area**: Dynamic calculations to adjust layouts for different device heights, notches, status bars, and bottom navigation home indicators.

---

## 🛠️ Technology Stack

- **Framework**: [React Native](https://reactnative.dev/) (with [Expo SDK 54](https://expo.dev/))
- **Navigation**: [React Navigation](https://reactnavigation.org/) (Native Stack & Bottom Tabs)
- **UI & Icons**: [Ionicons (@expo/vector-icons)](https://icons.expo.fyi/)
- **Visuals & Gradients**: [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)
- **QR Generation**: [react-native-qrcode-svg](https://github.com/awesomejerry/react-native-qrcode-svg)
- **Sharing API**: [Expo Sharing](https://docs.expo.dev/versions/latest/sdk/sharing/)
- **File System**: [Expo File System](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- **State Management**: React Context API (Clean decoupled auth and app states)

---

## 📁 Project Structure

```text
├── assets/             # Launcher icons, splash screen, and images
├── components/         # Reusable global design components (Button, Input, Card, etc.)
├── context/            # AuthContext (sessions) & AppContext (database & theme state)
├── navigation/         # AppNavigator (login stack and bottom tab configurations)
├── screens/            # Application views grouped by tab flow
│   ├── Inventory/      # Inventory operations (Add, Remove, Move, Search)
│   ├── Masters/        # Masters CRUD (Stores, Locations, Racks, Parts)
│   ├── DashboardScreen.js
│   ├── MastersTabScreen.js
│   ├── RackViewScreen.js
│   ├── SettingsScreen.js
│   └── LoginScreen.js
├── styles/             # Global themes, light/dark color tokens, spacing & shadows
├── utils/              # Helper functions (formatters, mathematical checkers)
├── App.js              # Entrypoint wrapping providers and navigation
└── package.json        # Project dependencies and startup scripts
```

---

## 🚀 Getting Started

Follow these steps to run the project locally on your machine:

### 1. Prerequisites
Make sure you have NodeJS installed. You will also need a physical device (with the **Expo Go** app installed) or an emulator (Android Studio / Xcode simulator).

### 2. Installation
Clone this repository and install dependencies:
```bash
# Clone the repository
git clone https://github.com/AnshGadoya/smart-warehouse-manager.git

# Navigate to the project directory
cd smart-warehouse-manager

# Install project packages
npm install
```

### 3. Running the App
Start the Expo Metro bundler:
```bash
# Run server with clean cache
npx expo start -c
```
- Scan the QR code displayed in the terminal using your phone's camera (iOS) or the Expo Go App (Android).
- Press `a` for Android Emulator, or `i` for iOS Simulator.

---

## 🔒 Demo Credentials
To explore the application without setting up master data, use the pre-configured demo account:
* **Username**: `admin`
* **Password**: `admin123`
