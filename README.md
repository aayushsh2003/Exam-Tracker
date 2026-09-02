# 2026 Exam & Recruitment Master Portal

A modern, high-performance command center for tracking, managing, and strategizing across all 2026 competitive examinations, recruitment drives, PSU technical roles, and banking officer notifications.

---

## 🌟 Overview

The **2026 Exam & Recruitment Master Portal** transforms fragmented spreadsheets and PDFs into a single, unified workflow system. It tracks all application statuses, payment receipts, admit card releases, exam dates, answer key reviews, interview stages, and final merit outcomes.

---

## 🚀 Key Features

### 1. 📊 Executive Analytics Dashboard
- **Real-Time KPIs**: High-level metrics for all 20 confirmed applications, high-priority officer roles, completed exams, and overall Document Verification (DV) readiness.
- **Immediate Deadlines**: Countdown timers for critical upcoming dates (*03-Sep IndianOil, 16-Sep ISRO ICRB, 04-Oct SBI PO Mains, 10-11 Oct IBPS Clerk, 01-Nov IBPS SPL Mains*).
- **Category & Stage Breakdown**: Visual distribution of Banking, PSU/CS, Research, Regulatory, and State recruitment exams.
- **Scorecard Hub**: Quick summary of completed exams, raw scores, percentiles, and stage outcomes.

### 2. 📋 Master Tracker
- **Dual View Modes**: Switch seamlessly between an interactive data table and responsive bento cards.
- **Multi-Filter Engine**: Filter by Category (*Banking, PSU/CS, Research, Regulatory, State*), Priority (*Very High, High, Medium, Low*), Pipeline Stage, and Status (*All, Active, Completed*).
- **Comprehensive Search**: Search across exam titles, post designations, qualification requirements, and advertisement numbers (*41/26, 39/26, 28/26, 27/26*).

### 3. 🎯 Exam Completion & Scorecard Logger
- **Mark Exam as Completed**: Log attempt dates, marks scored, percentile rankings, and outcomes (*Qualified for Mains, Answer Key Checked, In Merit List, etc.*).
- **Post-Exam Review Notes**: Record paper difficulty, memory-based questions, and key lessons.
- **Reopen / Edit Flexibility**: Revert or update exam records at any point.

### 4. 🧭 7-Stage Visual Roadmap
- Tracks applications across all 7 operational milestones:
  1. *Application Submitted*
  2. *Admit Card Release*
  3. *Prelims / CBT / Written Exam*
  4. *Mains / Technical Phase*
  5. *Interview / Tier-III*
  6. *Document Verification (DV)*
  7. *Exam Completed & Results*

### 5. 📅 Scheduling Calendar & TBA Watchlist
- **Interactive Calendar Matrix**: Month-by-month grid displaying confirmed exam schedules with event popovers.
- **TBA Watchlist Drawer**: Dedicated monitoring panel for exams with dates awaiting official release.

### 6. ⚡ Action Plan & Milestones Checklist
- Prioritized task checklist for immediate exam preparation actions, admit card downloads, and fee receipt verifications.
- Interactive status toggles, progress bars, and custom task creation.

### 7. 📑 Stage & Document Verification Matrix
- Direct replica of the recruitment tracking matrix.
- Inline status toggles for *Application Confirmed*, *Admit Card Downloaded*, *Exam Attempted*, *Answer Key Checked*, and *Result Announced*.
- Direct note-taking and verification tracking per exam.

### 8. 🗄️ Important References & Document Locker
- Portal registry with official portal links (*DSSSB, IBPS, SBI, ISRO, SEBI, BARC, IndianOil, CIL*).
- Universal Document Verification (DV) readiness checklist (10th/12th marksheets, B.Tech/degree certificates, category/OBC certificates, identity proofs).

### 9. 🤖 AI Exam Strategist (Gemini 2.5)
- Server-side AI advisor providing:
  - 60-day personalized study timetables.
  - High-yield Computer Science core subject checklists.
  - Strategies for balancing overlapping Banking & Technical syllabi.
  - Technical and HR interview preparation guides.

---

## 💻 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend**: Node.js, Express (Vite Middleware)
- **AI Integration**: `@google/genai` (Gemini Flash / Pro)
- **Storage**: Client-Side Persistence with JSON & CSV Export/Import capabilities

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (copy from `.env.example` if required):
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser at `http://localhost:3000`.

---

## 📦 Build & Deployment

To generate a production-ready bundle:

```bash
npm run build
```

To run the production server:

```bash
npm start
```

---

## 📄 License

This project is licensed under the MIT License.
