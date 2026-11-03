# Flixora Backend

The backend is a Node.js/Express API for the Flixora Movie Explorer. It provides authentication, user and movie-library features, administration, and a server-side integration with The Movie Database (TMDB).

## Requirements

- Node.js and npm
- MongoDB
- Redis
- A TMDB API key

Cloudinary and SMTP credentials are needed for avatar uploads and email features, respectively.

## Getting started

From the `Backend` directory:

```bash
npm install
```

Copy `.env.sample` to `.env`, then set the values for your local environment. In particular, configure `MONGODB_URI`, `JWT_SECRET`, `TMDB_API_KEY`, and the Redis connection. Set `FRONTEND_URL` to the frontend origin if it differs from `http://localhost:5173`.

Start the API:

```bash
npm run dev
```

Use `npm start` to run without the development file watcher. The server defaults to port `5000`; set `PORT` to override it. The root endpoint `GET /` returns a simple server-running status response.

## Configuration

The available environment variables are documented in `.env.sample`:

| Variable group | Purpose |
| --- | --- |
| `NODE_ENV`, `PORT` | Runtime mode and HTTP port |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET`, `JWT_EXPIRE`, `JWT_COOKIE_EXPIRE` | Authentication token and cookie settings |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` | Redis connection |
| `TMDB_API_KEY`, `TMDB_BASE_URL` | TMDB API integration |
| `CLOUDINARY_*` | Image upload configuration |
| `EMAIL_*` | Email and password-reset delivery |
| `FRONTEND_URL` | Allowed frontend origin for credentialed CORS |

Keep real credentials in `.env`; do not commit them.

## API overview

All API routes use the `/api` prefix. JSON requests and responses are used unless a route handles an uploaded file. Routes that require a signed-in user use the authentication middleware; admin routes additionally require an administrator role.

| Prefix | Purpose |
| --- | --- |
| `/api/auth` | Sign up, OTP verification/resend, login, logout, current-user lookup, and password recovery |
| `/api/users` | Profile updates, avatar upload, password change, and public profile lookup |
| `/api/favorites` | Add, list, check, and remove favorite movies |
| `/api/watch-history` | Add, list, and clear watch history |
| `/api/watchlist` | Add, list, and remove watchlist entries |
| `/api/reviews` | Read movie reviews; create, update, delete, and like reviews; list the current user's reviews |
| `/api/tmdb` | Browse, search, and discover TMDB movies and TV, and retrieve details for titles, seasons, episodes, collections, and people |
| `/api/genres` and `/api/tmdb/genres` | Retrieve movie or TV genres |
| `/api/admin` | Admin-only movie and user management and dashboard statistics |

For detailed paths, accepted parameters, and validation rules, see the route files in `src/routes/`.

## Project structure

```text
Backend/
  server.js              # Loads environment, connects services, starts HTTP server
  src/
    app.js               # Express middleware and route mounting
    config/              # MongoDB, Redis, TMDB, email, and Cloudinary setup
    controllers/         # HTTP request handlers
    middlewares/         # Authentication, authorization, validation, uploads, rate limits
    models/              # Mongoose data models
    routes/              # API route declarations
    services/            # External integrations and reusable business services
    templates/           # Email templates
    utils/               # Shared response, error, token, and OTP helpers
    validators/          # Request validation rules
```

## Runtime behavior

Express applies Helmet security headers, request logging, JSON and URL-encoded body parsing, cookie parsing, credentialed CORS, and API rate limiting. Validation is attached to relevant routes, and a centralized error handler processes route errors. MongoDB is connected when the server starts; Redis is initialized by its configuration module.

## Tests

The current `package.json` does not define an automated test suite; `npm test` exits with a “no test specified” message.
