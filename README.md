# MetroPulse — Real-Time City Bus Tracking System

A full-stack, enterprise-grade real-time bus tracking ecosystem built with Express, MongoDB, Socket.IO, React, Vite, and React Native (Expo).

---

## 🚀 System Architecture

```text
bus-tracking/
├── backend/            # Express, Socket.IO, MongoDB API (Port 5000)
├── admin-web/          # Admin Portal for Fleet, Routes & Timetables (Port 4000)
├── passenger-web/      # Commuter Landing Page & OutletBuddy Live Map (Port 3000)
└── mobile/             # React Native Expo Mobile Driver Tracking App (Port 8082)
```

---

## 🔑 Production Master Credentials

After initial cleanup seeding (`node scripts/clean_and_seed_admin.js`):

| Role | Email | Password |
|---|---|---|
| **System Admin** | `admin@bustracker.com` | `AdminPassword123!` |

---

## 💻 Quick Start & Deployment Guide

### 1. Start Backend API & WebSockets
```bash
cd backend
npm install
npm run dev
```
*Runs on `http://localhost:5000`*

### 2. Start Admin Web Portal
```bash
cd admin-web
npm install
npm run dev
```
*Runs on `http://localhost:4000`*

### 3. Start Passenger Web Portal
```bash
cd passenger-web
npm install
npm run dev
```
*Runs on `http://localhost:3000`*

### 4. Start Mobile Driver App
```bash
cd mobile
npm install
npm run web   # Or 'npx expo start' for iOS/Android emulators
```
*Runs on `http://localhost:8082`*

---

## ⚡ Features Implemented

- **Real-Time Telemetry**: Sub-second GPS updates broadcast via WebSockets.
- **Dual-Token Authentication**: 15m Access Token & 7d rotated SHA-256 Refresh Tokens.
- **Geofencing**: 200-meter radius automated stop arrival detection.
- **Live ETA Calculations**: Haversine distance and live speed predictive engine.
- **OutletBuddy Passenger UI**: Dribbble-inspired interactive map with live stop timelines.
- **Admin Dashboard**: Full CRUD management for fleet, buses, routes, stops, schedules, and drivers.
- **Production Seeding & Wiping**: Automated cleanup script to reset database state.
