# LifeSaver 110 🩸

> Emergency Blood Donor Matching Web Application

## Problem
In emergencies, hospitals cannot find required blood (especially rare groups) in time, leading to preventable deaths.

## Solution
LifeSaver 110 is a web application that connects verified hospitals with nearby blood donors through automated IVR calls on toll-free number **110**.

## How It Works
1. **Donor Registers** — Students register with blood group, location, and consent to receive calls
2. **Hospital Requests Blood** — Verified hospitals submit emergency blood requests
3. **System Auto-Calls Donors** — Matching donors get called on 110, press 1 (Yes) or 0 (No)
4. **Hospital Gets Shortlist** — Receptionist sees list of donors who said YES

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB Atlas
- **Auth**: JWT + bcrypt
- **Telephony**: Twilio Programmable Voice (IVR)
- **Deployment**: Railway (backend) + Netlify (frontend)

## Roles
| Role | Access |
|------|--------|
| Donor (Student) | Register, manage profile, toggle availability |
| Hospital (Verified) | Create blood requests, view shortlisted donors |
| Admin | Approve hospitals, manage donors, view stats |

## Features
- Role-based authentication (Donor / Hospital / Admin)
- Automated donor matching by blood group + location + eligibility
- IVR auto-calling system (press 1 = Yes, press 0 = No)
- Real-time shortlisted donor list for hospitals
- Admin dashboard for monitoring and management
- 12 integration tests passing

## Getting Started

### Backend
```bash
cd backend
npm install
npm run dev
