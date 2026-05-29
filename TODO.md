# TODO.md — Event Attendance Management System (Premium SaaS)

## Phase 1: Frontend foundation (Vite + React + Tailwind + Framer Motion)
- [ ] Create new React Vite app structure inside `frontend/` (or move existing files aside).
- [ ] Add Tailwind, Framer Motion, React Router, Redux Toolkit, Socket.io-client, Recharts.
- [ ] Implement AppShell layout (header/sidebar), glassmorphism components, dark/light toggle, particles background.
- [ ] Implement route transitions with Framer Motion.
- [ ] Implement Landing page (Hero, stats counters, features, testimonials, pricing, FAQ, footer).

## Phase 2: Authentication (Firebase Auth + JWT bridge)
- [ ] Implement Firebase Auth client integration (email/password, Google, GitHub).
- [ ] Implement login/signup/forgot/verify UI routes.
- [ ] Implement backend token verification and JWT issuance.
- [ ] Implement JWT-protected API layer in frontend.

## Phase 3: Core user flows
- [ ] Implement Events page (search, filters, cards, pagination, grid/list toggle).
- [ ] Implement Event details page (timeline, speakers, venue, register, share, download brochure).
- [ ] Implement My Registrations page (upcoming/completed, attendance/approval status).

## Phase 4: QR attendance + real-time updates
- [ ] Implement QR code generation (unique per registration).
- [ ] Implement QR scanner camera integration.
- [ ] Implement backend attendance verification + atomic updates.
- [ ] Implement Socket.io real-time counters + success animations.

## Phase 5: Certificates
- [ ] Implement certificate generation data model and preview.
- [ ] Implement PDF export and Firebase Storage upload.
- [ ] Implement certificate verification route + frontend validation.

## Phase 6: Admin panel
- [ ] Implement admin dashboard with Recharts.
- [ ] Implement event management CRUD + banner upload.
- [ ] Implement attendee management (approve/reject + export CSV).
- [ ] Implement admin QR scanner panel + live attendance count.
- [ ] Implement notification center UI + backend hooks.
- [ ] Implement admin settings (theme, site config, SMTP, Firebase config).

## Phase 7: Security, QA, deployment
- [ ] Implement Firebase Security Rules (if applicable).
- [ ] Add backend input validation (zod/joi), XSS protections.
- [ ] Add rate limiting to checkin/scan endpoints.
- [ ] Run local end-to-end checks.
- [ ] Prepare deployment config for Vercel + Render/AWS.

