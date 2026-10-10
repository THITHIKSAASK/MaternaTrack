# MaternaTrack — Intelligent Maternal and Child Health Tracking, Immunization Scheduling and Follow-up System

> **Tagline:** From pregnancy registration to verified care completion.  
> **Assistant:** Materna Voice  
> **Demonstration Region:** Sathyamangalam and verified administrative areas of Erode district, Tamil Nadu, India.  
> **Notice:** *MaternaTrack is an independent academic prototype. It is not an official Government of India or Tamil Nadu government portal and does not replace professional medical care.*  
> **Dataset Status:** *Synthetic demonstration data — not real patient records.*

---

## 1. Project Overview & Purpose

MaternaTrack is a full-stack, role-based maternal and child healthcare tracking web application built to address common gaps in healthcare continuity across rural and semi-urban administrative blocks in Tamil Nadu.

### Core Healthcare Gaps Solved:
1. **Beyond Passive Reminders:** Traditional reminder systems stop at dispatching an SMS. MaternaTrack actively identifies overdue appointments, opens accountable follow-up tasks for community workers, and tracks contact outcomes (e.g. temporary migration, transport barriers, caregiver requested rescheduling).
2. **Mother-Child Connected Records:** Directly connects a mother's antenatal check-ups (ANC-1 to ANC-4), Td immunizations, ultrasound investigations, and delivery details with her newborn child's National Immunization Schedule (NIS).
3. **Accountable Multi-Role Coordination:** Seamless persistent database coordination between Parents/Caregivers, Health Workers (ASHA/VHN), Clinicians (DGO), and Administrative Supervisors (DDHS Erode).
4. **Enforced Verification Boundaries:**
   - Services are never marked verified merely because a reminder was sent or a button was clicked.
   - Clinical cases requiring specialist approval require review by an authorized clinician—uploading a supporting document alone does not automatically grant approval.
   - Doctor appointments enforce automatic conflict detection and break-time blocking (`13:00 - 14:00`).
5. **Full Bilingual Localization:** Complete interface and notification support in **English** and **Tamil (தமிழ்)** with browser-based voice assistance via **Materna Voice**.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **Styling & Design System:** Tailwind CSS with official public-health palette tokens
- **Icons:** Lucide React
- **Routing:** React Router v6
- **State & Server Fetching:** Custom responsive API client with cookies and localStorage auth token fallback
- **Localization:** `i18next` and `react-i18next` with comprehensive English and Tamil dictionaries
- **Analytics Visualizations:** Recharts (BarChart & PieChart)
- **PDF Generation:** Client-side jsPDF with styled MaternaTrack headers, official citations, and metadata

### Backend
- **Runtime:** Node.js v20+ with Express
- **Language:** TypeScript
- **Database & ORM:** SQLite (`dev.db`) with Prisma ORM
- **Authentication & Security:** Argon2 / Bcrypt password hashing, JSON Web Tokens (JWT), HTTP-only cookies, server-side RBAC
- **File Handling:** Multer with file-type validation (PDF, JPG, PNG) and non-executable storage
- **Validation & Business Logic:** Domain services for appointment conflicts, break protection, reminder generation, and critical follow-up closure

### Testing & Verification
- **Test Runner:** Vitest
- **Test Coverage:** Automated unit & integration tests for:
  - Appointment overlap conflict calculations
  - Break-time blocking intervals
  - Critical task closure guard rules
  - Deterministic reminder engine & duplicate suppression

---

## 3. Architecture & Data Model

The application uses a persistent relational database schema in SQLite via Prisma:

- `User`: Roles `PARENT`, `HEALTH_WORKER`, `DOCTOR`, `ADMIN` with bcrypt password hashes.
- `ParentProfile`: Contact details, village, emergency contacts.
- `HealthWorkerProfile`: Designation (`VHN` / `ASHA`), worker code (`VHN-SAT-04`), assigned area.
- `ClinicianProfile`: DGO qualification, institution, year, registration number, consultation hours, break timings (`13:00 - 14:00`), verification status.
- `CredentialVerification`: Admin-controlled verification records for clinician credentials.
- `AdministrativeArea`: Erode District → Sathyamangalam / Bhavanisagar Blocks → Ukkaram, Rangasamudram, Alathucombai, Rajannagar Village Panchayats.
- `HealthFacility`: Sathyamangalam Government Hospital, Sathyamangalam Upgraded PHC, Ukkaram Additional PHC, Alathucombai Health Sub-Centre.
- `Beneficiary`: Mother and Child records with unique IDs (e.g. `TN-ERD-SAT-M001`, `TN-ERD-SAT-C001`).
- `Pregnancy`: Active gestational tracking, LMP, EDD, gravidity, parity, high-risk flags.
- `MaternalService`: ANC-1, ANC-2, ANC-3, ANC-4, Td-1, Td-2, IFA distribution, ultrasound scans, delivery details.
- `Vaccine` & `ChildImmunizationRecord`: Full National Immunization Schedule (BCG, OPV, Hep B, Pentavalent, Rotavirus, fIPV, PCV, MR, DPT Boosters, Td).
- `FollowUpTask`: Overdue service tracking, assigned worker, priority, contact attempt counter, next actions.
- `ContactAttempt`: Timestamped log with method (`HOME_VISIT`, `PHONE_CALL`), outcome, and missed visit reasons.
- `Referral` & `ClinicalReview`: Worker-to-Doctor specialist referrals and DGO clinical reviews.
- `SupportingDocument`: File upload records linked to tasks and referrals.
- `Reminder`: Rule-generated advance (3 days), due today, and overdue (7 days) reminders.
- `ParentChangeRequest`: Auditable queue for mobile/address updates.
- `Article`: Public health guidance and historical evolution milestones.
- `AuditLog`: Immutable security audit log of all sensitive operations.

---

## 4. Demo Login Accounts (Synthetic Data)

| Role | Demo Email | Password | Persona & Scope |
|---|---|---|---|
| **Parent / Caregiver** | `parent.demo@materna.local` | `DemoParent@2026` | Kausalya Manickam (Mother of infant Aarav, 28 wks pregnant, Ukkaram) |
| **Health Worker** | `worker.demo@materna.local` | `DemoWorker@2026` | Priya R, VHN (Worker Code: `VHN-SAT-04`, Sathyamangalam / Ukkaram) |
| **Clinician (Doctor)** | `doctor.demo@materna.local` | `DemoDoctor@2026` | Dr. Malathi Sundaram, MBBS, DGO (Sathyamangalam Government Hospital) |
| **Administrator** | `admin.demo@materna.local` | `DemoAdmin@2026` | Dr. S. Karthikeyan, DDHS Erode (System Governance & Credential Review) |

*Quick login buttons are available directly on the login page for instant role switching.*

---

## 5. Prerequisites & Software Versions

- **Node.js:** v20.x or higher (`v20.16.0` tested)
- **npm:** v10.x or higher (`10.8.1` tested)
- **Operating System:** Windows, macOS, or Linux

---

## 6. Installation & Setup Instructions

### 1. Clone & Install Root Dependencies
```bash
git clone <repository-url>
cd "MATERNAL AND CHILD HEALTH PROGRAM BENEFICIARY TRACKING AND IMMUNIZATION REMINDER SYSTEM"
npm install
```

### 2. Install Server Dependencies & Setup Database
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run seed
```

### 3. Install Client Dependencies
```bash
cd ../client
npm install
```

---

## 7. Starting the Application

You can run both client and server from the root directory or in separate terminal tabs:

### Option A: From Root
```bash
npm run dev
```

### Option B: In Separate Terminals
**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
```
*Server runs on:* `http://localhost:5000`  
*Health Check:* `http://localhost:5000/api/health`

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
*Client runs on:* `http://localhost:5173`

---

## 8. Verification & Test Commands

### Run Backend Unit & Integration Tests:
```bash
cd server
npm test
```
*Verifies 7 workflow rule tests including appointment conflict detection, break-time blocking, critical follow-up task closure guards, and reminder engine duplicate suppression.*

### Build Frontend & Backend for Production:
```bash
# Build Server
cd server
npm run build

# Build Client
cd ../client
npm run build
```

---

## 9. Database Reset & Reseed Instructions

To reset the database to a clean deterministic demonstration state:
```bash
cd server
npm run seed
```
This cleans prior test data, populates Erode administrative areas, seeds official vaccines, creates all 4 demo user accounts, generates synthetic beneficiaries, initializes maternal timelines and follow-up tasks, and seeds educational articles.

---

## 10. Official Public-Health Reference Sources

- **Ministry of Health and Family Welfare (MOHFW) - RMNCH+A Portal:**  
  URL: `https://rmnch.mohfw.gov.in/` (Reviewed: Jan 2024)
- **National Immunization Schedule (NIS):**  
  URL: `https://www.mohfw.gov.in/sites/default/files/Universal.pdf` (Reviewed: Feb 2024)
- **Tamil Nadu Directorate of Public Health and Preventive Medicine:**  
  URL: `https://www.tnhealth.org/directorate/dphis.php` (Reviewed: Mar 2024)
- **Erode District Administration:**  
  URL: `https://erode.nic.in/development-administration/` (Verified: Sathyamangalam, Bhavanisagar, Gobichettipalayam blocks)
- **World Health Organization (WHO) Vaccines Guidance:**  
  URL: `https://www.who.int/` (Reviewed: Jan 2024)

---

## 11. External Integration Notice & Limitations

- **SMS / WhatsApp Gateways:** Running in internal **Local Simulation Mode**. Reminder timestamps and message templates in English and Tamil are saved in the database with status `SIMULATED_SENT`. No third-party SMS costs are required for local testing.
- **AI Voice Assistant (Materna Voice):** Uses in-browser Speech Recognition (`en-IN`, `ta-IN`) and Speech Synthesis (TTS). Grounded in verified MOHFW guidance with fallback in deterministic verified mode without requiring paid API keys.
- **Synthetic Data Disclaimer:** All patient records, addresses, registration codes, and contact numbers are synthetic demonstration data created for academic validation.
