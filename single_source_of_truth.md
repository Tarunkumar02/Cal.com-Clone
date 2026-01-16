# Single Source of Truth (SSOT)

## 1. Project Overview

### 1.1 Project Name
Cal.com Clone – Scheduling & Booking Web Application

### 1.2 Objective
Build a fully functional scheduling and booking web application that closely replicates **Cal.com’s design, user experience, layout patterns, and interaction flows**. The application must allow a default admin user to create event types, define availability, and allow public users to book time slots through shareable booking links.

This document is the **authoritative source of truth** for the entire project. All implementation decisions must strictly adhere to this file.

---

## 2. Scope Definition

### 2.1 In Scope
- Event type creation and management
- Availability configuration with multiple schedules
- Public booking flows
- Booking management dashboard
- Rescheduling and cancellation
- Email notifications
- Cal.com–inspired UI/UX

### 2.2 Out of Scope
- Authentication / login system
- Multi-user accounts
- Payments or integrations
- Third-party calendar sync (Google, Outlook, etc.)

---

## 3. Technical Stack (Fixed & Mandatory)

### Frontend
- React.js (Single Page Application)

### Backend
- Node.js
- Express.js

### Database
- MySQL (custom schema; schema quality will be evaluated)

No alternative frameworks, languages, or databases are permitted.

---

## 4. User Roles

### 4.1 Admin (Default Logged-In User)
- Manages event types
- Configures availability
- Views, cancels, and reschedules bookings

> Note: No authentication is required. Assume a default admin user exists (e.g., `user_id = 1`).

### 4.2 Public User (Booker)
- Accesses booking pages via public URLs
- Selects date and time
- Submits booking details

---

## 5. Functional Requirements

### 5.1 Event Types Management

The system **must** support the following:

- Create event types with:
  - Title
  - Description
  - Duration (in minutes)
  - URL slug (unique)
- Edit existing event types
- Delete existing event types
- List all event types on an admin dashboard
- Generate a **unique public booking URL** per event type

Each event type must:
- Be independently configurable
- Have its own duration, buffer time, availability, and booking questions

---

### 5.2 Availability Settings

The system must support flexible availability configuration.

#### Weekly Availability
- Select available days of the week (e.g., Monday–Friday)
- Define available time ranges per day (e.g., 09:00–17:00)
- Associate availability with a timezone

#### Multiple Availability Schedules
- Admin can create multiple availability schedules
- Event types can be linked to a specific availability schedule

#### Date Overrides
- Block specific dates completely
- Override working hours for specific dates

---

### 5.3 Public Booking Page

Each event type must expose a public booking page with the following:

#### Calendar View
- Monthly calendar UI
- Disable unavailable dates
- Respect timezone

#### Time Slot Display
- Display only valid time slots
- Slot generation must respect:
  - Event duration
  - Buffer time
  - Availability rules
  - Date overrides
  - Existing bookings

#### Booking Form
- Collect:
  - Booker name
  - Booker email
  - Custom booking questions (event-specific)

#### Booking Rules
- Prevent double booking of the same time slot
- Handle concurrent booking attempts safely

#### Confirmation Page
- Display booking details:
  - Event name
  - Date and time
  - Timezone
  - Booker details

---

### 5.4 Bookings Dashboard (Admin)

Admin must be able to:

- View upcoming bookings
- View past bookings
- Cancel a booking
- Reschedule a booking

Rescheduling must:
- Free the old time slot
- Recalculate available slots
- Trigger email notifications

---

## 6. Advanced / Must-Have Features

These features are mandatory and **must not be skipped**:

- Fully responsive UI (mobile, tablet, desktop)
- Multiple availability schedules
- Date overrides
- Rescheduling flow
- Email notifications for:
  - Booking confirmation
  - Booking cancellation
  - Booking reschedule
- Buffer time between meetings
- Custom booking questions per event type

---

## 7. Non-Functional Requirements

### 7.1 UI / UX
- Must closely resemble Cal.com’s:
  - Layout structure
  - Spacing and typography
  - Card-based dashboards
  - Sidebar navigation
  - Calendar interactions

> Exact copying is forbidden. Visual resemblance and interaction parity are required.

### 7.2 Performance
- Slot generation must occur server-side
- API responses should be optimized for minimal latency

### 7.3 Reliability
- Prevent race conditions during booking
- Ensure transactional consistency in bookings

### 7.4 Maintainability
- Clean separation of concerns (frontend, backend, database)
- Readable, well-structured code

---

## 8. Slot Generation Logic (Critical)

Slot generation **must** follow this exact order:

1. Fetch event duration and buffer time
2. Fetch associated availability schedule
3. Apply weekly availability rules
4. Apply date overrides
5. Generate raw time slots
6. Remove slots overlapping with existing bookings
7. Remove slots violating buffer time rules
8. Return final list of available slots

Slot calculation must be performed on the backend only.

---

## 9. Database Requirements

- Fully normalized relational schema
- Tables must minimally include:
  - event_types
  - availability_schedules
  - availability_rules
  - date_overrides
  - bookings
  - booking_questions
  - booking_answers

Database design quality will be evaluated.

---

## 10. Sample Data

The database must be seeded with:
- At least 2 event types
- At least 1 availability schedule
- At least 3 bookings (past and upcoming)

Application must work immediately after setup.

---

## 11. Email Notifications

- Use SMTP-based email delivery
- Emails must be sent on:
  - Booking confirmation
  - Booking cancellation
  - Booking reschedule

Email templates should include:
- Event details
- Date and time
- Timezone

---

## 12. README Requirements

The repository must include a README file with:
- Project overview
- Tech stack
- Setup instructions
- Environment variables
- Database setup steps
- Key assumptions

---

## 13. Assumptions

- Single default admin user exists
- No authentication required
- Timezone correctness is mandatory

---

## 14. Success Criteria

The project is considered complete when:
- All features listed in this document are implemented
- UI closely resembles Cal.com
- No feature from this SSOT is missing
- Application runs end-to-end without errors

---

**This document is final and binding. Any implementation must strictly follow this SSOT.**

