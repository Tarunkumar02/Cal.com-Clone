# Cal.com Clone - Scheduling & Booking Application

A fully functional scheduling and booking web application that replicates Cal.com's design and features.

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, Vite, React Router |
| Backend | Node.js, Express.js |
| Database | MySQL with Prisma ORM |
| Email | Nodemailer (SMTP) |

## 📋 Features

### Admin Dashboard
- ✅ Event Types management (create, edit, delete, toggle)
- ✅ Availability schedules with weekly rules
- ✅ Date overrides (block dates or custom hours)
- ✅ Bookings dashboard with filters (upcoming/past/cancelled)
- ✅ Reschedule and cancel bookings

### Public Booking
- ✅ Public booking pages with unique URLs
- ✅ Calendar view with available dates
- ✅ Time slot selection respecting availability
- ✅ Custom booking questions
- ✅ Booking confirmation page

### Email Notifications
- ✅ Booking confirmation emails
- ✅ Cancellation emails
- ✅ Reschedule notification emails

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create `backend/.env`:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/cal_clone_db"

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Cal Clone <your-email@gmail.com>"

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

### 3. Database Setup

```bash
cd backend

# Create database in MySQL first
mysql -u root -p -e "CREATE DATABASE cal_clone_db;"

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed sample data
npm run db:seed
```

### 4. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Server runs on http://localhost:3001

# Terminal 2 - Frontend
cd frontend
npm run dev
# App runs on http://localhost:5173
```

## 📁 Project Structure

```
cal-com-clone/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.js          # Sample data
│   ├── src/
│   │   ├── config/          # Database & email config
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   └── services/        # Business logic
│   └── server.js            # Entry point
│
└── frontend/
    └── src/
        ├── components/      # Reusable components
        ├── pages/           # Page components
        ├── services/        # API client
        └── styles/          # Global CSS
```

## 🔗 API Endpoints

### Event Types
- `GET /api/event-types` - List all
- `POST /api/event-types` - Create
- `PUT /api/event-types/:id` - Update
- `DELETE /api/event-types/:id` - Delete

### Availability
- `GET /api/availability` - List schedules
- `POST /api/availability` - Create schedule
- `POST /api/availability/:id/overrides` - Add date override

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings/:id/cancel` - Cancel
- `POST /api/bookings/:id/reschedule` - Reschedule

### Public (No Auth)
- `GET /api/public/:slug` - Event info
- `GET /api/public/:slug/dates` - Available dates
- `GET /api/public/:slug/slots` - Available slots
- `POST /api/public/:slug/book` - Create booking

## 📝 Key Assumptions

1. Single default admin user (no authentication required)
2. Timezone is set to Asia/Kolkata by default
3. Slot generation happens server-side
4. SMTP must be configured for email notifications

## 🎨 Design

The UI closely follows Cal.com's design with:
- Dark theme with purple accent colors
- Card-based dashboard layout
- Sidebar navigation for admin
- Clean, modern booking flow

---
