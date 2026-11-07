# Flixora Movie Explorer

Flixora is a full-stack movie and TV discovery platform built with React on the frontend and Express on the backend. It pulls metadata from TMDB, stores user data in MongoDB, and supports personalized account features such as favorites, watchlists, and watch history.

## Overview

Flixora helps users discover trending titles, search by genre or keyword, browse curated collections, and explore detailed information about movies and shows. Users can create accounts, save favorites, track what they have watched, and manage profile details with email verification and account recovery flows.

## Features

- Browse movies and TV shows by popularity, ratings, release status, and streaming availability.
- Search titles and explore genres, languages, and curated collections such as Marvel, DC, and Star Wars.
- View title details including trailers, cast, recommendations, watch providers, and reviews.
- Create an account and manage favorites, a watchlist, and watch history.
- Use profile management features, email verification, and admin tools.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Cache/session support: Redis
- External API: TMDB
- Media storage: Cloudinary
- Email delivery: SMTP

## Requirements

Before you begin, make sure you have:

- Node.js and npm
- MongoDB running locally or via a cloud provider
- Redis running locally or via a managed service
- A [TMDB API key](https://www.themoviedb.org/settings/api)
- Cloudinary credentials for avatar uploads
- SMTP credentials for email verification and password recovery

## Quick Start

Clone the repository and configure both apps.

### 1) Install backend dependencies

```powershell
cd Backend
npm install
Copy-Item .env.sample .env
```

Update `Backend/.env` with the required values:

- `MONGODB_URI` — MongoDB connection string
- `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD` — Redis connection settings
- `TMDB_API_KEY` — your TMDB API key
- `JWT_SECRET` — a secure private secret for token signing

The backend defaults to port `5000`. Additional email, Cloudinary, and `FRONTEND_URL` values can be configured in `.env.sample` and the `.env` file.

### 2) Install frontend dependencies

From the repository root:

```powershell
cd Frontend
npm install
Copy-Item .env.sample .env
```

Set `VITE_API_URL` in `Frontend/.env` if you want to override the default API URL:

- Default API: `http://localhost:5000/api`

### 3) Run the apps

Start the frontend:

```powershell
cd Frontend
npm run dev
```

The frontend will be available at [http://localhost:5173](http://localhost:5173).

Start the backend in a separate terminal:

```powershell
cd Backend
npm run dev
```

The API runs at [http://localhost:5000](http://localhost:5000), and the root endpoint (`GET /`) returns a server status message.

## Useful Commands

Run the commands in the relevant app directory.

| App | Command | Description |
| --- | --- | --- |
| Frontend | `npm run dev` | Start the Vite development server |
| Frontend | `npm run build` | Create a production build in `Frontend/dist` |
| Frontend | `npm run lint` | Run ESLint |
| Frontend | `npm run preview` | Preview the production build |
| Backend | `npm run dev` | Start the API with Nodemon |
| Backend | `npm start` | Start the API |

## Project Structure

```text
Backend/    Express API, MongoDB models, authentication, and TMDB integration
Frontend/   React and Vite application
README.md   Project overview and setup guide
```

See [Backend/README.md](./Backend/README.md) for backend API details. Frontend configuration is documented in [Frontend/.env.sample](./Frontend/.env.sample), and backend configuration is documented in [Backend/.env.sample](./Backend/.env.sample).

## Security

Keep `.env` files, API keys, passwords, and signing secrets private. Do not commit real credentials or sensitive configuration to version control.
