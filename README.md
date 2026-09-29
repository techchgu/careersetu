# CareerSetu

> **"From Student Profile to Career Readiness"**  
> AI-Powered Career Guidance, Skill Development & Career Readiness Platform.

---

## Overview

**CareerSetu** (करियर सेतु — *"Career Bridge"*) is a full-stack, hackathon-ready career readiness platform engineered specifically for college students, freshers, job seekers, and career changers. 

Rather than functioning as an isolated text chatbot, CareerSetu unifies every stage of the student transition into professional employment: from profile discovery and academic skill gap analysis to interactive roadmap tracking, AI resume enhancement, real-time mock interviews, private opportunities, and verified government openings.

---

## Problem Statement

Higher education often creates a substantial gap between textbook academic coursework and modern industry hiring benchmarks:
- **Fragmented Guidance**: Students must consult dozens of disconnected websites to find roadmaps, courses, and job boards.
- **Invisible Skill Gaps**: Candidates often fail technical screenings without knowing the exact missing tools or competencies needed for target job descriptions.
- **Suboptimal Resumes**: Early-career resumes frequently get discarded by Applicant Tracking Systems (ATS) due to poor action verbs and missing keywords.
- **Interview Anxiety**: Students lack accessible, zero-cost mock interview environments that provide instant technical and communication critiques.
- **Overlooked Public Sector Vacancies**: Thousands of stable technical engineering opportunities in Central, State, and PSU organizations (ISRO, NIC, BEL, CDAC) go unnoticed due to scattered notification portals.

---

## Proposed Solution

CareerSetu solves this by building an end-to-end, guided pipeline:

```
Student Profile 
  → Academic Analysis 
  → Career Assessment 
  → AI Career Recommendation 
  → Skill Gap Analysis 
  → Courses & Certifications 
  → Jobs & Internships 
  → Government Employment 
  → AI Resume Improvement 
  → AI Mock Interview 
  → Personalized 6-Month Roadmap 
  → Progress Dashboard
```

---

## Core Features

1. **Futuristic, Responsive Landing Page**: Highlights the mission, connected career journey, feature breakdown, and onboarding pathways without external heavy CSS frameworks.
2. **Student & Academic Profile**: Captures university credentials, GPA, branches, technical and soft skills, capstone projects, and career targets.
3. **Career Assessment Test**: 8 targeted questions analyzing problem-solving styles, daily work environments, and career milestones.
4. **Visual Skill Gap Dashboard**: Direct percentage bar comparison of student competencies against employer hiring requirements with an 8-week bridge plan.
5. **Curated Learning Hub**: Verified courses and certifications from open authorities (freeCodeCamp, MDN, Google Cloud, Meta, NPTEL) with 1-click progress tracking.
6. **Jobs & Internships Board**: Curated technical roles and internships with location, role, and compensation filters.
7. **Government & PSU Employment Hub**: Verified technical and administrative openings across ISRO, NIC, BEL, CDAC, and SSC with direct links to official notification portals.
8. **Interactive 6-Month Career Roadmap**: Dynamic milestone checklist with 3-state task toggles (*Not Started* → *In Progress* → *Completed*) synced with Cloud Firestore.
9. **Career Readiness Progress Dashboard**: Multi-pillar index consolidating profile completeness, roadmap milestones, ATS resume score, and interview ratings into a unified readiness grade.

---

## AI Features (Powered by Gemini API)

CareerSetu uses the Google Gemini API securely through serverless backend functions:
- **AI Career Recommendations (`/api/career-analysis`)**: Synthesizes education, GPA, projects, and assessment results into top 3 career paths with suitability rationale, matching skills, and missing gaps.
- **AI Skill Gap Computation (`/api/skill-gap`)**: Calculates relative proficiency percentages, identifies critical missing tools, and outlines an 8-week learning curriculum.
- **AI Resume Assistant (`/api/resume`)**: Analyzes resume content against target roles to output ATS compatibility scores, found/missing keywords, and rewrites project bullet points with quantifiable action verbs.
- **AI Mock Interview Room (`/api/mock-interview`)**: 
  - Dynamic question generator tailored to candidate role, interview type (technical, behavioral, problem-solving), and difficulty.
  - Real-time answer evaluation grading technical accuracy, communication clarity, strengths, areas for improvement, and model responses.

---

## Technology Stack

Strictly constructed using lightweight, high-performance web standards:

| Component | Technology | Description |
|---|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) | 100% pure modern web standards. Zero heavy frontend frameworks (no React, Next.js, or Angular). |
| **Authentication** | Firebase Authentication | Secure email & password auth with session preservation. |
| **Database** | Firebase Firestore | NoSQL document storage for profiles, assessments, roadmaps, and interview history. |
| **Backend / API** | Vercel Serverless Functions | Node.js JavaScript functions hosted under `/api/*.js`. |
| **AI Engine** | Google Gemini API | Server-side invocation via `GEMINI_API_KEY`. |
| **Deployment** | Vercel | Production static and serverless function deployment via `vercel.json`. |
| **Version Control**| GitHub | Clean structure with comprehensive `.gitignore` and security rules. |

---

## Architecture

```
                       ┌─────────────────────────┐
                       │      USER BROWSER       │
                       │ (HTML5 / CSS3 / Pure JS)│
                       └────────────┬────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           │                        │                        │
           ▼                        ▼                        ▼
┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
│ Firebase Auth      │   │ Cloud Firestore    │   │ Vercel Serverless  │
│ (User Sessions)    │   │ (Profiles, Roadmaps│   │ Functions (/api/*) │
└────────────────────┘   └────────────────────┘   └──────────┬─────────┘
                                                             │ (Server-Side HTTPS)
                                                             ▼
                                                  ┌────────────────────┐
                                                  │ Google Gemini API  │
                                                  │ (Key never in JS)  │
                                                  └────────────────────┘
```

---

## Folder Structure

```
CareerSetu/
│
├── index.html                  # Futuristic Landing Page
│
├── pages/
│   ├── login.html              # Authentication Login & 1-Click Judge Access
│   ├── signup.html             # User Registration
│   ├── dashboard.html          # Main Command Center & Visual Journey Tracker
│   ├── profile.html            # Academic, Project & Skill Profile Form
│   ├── assessment.html         # Career Assessment Questionnaire
│   ├── career.html             # AI Career Recommendations & Match Analysis
│   ├── skill-gap.html          # Visual Skill Gap Meters & 8-Week Action Plan
│   ├── learning.html           # Curated Courses & Certifications Directory
│   ├── opportunities.html      # Jobs & Internships Search & Application Tracker
│   ├── government.html         # Government & PSU Vacancy Notifications
│   ├── resume.html             # AI Resume Optimizer & ATS Analyzer
│   ├── interview.html          # Interactive AI Mock Interview Room
│   ├── roadmap.html            # 6-Month Milestone Career Roadmap
│   └── progress.html           # Multi-Pillar Career Readiness Dashboard
│
├── css/
│   ├── style.css               # Design System, CSS Variables, Typography & Base
│   ├── auth.css                # Authentication Layouts & Inputs
│   ├── dashboard.css           # App Shell, Sidebar, Timeline, and Card Components
│   └── responsive.css          # Mobile & Tablet Responsive Media Queries
│
├── js/
│   ├── firebase.js             # Firebase Config & Hackathon Storage Adapter
│   ├── auth.js                 # Session State, Route Guards & User Profile Binder
│   ├── dashboard.js            # Dashboard Metrics & Journey Progression
│   ├── profile.js              # Profile Form Persistence
│   ├── assessment.js           # Assessment Logic & Scoring
│   ├── career.js               # Career Recommendations Renderer
│   ├── skill-gap.js            # Skill Gap Comparison Bars
│   ├── learning.js             # Learning Hub & Resource Tracking
│   ├── opportunities.js        # Job Application Tracking
│   ├── government.js           # Government Portal Links & Filters
│   ├── resume.js               # ATS Scoring & Bullet Enhancer
│   ├── interview.js            # Mock Interview Simulator Engine
│   ├── roadmap.js              # 6-Month Task State Toggler
│   └── progress.js             # Career Readiness Score Calculator
│
├── api/
│   ├── career-analysis.js      # Serverless Endpoint: AI Career Recommendations
│   ├── skill-gap.js            # Serverless Endpoint: Skill Gap Analysis
│   ├── roadmap.js              # Serverless Endpoint: Dynamic 6-Month Roadmap
│   ├── resume.js               # Serverless Endpoint: ATS Resume Analysis
│   └── mock-interview.js       # Serverless Endpoint: Question & Answer Evaluator
│
├── assets/
│   ├── images/
│   └── icons/
│       └── logo.svg            # CareerSetu Vector Brand Icon
│
├── firebase/
│   └── firestore.rules         # Security Rules (User Isolation & Public Reads)
│
├── screenshots/                # Application Screenshots
├── .env.example                # Environment Variable Template
├── .gitignore                  # Git Ignore Rules
├── vercel.json                 # Vercel Deployment Configuration
├── package.json                # Project Manifest
└── README.md                   # Full Documentation
```

---

## Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project named `CareerSetu`.
2. Enable **Authentication** -> Choose **Email/Password** as the sign-in provider.
3. Enable **Cloud Firestore** in production mode.
4. Deploy security rules from `firebase/firestore.rules` using the Firebase CLI or web console:
   ```bash
   firebase deploy --only firestore:rules
   ```
5. Register a Web App in your Firebase Project Settings, copy the configuration object, and paste it into `js/firebase.js`:
   ```javascript
   export const firebaseConfig = {
     apiKey: "YOUR_FIREBASE_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

> **Hackathon Demo Resilience**: CareerSetu includes an automated local storage fallback. If live Firebase credentials are not yet entered, all pages, forms, task toggles, and state persist locally in memory and `localStorage` so judges can test every feature without blockers!

---

## Gemini API Setup

1. Obtain a free Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Set the environment variable:
   - For local development with Vercel CLI: Create a `.env` file in the root folder:
     ```env
     GEMINI_API_KEY=AIzaSy...
     ```
   - For Vercel Cloud: Add `GEMINI_API_KEY` under **Project Settings → Environment Variables**.

---

## Local Development

You can run CareerSetu locally using either the Vercel CLI or any static web server:

### Option A: Using Vercel CLI (Recommended to run live AI serverless functions)
```bash
# 1. Install Vercel CLI globally if not already installed
npm install -g vercel

# 2. Start the local serverless development environment
vercel dev
```
Visit `http://localhost:3000` in your web browser.

### Option B: Using Simple Static Server
```bash
# Using Python
python -m http.server 8000

# Or using Node http-server
npx http-server -p 8000
```
Open `http://localhost:8000/index.html`.

---

## Vercel Deployment

1. Push your repository to **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of CareerSetu platform"
   git branch -M main
   git remote add origin https://github.com/your-username/careersetu.git
   git push -u origin main
   ```
2. Import the repository into **Vercel** (`https://vercel.com/new`).
3. Add the Environment Variable:
   - Key: `GEMINI_API_KEY`
   - Value: `<Your Google Gemini API Key>`
4. Click **Deploy**. Vercel will build both the static front-end assets and `/api` serverless functions automatically!

---

## Firestore Data Structure

All user records are isolated using the authenticated user's UID (`request.auth.uid`):

```
users/{uid}                    # Core user credentials and display profile
profiles/{uid}                 # Detailed academic records, skills, and goals
assessments/{uid}              # Career assessment survey responses
careerRecommendations/{uid}    # Gemini-generated career fit pathways
skillGaps/{uid}                # Target role benchmark analysis
roadmaps/{uid}                 # 6-Month task checklist with completion states
resumes/{uid}                  # ATS scores, keyword matching, and bullet rewrites
interviews/{uid}               # Mock interview transcripts and average scores
progress/{uid}                 # Consolidated readiness analytics
```

---

## Security

- **Zero Client-Side AI Key Exposure**: The Gemini API key resides solely in server-side Vercel environment variables (`process.env.GEMINI_API_KEY`). Client-side JavaScript makes standard REST calls to `/api/*`.
- **Firestore Security Rules**: Strict access control (`request.auth.uid == userId`) prevents unauthorized users from inspecting or modifying foreign profiles or roadmap records.
- **Sanitized Inputs & Safe Error Handling**: All API endpoints gracefully validate incoming payloads and return structured JSON responses with helpful fallbacks on network interruptions.

---

## Hackathon Demo Flow (Step-by-Step)

Judges can test the entire interconnected platform in less than 4 minutes:
1. **Landing Page**: Open `index.html` → explore hero journey diagram and features → click **Get Started**.
2. **Instant Auth**: On `pages/login.html`, click **"⚡ 1-Click Demo Login (Judge Test Account)"** to authenticate immediately without manual typing.
3. **Student Profile**: Navigate to `pages/profile.html` → click **"⚡ Prefill Demo Profile"** → review education, branch, and projects → click **Save Profile**.
4. **Career Assessment**: On `pages/assessment.html` → click **"⚡ Prefill Sample Responses"** → click **Submit Assessment**.
5. **AI Career Analysis**: Watch the real-time Gemini loading pulse → review Top 3 Career Pathways (Match %, Suitability, Required vs Missing Skills).
6. **Skill Gap Analysis**: On `pages/skill-gap.html`, inspect the visual proficiency meters and 8-week bridge curriculum.
7. **Learning Hub**: On `pages/learning.html`, filter verified courses and certifications → click **+ Track** to log study modules.
8. **Opportunities**: On `pages/opportunities.html`, search jobs/internships and click **Apply Now** to record an application.
9. **Government Opportunities**: On `pages/government.html`, review Central, State, and PSU openings with direct links to official notification portals.
10. **AI Resume Assistant**: On `pages/resume.html` → click **"⚡ Prefill Sample Resume"** → click **Analyze & Optimize** → inspect ATS score, missing keywords, and rewritten STAR bullet points.
11. **AI Mock Interview Room**: On `pages/interview.html` → select *Frontend Web Developer / Technical* → click **Begin Mock Interview** → click **"⚡ Quick-Fill Demo Answer"** → click **Submit Answer & Evaluate** to observe real-time technical accuracy and communication scores.
12. **6-Month Career Roadmap**: On `pages/roadmap.html`, toggle task badges (*○ Not Started* → *◐ In Progress* → *✓ Completed*) to observe live percentage updates.
13. **Progress Dashboard**: On `pages/progress.html`, review your holistic multi-pillar **Career Readiness Index (79%)** aggregating all completed milestones.

---

## Future Scope

- **Regional Indian Languages**: Multilingual prompt translations (Hindi, Tamil, Telugu, Marathi, Bengali) via Gemini's native multilingual understanding.
- **Institutional TPO Portals**: Aggregate dashboards allowing college Training & Placement Officers to track class-wide readiness and identify student skill deficiencies.
- **Official API Integrations**: Live sync with National Career Service (NCS) and verified public sector job feeds.
- **AI Voice Interviews**: Speech-to-text and text-to-speech audio streaming for hands-free mock interview simulations.

---

## License

This project is licensed under the MIT License — open for academic, student, and hackathon development.
