# Refactor Notes — Event Attendance Management System

This repo currently contains:
- `backend/` (Express + JWT + existing Mongo/Mongoose-like models)
- `frontend/` (vanilla JS/HTML + CSS)

The requested target stack is:
- Frontend: React (Vite) + Tailwind + Framer Motion + Redux Toolkit + React Router + Socket.io-client + Recharts
- Backend: Express + Socket.io + JWT (plus Firebase Auth verification) and persistence in Firebase Firestore + Storage

Planned approach:
1. Create a new Vite React app inside `frontend/` (or a dedicated folder if needed) and migrate UI routes.
2. Update backend APIs to read/write Firestore collections:
   - Users, Events, Registrations, Certificates
3. Replace QR generation/attendance check-in with Firestore transactional updates.
4. Implement admin charts using Recharts.

First implementation milestone to start next:
- Scaffold Vite React + Tailwind + Framer Motion inside `frontend/` and add routing + placeholder pages.

