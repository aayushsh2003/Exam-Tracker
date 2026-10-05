# 🇮🇳 2026–2027 Indian Competitive Examination & Recruitment Command Center

[![React](https://img.shields.io/badge/React-18.x-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_%26_Firestore-ffca28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285f4?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Developer](https://img.shields.io/badge/Developed_by-Aayush_Sharma-indigo)](https://aayush-ki-pehchan.vercel.app/)

A secure, full-stack recruitment tracking platform designed for Indian aspirants preparing across Banking (**IBPS & SBI**), Scientific Research (**ISRO ICRB & BARC**), Engineering & PSU Cadres (**GATE, CIL, IOCL, AAI**), and Delhi State Technical Services (**DSSSB**).

Built with **Zero Public Data Exposure**: all candidate applications, admit cards, scores, notes, and fee logs are strictly protected behind authentication with per-user Google Cloud Firestore database isolation.

---

## 👨‍💻 About the Developer

This platform was architected, designed, and developed by **Aayush Sharma** (**Aayush Ki Pehchan**).

| Attribute | Details |
|---|---|
| **Full Name** | **Aayush Sharma** |
| **Brand / Alias** | **Aayush Ki Pehchan** |
| **Headline** | Aspiring Software Developer \| Web Development Enthusiast \| Passionate About Open-Source & AI \| Data Enthusiast |
| **Portfolio Website** | [https://aayush-ki-pehchan.vercel.app/](https://aayush-ki-pehchan.vercel.app/) |
| **Email** | [aayushsharma4437@gmail.com](mailto:aayushsharma4437@gmail.com) |
| **Location** | Jaipur, Rajasthan, India |
| **Field of Study** | Computer Science & Engineering (Artificial Intelligence) |

### 🌐 Connect with Aayush Sharma

- 💼 **LinkedIn**: [linkedin.com/in/aayush-sharma-a44062299/](https://www.linkedin.com/in/aayush-sharma-a44062299/)
- 💻 **GitHub**: [github.com/aayushsh2003](https://github.com/aayushsh2003)
- 🧠 **LeetCode**: [leetcode.com/u/aayushsh2003/](https://leetcode.com/u/aayushsh2003/)
- 🏆 **HackerRank**: [hackerrank.com/profile/aayushsharma4437](https://www.hackerrank.com/profile/aayushsharma4437)
- 🐦 **X (Twitter)**: [x.com/aayushSh2003](https://x.com/aayushSh2003)
- 📸 **Instagram**: [instagram.com/aayushsh2003](https://www.instagram.com/aayushsh2003)

### 🛠️ Developer Technical Skills

- **Programming Languages**: C, C++, Java, Python, JavaScript (ES6+), TypeScript
- **Web & Full-Stack**: React.js, Node.js, Express.js, HTML5, CSS3, Tailwind CSS, Bootstrap, RESTful APIs
- **Databases & Cloud**: Google Cloud Firestore, Firebase Authentication, MongoDB, SQL / PostgreSQL
- **Data & AI Analytics**: SQL, Pandas, NumPy, SAS Viya (Visual Business Analytics)
- **Tools & Platforms**: Git, GitHub, VS Code, Linux, Vite, Vercel

### 💼 Experience & Credentials

- **Web Development Intern** — *Rama Innovation (Jaipur, India)*: Developed modern responsive web applications, frontend components with React and Tailwind CSS, and version-controlled collaborative workflows.
- **Trainee / SAS Certified Specialist** — *R-CAT (Rajiv Gandhi Centre of Advanced Technology)*: Completed rigorous hands-on training in SAS Visual Business Analytics using SAS Viya for data-driven insights.

---

## 🌟 Architecture & Core Capabilities

### 1. 🔒 Strict Authentication & Zero Public Data Exposure
- **Auth Landing Gate (`AuthLandingGate.tsx`)**: No exams, applications, notes, or scorecards exist in public DOM or unauthenticated state (`exams = []`, `milestones = []`).
- **Flexible Sign-In Methods**:
  - One-Click **Google Sign-In** via popup (`signInWithPopup`).
  - **Email & Password Authentication** with real-time validation and error diagnostics.
  - Optional **Guest Sandbox Session** with local browser session isolation.
- **Immediate Data Wipe on Sign Out**: Logging out immediately flushes memory arrays and returns to the secured portal entrance.

### 2. 🛡️ Per-User Isolated Cloud Datastore
- Each candidate has their own dedicated Firestore path:
  - User Profile: `/users/{userId}`
  - Exam Tracker Master Document: `/user_trackers/{userId}`
  - Subcollections: `/user_trackers/{userId}/exams/{examId}` and `/user_trackers/{userId}/milestones/{milestoneId}`
- Enforced with Attribute-Based Access Control (ABAC) in `firestore.rules`:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /user_trackers/{userId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        match /{allPaths=**} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
  }
  ```

### 3. 📋 Master Recruitment Tracker (31 Supported Exams)
- **4 Categorized Pipeline Partitions**:
  1. *Completed & Results Announced* (Historical records & cutoffs)
  2. *Completed & Result / Next Stage Awaited* (Active pipelines)
  3. *Upcoming Scheduled Exams* (Confirmed CBT dates & admit cards)
  4. *Awaiting Official Exam Date Release* (TBA tracking watchlist)
- **Multi-Cadre Filtering**: Banking (IBPS/SBI), Scientific Research (ISRO/BARC), Engineering (GATE/PSUs), and Delhi State (DSSSB).
- **Search & Sort Engine**: Filter by advertisement number (*41/26, 39/26, 28/26, 27/26*), qualification, fee status, and priority.

### 4. 🧭 7-Stage Visual Roadmap & Document Verification Locker
- Tracks each application through:
  1. Application Submitted
  2. Admit Card Release
  3. Prelims / Written Exam
  4. Mains / Technical Phase
  5. Interview / Tier-III
  6. Document Verification (DV)
  7. Final Merit List / Outcome Logged
- Integrated DV checklist for marksheets, caste certificates, degree certificates, and identity proofs.

### 5. 🤖 AI Exam Strategist (Powered by Gemini)
- Integrated Gemini AI advisor providing:
  - 60-day personalized study timetable.
  - High-yield Computer Science core subject checklists.
  - Strategies for balancing overlapping Banking & PSU syllabi.
  - Technical and HR interview preparation guides.

### 6. 💾 Bidirectional Data Portability
- **JSON Export/Import**: Export your entire dataset partitioned into the 4 standard categories.
- **CSV Spreadsheet Export**: One-click Excel-compatible spreadsheet generation.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn package manager

### Local Setup

1. **Clone repository**:
   ```bash
   git clone https://github.com/aayushsh2003/exam-tracker-master.git
   cd exam-tracker-master
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Firebase**:
   Ensure `src/firebase/config.ts` matches your Firebase project credentials.

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📄 License & Attribution

Designed and developed by **Aayush Sharma** ([Aayush Ki Pehchan](https://aayush-ki-pehchan.vercel.app/)).

Distributed under the MIT License. See `LICENSE` for more information.
