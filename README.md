# RoommateRadar 🏠🔍

A smart roommate finder platform that matches students and working professionals based on lifestyle preferences, budget, and location.

## Project Overview

**Status:** Day 1 Complete (Backend & Frontend Setup)  
**Timeline:** 7-day build sprint  
**Team Size:** [Add your team info]

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcryptjs
- **Real-time:** Socket.io
- **File Upload:** Cloudinary (config not yet added)

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (planned)
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Real-time:** Socket.io Client
- **Maps:** Leaflet.js + react-leaflet

## Project Structure

```
RoommateRadar/
├── backend/
│   ├── config/          (Database, Cloudinary config)
│   ├── middleware/      (Auth, Role checking)
│   ├── models/          (MongoDB schemas)
│   ├── routes/          (API endpoints)
│   ├── controllers/     (Business logic)
│   ├── utils/           (JWT, compatibility algorithm)
│   ├── server.js        (Express app)
│   ├── .env             (Environment variables)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/         (Axios instance)
    │   ├── context/     (Auth, Socket context)
    │   ├── hooks/       (Custom hooks)
    │   ├── pages/       (Route pages)
    │   ├── components/  (Reusable components)
    │   ├── utils/       (Helpers)
    │   ├── main.jsx
    │   └── App.jsx
    ├── public/
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## User Roles

- **Seeker:** Looking for a room/roommate
- **Host:** Listing rooms for rent
- **Admin:** Platform management

## Core Features

- ✅ Authentication & role-based onboarding
- ⏳ Preference profile setup (food, sleep, smoking, pets, budget, gender)
- ⏳ Room listings with photos & amenities
- ⏳ Compatibility score algorithm
- ⏳ Browse with filters + match % sorting
- ⏳ Request system (Send Interest → Accept/Reject → Chat unlocks)
- ⏳ Real-time chat
- ⏳ Shortlist & comparison
- ⏳ Ratings & trust score system
- ⏳ Role-based dashboards

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (free tier available)
- Git

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   - Copy `.env.example` to `.env` (template provided below)
   - Add your MongoDB URI
   - Add JWT secret
   - Add Cloudinary credentials

4. **Start server:**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```
   App runs on `http://localhost:5173`

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/roommateradar
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

## API Endpoints (Day 1)

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

## Development Roadmap

| Day | Backend | Frontend | Goal |
|-----|---------|----------|------|
| 1 ✅ | Auth system, models setup | Routing, Auth context | Backend & frontend initialized |
| 2 | User preferences, profile updates | Onboarding form, avatar upload | Profile setup complete |
| 3 | Listing CRUD, photo upload | CreateListing form, map | Host can post rooms |
| 4 | Compatibility algorithm, listing filters | Browse page, match badges | Seeker sees ranked listings |
| 5 | Request system, conversations | Socket.io chat | Real-time chat unlocks |
| 6 | Shortlist, ratings, dashboards | Comparing, rating UI | All dashboards working |
| 7 | Admin endpoints, bug fixes | Polish, deploy | Live on production |

## Team Workflow

### Git Branches
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/day2-preferences` - Feature branches (daily)

### Commit Messages
```
[Day 1] Initial project setup
[Day 2] Add user preferences endpoint
[Feature] Add Socket.io chat integration
```

### Code Review
1. Create feature branch
2. Make changes & commit
3. Push to GitLab
4. Create Merge Request
5. Team review & approval
6. Merge to develop, then main

## Testing

### Backend Verification (Postman)
```
POST http://localhost:5000/api/auth/register
Headers: Content-Type: application/json
Body:
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "seeker"
}
```

Expected response:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "_id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "seeker",
    "isProfileComplete": false
  }
}
```

## Important Notes

⚠️ **Never commit:**
- `.env` files (contains secrets)
- `node_modules/` folders
- Build outputs
- IDE config files

✅ **Always commit:**
- `package.json` & `package-lock.json`
- Source code
- `.gitignore`
- `README.md` & docs

## Resources

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Cloudinary](https://cloudinary.com/)
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [Socket.io](https://socket.io/)

## Team Members

[Add your team members here]

## Questions?

Check the planning document or reach out in the team chat!

---

**Last Updated:** March 25, 2026  
**Next Milestone:** Day 2 - User Preferences & Onboarding
