# Boink Client

React/Vite frontend for the Boink social app.

## Local development

1. Install dependencies with `npm install`.
2. Start the frontend with `npm run dev`.
3. Run the Express API separately. The Vite development proxy expects it at `http://localhost:5000`.

## Deploy to Vercel

Import this repository as its own Vercel project. Use the repository root, build command `npm run build`, and output directory `dist` (Vite is normally auto-detected).

Set the Vercel production environment variable `VITE_API_URL` to your Render API origin, for example `https://your-api.onrender.com`. You may also include `/api`; the client normalizes either form to exactly one `/api` prefix. Redeploy after changing this variable.

For local development, leave `VITE_API_URL` unset. Vite serves the frontend on port 3000 and proxies `/api` requests to `http://localhost:5000` as configured in `vite.config.js`.

### Render API environment variables

Configure these on the Render backend service (not in this client repository):

- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — strong, unique signing secret
- `JWT_EXPIRES_IN` — `7d` (optional; the server defaults to this)
- `NODE_ENV` — `production`
- `CLIENT_URL` — exact Vercel site origin, such as `https://your-site.vercel.app`, with no path or trailing slash
- `PORT` — provided automatically by Render; do not set it manually unless required by the service

Never place MongoDB credentials or the JWT secret in this frontend repository or in a `VITE_*` variable.
