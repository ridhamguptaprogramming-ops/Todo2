# 🎉 Event Attendance Website

A modern, fully responsive event attendance platform with smooth UI animations, secure authentication, and comprehensive event management.

## 🌟 Features

### Frontend
- ✨ Premium glassmorphism design with modern aesthetics
- 🎬 Smooth GSAP animations on every interaction
- 📱 Fully responsive mobile-first design
- 🌓 Dark mode toggle
- ⚡ 60 FPS smooth animations
- 🎨 Beautiful color scheme (Indigo, Pink, Teal)
- 💫 Loading animations & skeleton screens
- 📡 Real-time notifications

### Backend
- 🔐 JWT-based authentication
- 📧 Email verification system (Nodemailer)
- 🗄️ MongoDB database with Mongoose
- 🛡️ Security headers & rate limiting
- 🎟️ QR code generation for attendance
- 👨‍💼 Admin panel for user management
- 📊 Attendance analytics
- 📥 Export to CSV functionality

### Additional Features
- 🔔 Email notifications for events
- 📱 PWA support
- 🎯 Social sharing integration
- 💳 Payment gateway ready (Stripe integration)
- 📈 Charts & analytics dashboard
- 🔍 Event search & filtering

## 📋 Project Structure

```
event-attendance-website/
├── frontend/                 # React/Vue frontend
├── backend/                  # Express.js API
├── database/                 # MongoDB schemas
├── docs/                     # Documentation
├── docker-compose.yml        # Docker setup
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB Atlas account (or local MongoDB)
- SMTP credentials (Gmail, SendGrid, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ridhamguptaprogramming-ops/Todo2.git
   cd Todo2
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Panel: http://localhost:3000/admin

## 📚 Documentation

- [Setup Guide](./docs/SETUP.md)
- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Email Verification Flow](./docs/EMAIL_VERIFICATION_FLOW.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🎨 Color Scheme

- **Primary**: `#6366F1` (Indigo)
- **Secondary**: `#EC4899` (Pink)
- **Accent**: `#14B8A6` (Teal)
- **Dark BG**: `#0F172A` (Navy)
- **Light BG**: `#F8FAFC` (Soft White)

## 🔐 Security Features

- JWT authentication with refresh tokens
- Email verification before dashboard access
- Rate limiting on authentication endpoints
- CORS configuration
- Password hashing with bcrypt
- SQL injection & XSS protection
- HTTPS ready

## 📊 Database Models

### User
- Email, password (hashed)
- Verification status
- Profile information
- Role (user/admin)
- Created/Updated timestamps

### Event
- Title, description, date
- Venue, speakers
- Event image
- Capacity tracking
- Status (draft/published/completed)

### Attendance
- User ID, Event ID
- Check-in timestamp
- QR code
- Attendance status
- Notes

## 🛠️ Technology Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- GSAP for animations
- Axios for API calls
- Chart.js for analytics

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT authentication
- Nodemailer for emails
- QRCode library
- Helmet for security

**DevOps:**
- Docker & Docker Compose
- Environment variables (.env)
- GitHub Actions (CI/CD ready)

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/logout` - Logout user

### Events
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### Attendance
- `POST /api/attendance/register` - Register for event
- `POST /api/attendance/checkin` - Mark attendance
- `GET /api/attendance/:eventId` - Get attendance list (admin)
- `GET /api/attendance/user/:userId` - Get user's attendance

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Manage users
- `GET /api/admin/attendance` - Attendance reports
- `POST /api/admin/export` - Export data to CSV

## 🎬 Animation Examples

- Button hover: Scale + glow effect
- Click ripple: Expanding circle animation
- Page transitions: Smooth fade + slide
- Loading skeleton: Shimmer effect
- Notification toast: Slide in from top
- Form validation: Shake animation on error

## 🚢 Deployment

### Using Docker
```bash
docker-compose up -d
```

### Using Vercel (Frontend)
```bash
vercel deploy
```

### Using Heroku (Backend)
```bash
heroku create
git push heroku main
```

## 📧 Email Configuration

Supported providers:
- Gmail SMTP
- SendGrid
- Mailgun
- AWS SES
- Custom SMTP

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 License

MIT License - feel free to use this project

## 🆘 Support

For issues or questions:
- Open an issue on GitHub
- Check documentation in `/docs`
- Email: support@eventattendance.com

## 🙏 Credits

Built with ❤️ using modern web technologies

---

**Status**: ✅ Production Ready
**Last Updated**: May 29, 2026
