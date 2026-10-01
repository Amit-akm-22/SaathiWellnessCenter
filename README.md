# Saathi Wellness Center 🤝

A college counseling platform built with the MERN stack.
- **Phase 1**: Student Module
- **Phase 2**: Counselor Module (Appointments, Queue, Reports, Analytics, Overrun & Notification Engine)

---

## Tech Stack
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, Nodemailer
- **Frontend**: React (Vite), React Router, Tailwind CSS v4, Axios, Recharts
- **Auth**: JWT (Bearer token + httpOnly cookie), role-based middleware (`student`, `counselor`, `admin`)
- **State Machine**: Centralized lifecycle transition validator (`pending` -> `approved` -> `in_progress` -> `completed`, etc.)

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB running locally (default: `mongodb://localhost:27017/saathi`)

### 2. Configure Environment Variables
In `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/saathi
JWT_SECRET=saathi_jwt_secret_change_in_production
PORT=5001
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Email Notifications (Optional - Nodemailer SMTP)
# If omitted or unconfigured, the app falls back gracefully without errors and logs delivery as "skipped".
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM=Saathi Wellness Center <no-reply@saathi.edu>

# SMS Notifications (Optional - Twilio / Provider-Agnostic)
# If omitted, notifications are logged with status "skipped".
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Google Meet Integration (Optional - Google Calendar API)
# If omitted, counselor can enter any manual meet link (or default fallback link is generated).
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

### 3. Fallback Mode (Running Without Third-Party Keys)
Saathi is built to run **100% functional out of the box** without external API keys:
- **Email & SMS**: If SMTP or Twilio are omitted, notification dispatchers log the message to `NotificationLog` with status `skipped`. The in-app notification bell continues delivering instantly to the student's dashboard.
- **Google Meet**: If Google Calendar credentials are not configured, counselor actions (such as "Handle Urgent" or "Switch to Online") fall back cleanly to manual meeting links (`provider: 'manual'`) or auto-generated Google Meet format links.

### 4. Seed the Database
Populate 12 users, 14 FAQs, and 28 realistic appointments with screening assessments, session notes, feedback ratings, and time-slot allocations:
```bash
cd server
npm run seed
```

**Seed Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Counselor | `counselor@saathi.edu` | `counselor123` |
| Admin | `admin@saathi.edu` | `admin123` |
| Student | `aarav.patel@student.edu` | `student123` |
| Student | `diya.gupta@student.edu` | `student123` |
| (+ 8 more students) | `...` | `student123` |

### 5. Run the Application
```bash
# Terminal 1 - Backend (port 5001)
cd server
npm run dev

# Terminal 2 - Frontend (port 5173)
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

---

## Phase 2: Counselor Module Features

### 1. Counselor Dashboard (`/counselor/dashboard`)
- 5 Live Metric Cards: Today's Sessions, Pending Requests, Urgent Cases, Completed this Week, Feedback Rating & % Helpful.
- Priority Alert Strip: Instant highlight for unhandled urgent or Severe cases with "Handle Urgent" 1-click online approval.
- Today's Queue snapshot with live slot indicators.

### 2. Appointment Management (`/counselor/appointments`)
- Multi-dimensional filters: Status, Severity (Mild, Moderate, Severe), Issue Category, Branch, Year, Gender, Urgent-only, Date range, Search.
- Priority sorting: Urgent & Severe requests prioritized first.
- Slide-out Detail Drawer: Full 5-item screening answers with scores and labels, student description, and complete longitudinal counseling history.
- Actions:
  - **Approve**: Pending to Approved with optional meeting mode.
  - **Reject**: Requires explanation (min 10 chars + quick pick presets); automatically decrements slot capacity atomically.
  - **Handle Urgent**: Instant approval + online meeting link.
  - **Reschedule**: Select target date and slot; atomically shifts capacity with 409 conflict detection.
  - **Session Notes**: Edit summary, advice, follow-up, and forwarding details.

### 3. Live Session Flow & Queue (`/counselor/queue`)
- Chronological queue for the current day.
- Live active session timer showing elapsed vs planned 45 minutes, with an "Overrunning" warning badge once > 45 minutes.
- **Overrun Management (Notify Delay)**: Pick delay minutes (5, 10, 15, 20, custom) + custom note. Student gets in-app + email/SMS notification and a live delay banner on their dashboard.
- **Session Notes Modal**: Summary, advice, follow-up needed, and forward toggle (with required recipient and rationale).
- Marks completed sessions and triggers student feedback requests.

### 4. Student Directory (`/counselor/students`)
- Aggregated list of all unique students with total appointment count, latest severity, and latest status.
- Filter by branch, year, gender, severity, or search by name / enrollment number.
- Click any student to view their longitudinal counseling history with notes.

### 5. Report Builder (`/counselor/reports`)
- Single-dimension distributions with percentages and visual bars.
- Two-dimension Cross-Tabulation (e.g., Branch × Issue Category, Year × Severity).
- Row-level appointment data table.
- Real CSV file download (`saathi-report-YYYY-MM-DD.csv`).
- Print / PDF export support.

### 6. Interactive Analytics (`/counselor/analytics`)
- Built with Recharts with 7d, 30d, 6m date filters.
- Re-query all charts by branch or year.
- Charts:
  1. Issue Category distribution
  2. Screening Severity donut
  3. Demographics (Gender, Branch, Year)
  4. Appointments Trend over time
  5. Status lifecycle funnel
  6. Peak consultation time slots
- Top insight cards: Most common issue, % Severe cases, Urgent counts, Average rating.

### 7. Notification Audit Log (`/counselor/notifications`)
- Complete audit trail of in-app, email, and SMS notifications.
- Displays delivery diagnostics: sent, failed, or skipped.

---

## Critical Privacy Guarantee
In compliance with strict campus counseling privacy policies:
- `severity`, `screeningAnswers`, `screeningScore`, `urgentFlag`, and `sessionNotes` are **strictly omitted** from every `/api/student/*` response.
- Students only view their booked slots, appointment status, delay banners, and online meeting links.
