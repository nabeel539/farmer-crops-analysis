# Krishi AgriTech / Farmer & Crop Management System (farmer-crops-analysis)

A next-generation enterprise-grade agricultural intelligence, GIS land parcel mapping, wheat phenology tracking, and agronomic management platform built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, and **Leaflet GIS**.

---

## 🌟 Core Features

### 1. 🚜 Farmer Portal (`/farmer`)
- **My Wheat Crop:** Live phenology timeline from Land Preparation to Harvest.
- **Land Parcels & Satellite GIS:** Field boundaries with interactive maps.
- **Field Operations Log:** Log fertilization (Urea, DAP), irrigation, and pesticide sprays with exact date and time.
- **Crop Doctor & AI Diagnostics:** Leaf disease visual scanning for Stripe/Yellow Rust with instant agronomist hotline.
- **Agricultural Weather & Smart Advisory:** 24-hour micro-climate hourly trend, spray feasibility window, soil moisture, and live Grain Mandi (MSP & Silo gate rates).

### 2. 🏛️ Enterprise Admin Dashboard (`/admin`)
- **Interactive GIS Map:** Real-time satellite field parcel inspection with smooth pan/zoom via the **Farmer Selector Dropdown**.
- **Farmer Enrollment (`/admin/farmers`):** Verified grower registrations, land records, and CNIC profiles.
- **Cadastral Land Parcels (`/admin/land-parcels`):** Satellite GPS boundary editor with live coordinate detection.
- **Crop Cycles (`/admin/crop-cycles`):** Multi-stage wheat phenology monitoring and NDVI canopy health.
- **Field Operations & Activities (`/admin/activities`):** Real-time feed of all farmer and officer activity submissions.

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Run Locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Admin Dashboard:** `http://localhost:3000/admin`
- **Farmer Portal:** `http://localhost:3000/farmer`
- **Field Officer Portal:** `http://localhost:3000/field-officer`

---

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router)
- **State Management:** Redux Toolkit
- **Mapping & GIS:** Leaflet / React-Leaflet
- **Styling:** Tailwind CSS & Radix UI primitives
- **Icons:** Lucide React
- **Notifications:** Sonner Toast
