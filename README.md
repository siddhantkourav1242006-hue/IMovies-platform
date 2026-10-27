# 🎬 IMovies — Full-Stack Real-Time Movie Booking Platform

An enterprise-grade, real-time cinema ticket reservation platform built with **React (Vite)**, **Node.js (Express.js)**, **Socket.io**, and **MongoDB**.

---

## 🏛️ System Architecture

```
                    ┌─────────────────────────────────────────┐
                    │      React.js (Vite) Client UI          │
                    │  (Tailwind / Responsive Dark Theme)     │
                    └───────────────────┬─────────────────────┘
                                        │
                         HTTP REST      │    WebSockets (Socket.io)
                         (Axios)        │    (Real-time Seat Locks & Updates)
                                        │
                                        ▼
                    ┌─────────────────────────────────────────┐
                    │      Node.js + Express.js Server        │
                    ├─────────────────────────────────────────┤
                    │ • Auth Service (JWT + bcrypt.js)        │
                    │ • Seat Management Service (5-Min TTL)   │
                    │ • Booking Service (Confirm/Cancel/      │
                    │   Reschedule)                           │
                    │ • Payment Service (Razorpay / Stripe)   │
                    │ • Notification Service (Email / SMTP)   │
                    └───────────────────┬─────────────────────┘
                                        │
                                        ▼
                    ┌─────────────────────────────────────────┐
                    │             MongoDB Database            │
                    │  (Users, Movies, Shows, Theatres,       │
                    │   Seats, Bookings, Payments, Favorites) │
                    └─────────────────────────────────────────┘
```

---

## 🚀 Key Modules & Capabilities

### 1. 🖥️ Client-Side Layer (`client/`)
- **Technology Stack**: React 18, Vite 5, React Router v6, Axios, Socket.io Client, QRCode.react.
- **Movie Catalog & Browsing**: Live city selector (Mumbai, Delhi, Bangalore, etc.), genre filters, language chips, and featured banners.
- **Real-Time Interactive Seat Selection**:
  - Live seat map with distinct sections: **VIP Recliners**, **Premium**, and **Standard**.
  - **Live Lock Synchronization**: Clicking a seat locks it across all connected browsers using Socket.io.
  - **5-Minute Countdown Timer**: Dynamic hold timer warning user before hold expiry.
- **Booking Management**:
  - View ticket history and digital pass.
  - Scannable **QR Code** on e-ticket for cinema entry gates.
  - **Self-Service Cancellation**: Instantly releases reserved seats back to the auditorium.
  - **Reschedule**: Choose a different show or date for any confirmed reservation.
- **User Space**: Login, Register, Profile, and Watchlist / Favorites.
- **Admin Control Center**: Live metrics, movie additions, and theater management.

### 2. ⚙️ Server-Side Layer (`server/`)
- **Technology Stack**: Node.js, Express, Socket.io, Mongoose ODM, Helmet, Express-Rate-Limit.
- **Seat Lock Concurrency Engine (`services/seatService.js`)**:
  - Atomic `findOneAndUpdate` state transitions: `available` ➔ `locked` ➔ `booked`.
  - Automatic TTL cleanup releasing expired seat locks back to `available`.
  - All-or-nothing rollback if lock conflicts occur.
- **Payment Gateway Architecture (`services/paymentService.js`)**:
  - Razorpay, Stripe, and PayPal integration interfaces.
  - Built-in sandbox simulation ensuring smooth testing without third-party API blockers.
- **Notification Engine (`services/emailService.js`)**:
  - Automated HTML email confirmations for bookings and cancellations using Nodemailer.

---

## ⚡ Quick Start Guide

### 1. Configure Database & Environment
Create `server/.env` (pre-created for you):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/imovies
JWT_SECRET=imovies_super_secret_jwt_key_2026_cinema_stream
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
CLIENT_URL=http://localhost:5173
```

Create `client/.env` (pre-created for you):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 2. Seed Initial Database
Populates realistic movies (*Dune: Part Two, Oppenheimer, Jawan, Leo, Salaar, Past Lives*), theaters across major cities, showtimes, seats, and demo accounts:
```bash
npm run seed
```

### 3. Run the Servers

#### Terminal 1 — Start the Backend (API + WebSockets):
```bash
npm run server
# Running on http://localhost:5000
```

#### Terminal 2 — Start the React Client:
```bash
npm run client
# Running on http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@imovies.com` | `Admin@12345` |
| **Operations** | `ops@imovies.com` | `Ops@12345` |
| **Test User** | `aanya@example.com` | `User@12345` |

---

## 🛡️ Security & Performance
- **Input Sanitization**: Validation checks on every endpoint via `express-validator`.
- **DDoS & Brute-Force Protection**: Rate limiting on API routes and authentication.
- **Real-Time Room Isolation**: Sockets join isolated rooms per show (`show:<showId>`) preventing noisy broadcasts.
