# Flixora Movie Explorer

Flixora is a movie and TV discovery app built with React and Express. It uses TMDB for its title catalog and MongoDB for user data.

## Features

- Browse movies and TV shows by popularity, ratings, upcoming releases, and theatrical or streaming availability.
- Search titles and explore genres, languages, and curated collections such as Marvel, DC, and Star Wars.
- View title details, trailers, cast, recommendations, watch providers, and reviews.
- Create an account and manage favorites, watchlist, and watch history.
- Includes profiles, email verification, and admin tools.

## Requirements

- Node.js and npm
- MongoDB
- Redis
- A [TMDB API key](https://www.themoviedb.org/settings/api)

Cloudinary credentials are needed for avatar uploads. SMTP credentials are needed for email verification and password recovery.

## Setup

Clone the repository, then install dependencies and configure each app.

### Backend

In a terminal:

```powershell
cd Backend
npm install
Copy-Item .env.sample .env
```

Edit `Backend/.env` and set at least:

- `MONGODB_URI` — your MongoDB connection string.
- `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD` — your Redis connection settings. For a local Redis instance with no password, leave `REDIS_PASSWORD` empty.
- `TMDB_API_KEY` — your TMDB API key.
- `JWT_SECRET` — replace the sample value with a long, private secret.

The backend listens on port `5000` by default. Configure email, Cloudinary, and `FRONTEND_URL` if needed; the defaults are documented in `.env.sample`.

### Frontend

In a second terminal from the repository root:

```powershell
cd Frontend
npm install
Copy-Item .env.sample .env
npm run dev
```

The frontend runs at [http://localhost:5173](http://localhost:5173). Its API URL defaults to `http://localhost:5000/api`; set `VITE_API_URL` in `Frontend/.env` to override it.

### Start the backend

In another terminal:

```powershell
cd Backend
npm run dev
```

The API is available at [http://localhost:5000](http://localhost:5000). Ensure MongoDB and Redis are running before starting the backend. Its root endpoint (`GET /`) returns a server status message.

## Useful commands

Run these from the corresponding `Frontend` or `Backend` directory:

| App | Command | Description |
| --- | --- | --- |
| Frontend | `npm run dev` | Start the Vite development server |
| Frontend | `npm run build` | Create a production build in `Frontend/dist` |
| Frontend | `npm run lint` | Run ESLint |
| Frontend | `npm run preview` | Preview the production build |
| Backend | `npm run dev` | Start the API with Nodemon |
| Backend | `npm start` | Start the API |

## Project layout

```text
Backend/    Express API, MongoDB models, authentication, and TMDB integration
Frontend/   React and Vite application
```

See [Backend/README.md](./Backend/README.md) for backend API details. Frontend configuration is documented in [Frontend/.env.sample](./Frontend/.env.sample); backend configuration is documented in [Backend/.env.sample](./Backend/.env.sample).

## Security

Keep `.env` files and all API keys, passwords, and signing secrets private. Do not commit real credentials.
