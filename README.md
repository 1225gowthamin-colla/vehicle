# Smart Vehicle Service & Garage Management System

A production-grade SaaS platform for managing vehicle services, garage operations, and real-time tracking.

## 🚀 Overview
This project is a comprehensive solution for garage owners (Sub-Admins), customers (Users), and platform owners (Admin). It features a hierarchical role-based access control system, real-time vehicle service tracking, and automated pricing management.

## 🛠 Tech Stack
- **Frontend:** Next.js 16 (Turbopack), Tailwind CSS, ShadCN UI, Zustand, Framer Motion.
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT Authentication.
- **Styling:** Glassmorphism & Premium Dark Mode UI.

## 👥 Roles & Permissions

### 👑 Platform Admin
- **Email:** `admin@smartvehicle.com` (Strictly restricted)
- **Functions:** 
  - Global oversight of all users and garages.
  - Set and update hourly pricing for all vehicles.
  - Monitor global activity logs and transaction history.
  - Access to all sub-admin and user dashboards.

### 🏢 Sub-Admin (Garage Owner)
- **Functions:**
  - Create and manage their own vehicle fleet.
  - View bookings made for their vehicles.
  - **Live Tracking:** Update vehicle status (Pending → On the Way → Delivered) with automatic timestamping.
  - Manage user data associated with their garage.

### 👤 User (Customer)
- **Functions:**
  - Browse available vehicles from multiple garages.
  - Book services and vehicles.
  - **Live Tracking:** Track their vehicle's status, location, and arrival time in real-time.

## 📦 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd "vehicle service"
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create a .env file with:
# PORT=5000
# MONGO_URI=<your-mongodb-uri>
# JWT_SECRET=<your-secret>
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

## 🔒 Security Features
- **Strict Role-Based Access Control (RBAC):** Hierarchical access (Admin > Sub-Admin > User).
- **Email-Locked Admin:** The Admin Dashboard is strictly locked to `admin@smartvehicle.com`.
- **JWT Protection:** All sensitive API routes are protected by JSON Web Tokens.
- **Secure Password Hashing:** Using BcryptJS for user credentials.

## 📈 Tracking System
The system features a custom **Timestamp Tracking** module:
- **Pending:** Initial state after booking.
- **On the Way:** Triggered by Sub-Admin; updates user with ETA.
- **Delivered:** Automatically records the `arrivedAt` timestamp for audit logs.

---
Built with ❤️ for Advanced Vehicle Management.
