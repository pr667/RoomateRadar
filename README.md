# RoommateRadar

RoommateRadar is a web application for finding compatible roommates and shared housing. People looking for a room can browse and compare listings, save options, and contact hosts. Hosts can publish listings and manage incoming requests. Accepted requests unlock a private conversation between the people involved.

## Contents

- [Features](#features)
- [Technology](#technology)
- [How matching works](#how-matching-works)
- [Requirements](#requirements)
- [Run locally](#run-locally)
- [Environment configuration](#environment-configuration)
- [Application structure](#application-structure)
- [API overview](#api-overview)
- [External services](#external-services)
- [Security and operational notes](#security-and-operational-notes)
- [Known limitations](#known-limitations)

## Features

### Room seekers

- Create an account, verify an email address, sign in, and reset a forgotten password.
- Set up a profile and roommate preferences.
- Browse listings by location, rent range, room type, and amenities. Results support pagination and sorting.
- Compare compatibility scores, save listings to a shortlist, and submit a request to a host.
- Start a private conversation after a host accepts a request.

### Hosts

- Create and manage room listings, including photos and listing availability.
- Review incoming requests and accept or decline them.
- Chat with a seeker after accepting their request.

### Administrators

- View administrative statistics and user/listing collections.
- Disable or re-enable accounts and listings.

### Shared

- Responsive React interface with location maps.
- Live chat delivery using Socket.IO.
- Profile avatars and listing photo uploads.

## Technology

| Area | Technology |
| --- | --- |
| Frontend | React 18, Vite, React Router, Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose 9 |
| Authentication | JSON Web Tokens and email verification |
| Live messaging | Socket.IO |
| Image storage | Cloudinary |
| Maps | Leaflet, OpenStreetMap tiles, and Nominatim geocoding |
| Email | Gmail SMTP with STARTTLS |

## How matching works

Listings can be ranked by a compatibility score calculated from the seeker’s preferences and the host/listing information. Budget contributes 20 points; gender preference, smoking, pets, food, sleep schedule, noise, cleanliness, and work schedule contribute 10 points each. The score is a heuristic to help compare options; it is not a guarantee that two people will be compatible. Missing preference data can affect the score.

## Requirements

- Node.js **20.19 or newer** (Node.js 24 LTS is also suitable) and npm.
- A MongoDB database, such as MongoDB Atlas.
- Gmail SMTP credentials. For Gmail, use a Google App Password when two-step verification is enabled; do not use your normal account password.
- Cloudinary credentials for avatar and listing photo uploads.

The frontend and backend are separate npm applications. Install and run their dependencies from their respective directories.

## Run locally

### 1. Configure the backend

In a terminal at the repository root:

```powershell
cd backend
npm ci
```

Create `backend/.env` using the variables in [Environment configuration](#environment-configuration). Keep this file local; it is ignored by Git. Then start the API:

```powershell
npm run dev
```

The backend listens on `http://localhost:5000` by default. Its health endpoint is `GET /api/health`.

### 2. Configure and run the frontend

Open a second terminal at the repository root:

```powershell
cd frontend
npm ci
npm run dev
```

Vite prints the local web URL when it starts (normally `http://localhost:5173`). The frontend API base URL is `VITE_API_URL`; the checked-in local default points to `http://localhost:5000/api`. To override it locally, create `frontend/.env.local` and set `VITE_API_URL` there. Restart Vite after changing frontend environment variables.

### Production frontend build

```powershell
cd frontend
npm run build
npm run preview
```

`npm run preview` serves the built frontend for local inspection. Deploy the generated `frontend/dist` directory using a static hosting service, and deploy the backend separately as a Node.js service.

## Environment configuration

Create `backend/.env` locally. Use your own service credentials and do not commit this file:

```dotenv
PORT=5000
MONGO_URI=mongodb+srv://<db-user>:<url-encoded-password>@<cluster-host>/roomateradar?retryWrites=true&w=majority
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

EMAIL_USER=<gmail-address>
EMAIL_PASS=<google-app-password>

CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
```

Replace every placeholder. URL-encode special characters in the MongoDB username or password. In production, set the same values through the hosting provider’s environment-variable configuration rather than adding an `.env` file to the deployment or repository. Use a unique, randomly generated `JWT_SECRET` and keep all credentials private.

The frontend variable is a URL, not a credential:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

For a deployed frontend, set `VITE_API_URL` to the deployed API’s `/api` base URL at build time. Variables prefixed with `VITE_` are included in browser code and must never contain secrets.

## Application structure

```text
roomateradar/
├── backend/
│   ├── config/          # Database and service configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication, authorization, and validation helpers
│   ├── models/          # Mongoose schemas
│   ├── routes/          # REST API routes
│   ├── utils/           # Tokens, email, and shared helpers
│   └── server.js        # Express and Socket.IO startup
└── frontend/
    ├── src/             # React application, pages, components, and API client
    ├── public/          # Static frontend assets
    └── vite.config.js
```

The main data models are users, listings, requests, conversations, messages, and ratings. The backend mounts route groups under `/api/auth`, `/api/users`, `/api/listings`, `/api/requests`, `/api/chat`, `/api/ratings`, and `/api/admin`.

## API overview

The API returns JSON. Protected routes require a valid bearer token in the `Authorization` header (`Authorization: Bearer <token>`). Routes under the admin group additionally require an administrator account. See the route files in `backend/routes/` for request/response fields and validation rules.

| Route group | Representative operations | Access |
| --- | --- | --- |
| `/api/health` | Service health check | Public |
| `/api/auth` | Register, verify/resend email code, login, get current user, request/reset password | Mixed; verification and login flows are public |
| `/api/users` | View profiles, update profile/preferences, upload avatar, manage shortlist | Authenticated; some profile reads are public |
| `/api/listings` | Browse/filter listings, view a listing, create/update/toggle/delete listings and photos | Browsing requires authentication; listing detail is public; management is host-only and owner-checked |
| `/api/requests` | Submit and view requests, accept/decline incoming requests, withdraw a request | Seekers submit/withdraw; hosts manage incoming requests |
| `/api/chat` | List conversations, retrieve messages, send a message | Authenticated conversation participants |
| `/api/ratings` | Submit a rating and view ratings for a user | Submission requires an eligible accepted interaction; reads are public |
| `/api/admin` | View stats and manage users/listings | Administrator only |

Listing browse filters include location, rent bounds, room type, amenities, page, page size, and sort order. Supported sort options include compatibility, ascending/descending rent, and newest. Check the route/controller implementation for exact query parameter names and accepted values.

## External services

- **MongoDB:** Stores application data. The backend connects using `MONGO_URI`.
- **Gmail SMTP:** Sends verification and account emails using `EMAIL_USER` and `EMAIL_PASS` over port 587 with STARTTLS.
- **Cloudinary:** Stores uploaded avatars and listing images. Uploads are held in memory during request handling; each file is limited to 5 MB and listing upload requests accept up to 10 images.
- **OpenStreetMap/Nominatim:** Leaflet displays map tiles and Nominatim is used for address geocoding. Use of these public services is subject to their usage policies and availability.

## Security and operational notes

- Never commit `.env` files, app passwords, API secrets, database credentials, or JWT secrets. The backend environment file is ignored by Git.
- Rotate any credential that has been shared or exposed, and update the relevant deployment environment variables.
- Use HTTPS in production, set production-specific allowed client origins, and configure provider secrets through the deployment platform.
- JWTs are bearer tokens managed by the frontend. Treat a token like a password and sign out on shared devices.
- Chat access is restricted to authenticated members of the relevant conversation. Do not expose private user fields in public profile or listing responses.
- Configure MongoDB Atlas network access and database-user permissions for the deployment environment; avoid broad network rules where possible.

## Known limitations

- Compatibility ranking is a simple weighted heuristic and should be treated as guidance.
- Compatibility sorting ranks the filtered listing set in the backend before paginating, which may need database-side optimization as listing volume grows.
- Map tiles and geocoding rely on public OpenStreetMap services and are not covered by an application-specific service-level agreement.
- The ratings API is present, but the frontend does not currently provide a rating submission flow.
- The backend package does not currently define an automated test suite; validate changes with an appropriate test plan before deployment.

## License

No license is currently specified. Add a `LICENSE` file before distributing or reusing this project under open-source terms.
